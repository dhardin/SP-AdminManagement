<script>
  export default {
    methods: {
      save: function(){
      this.isSaving = true;
      this.progress = 0;
      this.failedItems = [];
      this.metrics.start = new Date();
      this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Saving ' + (this.type.users ? 'Groups' : 'Users'), target: this.selectedItem.Title,  url: this.siteCollection.url,  type: 'warning'});
      this.saveIndex = 0;
      //reset errored out items
      this.$lodash.forEach(this.failedItems, function(o){
        o.hasError = false;
      });

      (function(that){
        var promiseArr = [];
        var i;

        new Promise(function(resolve, reject){
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Digest', target: '',  url: that.siteCollection.url,  type: 'warning'});
          that.getDigest(that.siteCollection, function(digest){
            that.digest = digest;
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Fetching Digest', target: '', url: that.siteCollection.url,  type: 'info'});
            resolve();
          }, function(error){
            that.messages.push({date: new Date(), verb: that.actions.Failed, text: 'Fetching Digest', target: '',  hasError: true, message: error.message, url: that.siteCollection.url,  type: 'error'});
            resolve();
          });
        }).then(function(result){
          that.saveItemsSync(that.newItems).then(function(result){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Saving ' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.LoginName, url: that.siteCollection.url, type: 'info'});
            that.isSaving = false;
            that.metrics.end = new Date();
            that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
            that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
            that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'});
            //set new items to failed items as these are still "new" and need to be processed.
            that.newItems = that.failedItems;
            that.originalAssignedItems = JSON.parse(JSON.stringify(that.$lodash.partition(that.assignedItems, function(assignedItem){
              return that.$lodash.find(that.newItems, function(newItem){
                return newItem.LoginName == assignedItem.LoginName;
              }) === undefined;
            })));
            that.originalAvailableItems = JSON.parse(JSON.stringify(that.$lodash.partition(that.availableItems, function(availableItem){
              return that.$lodash.find(that.newItems, function(newItem){
                return newItem.LoginName == availableItem.LoginName;
              }) != undefined;
            })));
          });
        });
      })(this);
    },
    saveItemsAsync: function(items){
      this.metrics.numFailed = 0;
      this.metrics.numSuccesses = 0;
      var message =  {type: 'table', pagination: {
        sortBy: 'operation',
        descending: false
      },
      search: '',headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []};
      var messageList = message.rows;
      this.messages.push(message);
      var promiseArr;
      (function(that){
        promiseArr = items.map(function(item){
          return that.saveItemAsync(item, messageList);
        });
      })(this);
      return Promise.all(promiseArr);
    },
    saveItemAsync: function(item, messageList){
      var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
      var preposition = item.operation == 'add' ? (this.type.user ? 'for' : 'to') : (this.type.user ? 'for' :'from');
      messageList.push({status: 'pending', url: this.siteCollection.url, target: this.selectedItem.Title, operation: operationText + ' ' + item.Title, error: {expanded: false, message: '', title: ''}});
      var message = messageList[messageList.length - 1];
      var promise;
      (function(that){
        promise = new Promise(function(resolve, reject){
          that[item.operation == 'add' ? 'addUserToGroup' : 'removeUserFromGroup'](that.siteCollection, that.digest, that.type.users ? item.Id : that.selectedItem.Id, that.type.groups ? item : that.selectedItem,function(results){
            var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
            var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
            that.metrics.numSuccesses++;
            item.isNew = false;
            item.hasError = false;
            that.progress += 100/that.newItems.length;
            message.status = 'done';
            return resolve();
          }, function(error){
            var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
            var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
            item.hasError = true;
            that.failedItems.push(item);
            message.status = 'done';
            message.error = {expanded: false, message: error.stack, title: error.message};
            that.progress += 100/that.newItems.length;
            that.metrics.numFailed++;
            return resolve();
          })
        });
      })(this);
      return promise;
    },
    saveItemsSync: function(items){
      this.metrics.numFailed = 0;
      this.metrics.numSuccesses = 0;
      var i;
      var message =  {type: 'table', pagination: {
        sortBy: 'operation',
        descending: false
      },
      search: '',headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []};
      var messageList = message.rows;
      var operationText;
      var item;
      var preposition
      this.messages.push(message);
      for(i = 0; i < items.length; i++){
        item = items[i];
        operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
        preposition = item.operation == 'add' ? (this.type.user ? 'for' : 'to') : (this.type.user ? 'for' :'from');
        messageList.push({status: 'pending', url: this.siteCollection.url, target: this.selectedItem.Title, operation: operationText + ' ' + item.Title, error: {expanded: false, message: '', title: ''}});
      }
      return (function(that){
        return items.reduce(function(promise, item, index){
          return promise.then(function (result) {
            return that.saveItemSync(item, messageList[index]);
          }).catch(console.error);
        }, Promise.resolve());
      })(this);
    },
    saveItemSync: function(item, message){
      return  (function(that){
        return new Promise(function(resolve, reject){
          var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
          var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
          /*    that.messages.push({
          date: new Date(),
          verb: that.actions.Starting,
          text:operationText + ' ' + item.Title,
          preposition: preposition,
          target: that.selectedItem.Title,
          url: that.siteCollection.url,
          type: 'info'
        });*/

        that[item.operation == 'add' ? 'addUserToGroup' : 'removeUserFromGroup'](that.siteCollection, that.digest, that.type.users ? item.Id : that.selectedItem.Id, that.type.groups ? item : that.selectedItem,function(results){
          /*  var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
          var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
          that.messages.push({
          date: new Date(),
          verb: that.actions.Success,
          text:operationText + ' ' + item.Title,
          preposition: preposition,
          target: that.selectedItem.Title,
          url: that.siteCollection.url,
          type: 'success'
        });*/
        message.status = 'done';
        that.metrics.numSuccesses++;
        item.isNew = false;
        item.hasError = false;
        that.progress += 100/that.newItems.length;
        return resolve();
      }, function(error){
        var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
        var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
        item.hasError = true;
        that.failedItems.push(item);
        //that.messages.push({date: new Date(), verb: that.actions.Failed, text:  operationText + ' ' + item.Title, preposition: preposition, hasError: true, message: error.message, target: that.selectedItem.Title, url: that.siteCollection.url, type: 'error'});
        message.status = 'done';
        message.error = {expanded: false, message: error.stack, title: error.message};
        that.progress += 100/that.newItems.length;
        that.metrics.numFailed++;
        return resolve();
      })
    })
    })(this);
  },
  getData: function(callback){
    this.isLoading = true;
    (function(that){
      new Promise(function(resolve, reject){
        that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Users', target: that.siteCollection.title, url: that.siteCollection.url, type: 'warning'});
        that.getUsersForSiteCollection(function(data){
          if(that.type.users){
            that.items = data;
          } else {
            that.availableItems = data;
            that.originalAvailableItems = data;
            that.assignedItems = []
          }

          that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Users', target: that.siteCollection.title, url: that.siteCollection.url, type: 'info'});
          resolve();
        }, function(error){
          that.messages.push({date: new Date(), verb: that.actions.Failed, text:  'Fetching Users',  hasError: true, message: error.message, target: that.siteCollection.title, url: that.siteCollection.url, type: 'error'});
          that.isLoading = false;

        });
      }).then(function(result){
        return new Promise(function(resolve, reject){
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Groups', target: that.siteCollection.title, url: that.siteCollection.url, type: 'warning'});
          that.getGroupsForSiteCollection(that.siteCollection, function(data){
            if(that.type.users){
              that.availableItems = data;
              that.originalAvailableItems = data;
              that.assignedItems = [];
            } else {
              that.items = data;
            }

            that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Groups', target: that.siteCollection.title, url: that.siteCollection.url, type: 'info'});
            resolve();
          }, function(error){
            that.messages.push({date: new Date(), verb: that.actions.Failed, text:  'Fetching Groups', hasError: true, message: error.message, target: that.siteCollection.title, url: that.siteCollection.url, type: 'error'});
            that.isLoading = false;
          });
        });
      }).then(function(result){
        //now we'll go ahead and try and match the currently selected user
        //with the one that exists in the new site collection.
        //We'll go ahead and just resolve if the type that we're working with is group.
        return new Promise(function(resolve, reject){
          var currentItem;
          if(that.selectedItem !== null && that.type.users){
            that.checkIfUserExists(that.selectedItem.LoginName);
          }
          resolve();
        });
      }).then(function(result){
        that.isLoading = false;
        that.$emit('site-collection-selected', true);
        if(callback){
          callback();
        }
      });
    })(this);
  },
  getUsersForSiteCollection: function(callback, errorCallback){
    (function(that){
      if(that.isTesting){
        setTimeout(function(){
          //populate items for current type and populate availabe items for the opposing type
          //re-select previously selected item if its available
          //trigger select change for selected item if it exists, else clear selected item
          callback(that.testUsers);
        },1000);
      } else {
        that.getUsers(that.siteCollection, false, function(users){
          return callback(users);
        }, function(error){
          return errorCalback(error);
        });
      }
    })(this);
  },
  getGroupsForSiteCollection: function(siteCollection, callback, errorCallback){
    (function(that){
      if(that.isTesting){
        setTimeout(function(){
          //populate items for current type and populate availabe items for the opposing type
          //re-select previously selected item if its available
          //trigger select change for selected item if it exists, else clear selected item
          var rand = Math.random();

          return rand == 0 ? errorCallback({message: 'Bad Stuff Happened'}) : callback(that.testGroups);

        },1000);
      } else {
        that.getGroups(siteCollection, false, function(groups){
          callback(groups);
        }, function(error){
          errorCallback(error);
        });
      }
    })(this);
  },
  getItem: function(callback){
    this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Fetching ' + (this.type.users ? 'Groups' : 'Users'), preposition: 'for', target: this.selectedItem.Title, url: this.siteCollection.url, type: 'warning'});
    this.isLoading = true;
    (function(that){
      if(that.isTesting){
        setTimeout(function(){
          that.assignedItems =  that.$lodash.sampleSize(that.type.users ? that.testGroups : that.testUsers, Math.floor(Math.random() * 10) + 1);
          that.originalAssignedItems = JSON.parse(JSON.stringify(that.assignedItems));
          //remove assigned items from available
          that.availableItems = that.$lodash.partition(that.originalAvailableItems, function(o){
            return that.$lodash.find(that.assignedItems, o) === undefined;
          })[0];
          that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Fetching ' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.Title, url: that.siteCollection.url,  type: 'info'});
          that.isLoading = false
          if(callback){
            callback();
          }
        },1000);
      } else {
        if(that.type.users){
          that.getGroups(that.siteCollection, that.selectedItem.Id, function(groups){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Fetching ' + (that.type.users ? 'Groups' : 'Users'),  preposition: 'for', target: that.selectedItem.Title,  url: that.siteCollection.url, type: 'info'});
            that.isLoading = false;
            that.assignedItems = groups;
            console.log('Assigned items:');
            console.log(that.assignedItems);
            that.originalAssignedItems = JSON.parse(JSON.stringify(that.assignedItems));
            that.availableItems = that.$lodash.partition(that.originalAvailableItems, function(o){
              return that.$lodash.find(that.assignedItems, o) === undefined;
            })[0];
            console.log('Available items:');
            console.log(that.availableItems);
          }, function(error){
            var message = '';
            if(error.hasOwnProperty('error') && error.error.hasOwnProperty('message')){
              error.message = error.error.message.value;
            }
            console.log(error);
            that.messages.push({date: new Date(), verb: that.actions.Failed, text: 'Fetching ' + (that.type.users ? 'Groups' : 'Users'), hasError: true, message: error.message,  preposition: 'for', target: that.selectedItem.Title, url: that.siteCollection.url, type: 'error'});
            that.isLoading = false;
          });
        } else {
          that.getUsers(that.siteCollection, that.selectedItem.Id, function(users){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Fetching ' + (that.type.users ? 'Groups' : 'Users'),  preposition: 'for', target: that.selectedItem.Title,  url: that.siteCollection.url, type: 'info'});
            that.isLoading = false;
            that.assignedItems = users;
            that.originalAssignedItems = JSON.parse(JSON.stringify(that.assignedItems));
            that.availableItems = that.$lodash.partition(that.originalAvailableItems, function(o){
              return that.$lodash.find(that.assignedItems, o) === undefined;
            })[0];
            if(callback){
              callback();
            }
          }, function(error){
            that.messages.push({date: new Date(), verb: that.actions.Failed, text: 'Fetching ' + (that.type.users ? 'Groups' : 'Users'), hasError: true, message: error.message,  preposition: 'for', target: that.selectedItem.Title, url: that.siteCollection.url, type: 'error'});
            that.isLoading = false;
          });
        }
      }
    })(this);
  },
  removeUserAsync: function(user, siteCollection, numSiteCollections, messageList){
    var promise;
    messageList.push({status: 'pending', url: siteCollection.url, target: user.Title, operation:  'Remove From Site Collection', error: {expanded: false, message: '', title: ''}});
    var message = messageList[messageList.length - 1];
    (function(that){
      promise = new Promise(function(resolve, reject){
        message.status = 'done';
        that.removeUserFromSiteCollection(siteCollection, '', user, function(result){
          that.progress += 100/numSiteCollections;
          that.metrics.numSuccesses++;
          resolve();
        }, function(error){
          that.progress += 100/numSiteCollections;
          message.status = 'error';
          message.error = {expanded: false, message: error.stack, title: error.message};
          that.metrics.numFailed++;
          resolve();
        });
      });
    })(this);
    return promise;
  },
  removeUserFromSiteCollectionsSync: function(user, siteCollections){
    this.metrics.numFailed = 0;
    this.metrics.numSuccesses = 0;
    this.progress = 0;
    return (function(that){
      return siteCollections.reduce(function(promise, siteCollection){
        return promise.then(function (result) {
          return that.removeUserSync(user, siteCollection, siteCollections.length);
        }).catch(console.error);
      }, Promise.resolve());
    })(this);
  },
  removeUserSync: function(user, siteCollection, numSiteCollections){
    return  (function(that){
      return new Promise(function(resolve, reject){
        that.messages.push({
          date: new Date(),
          verb: that.actions.Starting,
          text: 'Remove From Site Collection',
          preposition: 'for',
          target: user.Title,
          url: siteCollection.url,
          type: 'warning'
        });
        that.removeUserFromSiteCollection(siteCollection, '', user, function(result){
          that.progress += 100/numSiteCollections;
          that.messages.push({
            date: new Date(),
            verb: that.actions.Finished,
            text: 'Remove From Site Collection',
            preposition: 'for',
            target: user.Title,
            url: siteCollection.url,
            type: 'info'
          });
          that.metrics.numSuccesses++;
          resolve();
        }, function(error){
          that.progress += 100/numSiteCollections;
          that.messages.push({
            date: new Date(),
            verb: that.actions.Failed,
            text: 'Remove From Site Collection',
            preposition: 'for',
            target: user.Title,
            hasError: true,
            message: error.message,
            url: siteCollection.url,
            type: 'error'
          });
          that.metrics.numFailed++;
          resolve();
        });
      });
    })(this);
  },

  purgeUser: function(purgeAll){
    (function(that){
      var targetSiteCollections = [];
      that.metrics.start = new Date();
      that.progress = 0;
      that.isSaving = true;
      that.messages.push({
        date: new Date(),
        verb: that.actions.Starting,
        text: 'Purging',
        preposition: 'for',
        target: that.selectedItem.Title,
        url: '',
        type: 'warning'
      });

      that.messages.push({
        date: new Date(),
        verb: that.actions.Starting,
        text: 'Fetching all site collections',
        preposition: 'for',
        target: that.selectedItem.Title,
        url: '',
        type: 'warning'
      });
      that.getSiteCollectionsForUserAsync(that.selectedItem, purgeAll ? that.siteCollections :  [that.siteCollection], targetSiteCollections).then(function(result){
        that.messages.push({
          date: new Date(),
          verb: that.actions.Finished,
          text: 'Fetching all site collections',
          preposition: 'for',
          target: that.selectedItem.Title,
          url: '',
          type: 'info'
        });
        that.metrics.end = new Date();
        that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
        that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
        that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'})
        that.messages.push({
          date: new Date(),
          verb: that.actions.Starting,
          text: 'Purging',
          preposition: 'for',
          target: that.selectedItem.Title,
          url: '',
          type: 'warning'
        });
        that.metrics.start = new Date();
        that.removeUserFromSiteCollectionsAsync(that.selectedItem, targetSiteCollections).then(function(result){
          that.messages.push({
            date: new Date(),
            verb: that.actions.Finished,
            text: 'Purging',
            preposition: 'for',
            target: that.selectedItem.Title,
            url: '',
            type: 'info'
          });
          that.metrics.end = new Date();
          that.isSaving = false;
          that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
          that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
          that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'})
        });
      });
    })(this);
  },
  getItemFromSiteCollectionAsync: function(item, siteCollection, numSiteCollections, messageList){
    var promise;
    messageList.push({status: 'pending', url: siteCollection.url, target: item.Title, operation:  'Check Profile Exists', error: {expanded: false, message: '', title: ''}});
    var message = messageList[messageList.length - 1];
    (function(that){
      promise = new Promise(function(resolve, reject){
        that.getByLoginName(siteCollection, item.LoginName, function(result){
          that.progress += 100/numSiteCollections;
          message.status = 'done';
          that.metrics.numSuccesses++;
          //add property to indicate whether the selected item is a site admin
          if(result.hasOwnProperty('IsSiteAdmin')){
            siteCollection.IsSiteAdmin = result.IsSiteAdmin;
          }
          resolve(siteCollection);
        }, function(error){
          that.progress += 100/numSiteCollections;
          message.status = 'error';
          message.error = {expanded: false, message: error.stack, title: error.message};
          that.metrics.numFailed++;
          resolve(false);
        });
      });
    })(this);
    return promise;
  },
  getSiteCollectionsForUserSync: function(user, siteCollections, targetSiteCollections){
    this.metrics.numFailed = 0;
    this.metrics.numSuccesses = 0;
    this.progress = 0;
    return (function(that){
      return siteCollections.reduce(function(promise, siteCollection){
        return promise.then(function (result) {
          return that.getItemFromSiteCollectionSync(user, siteCollection, siteCollections.length).then(function(result){
            return result ? targetSiteCollections.push(siteCollection) : targetSiteCollections;
          });
        }).catch(console.error);
      }, Promise.resolve());
    })(this);
  },
  removeUserFromSiteCollectionsAsync: function(user, siteCollections){
    this.metrics.numFailed = 0;
    this.metrics.numSuccesses = 0;
    this.progress = 0;
    var message =  {type: 'table', pagination: {
      sortBy: 'operation',
      descending: false
    },
    search: '', headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []};
    var messageList = message.rows;
    this.messages.push(message);
    var promiseArr;
    (function(that){
      promiseArr = siteCollections.map(function(item){
        return that.removeUserAsync(user, item, siteCollections.length, messageList);
      });
    })(this);
    return Promise.all(promiseArr);
  },

  getItemFromSiteCollectionSync: function(item, siteCollection, numSiteCollections){
    return  (function(that){
      return new Promise(function(resolve, reject){
        that.messages.push({
          date: new Date(),
          verb: that.actions.Starting,
          text: 'Check Profile Exists',
          preposition: 'for',
          target: item.Title,
          url: siteCollection.url,
          type: 'warning'
        });
        that.getByLoginName(siteCollection, item.LoginName, function(result){
          that.progress += 100/numSiteCollections;
          that.messages.push({
            date: new Date(),
            verb: that.actions.Finished,
            text: 'Check Profile Exists',
            preposition: 'for',
            target: item.Title,
            url: siteCollection.url,
            type: 'info'
          });
          that.metrics.numSuccesses++;
          resolve(siteCollection);
        }, function(error){
          that.progress += 100/numSiteCollections;
          that.messages.push({
            date: new Date(),
            verb: that.actions.Failed,
            text: 'Check Profile Exists',
            preposition: 'for',
            target: item.Title,
            hasError: true,
            message: error.message,
            url: siteCollection.url,
            type: 'error'
          });
          that.metrics.numFailed++;
          resolve(false);
        });
      });
    })(this);
  },
  getSiteCollectionsForUserAsync: function(user, siteCollections, targetSiteCollections){
    this.metrics.numFailed = 0;
    this.metrics.numSuccesses = 0;
    this.progress = 0;
    var message =  {type: 'table', pagination: {
      sortBy: 'operation',
      descending: false
    },
    search: '', headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []};
    var messageList = message.rows;
    this.messages.push(message);
    var promiseArr;
    (function(that){
      promiseArr = siteCollections.map(function(siteCollection){
        return that.getItemFromSiteCollectionAsync(user, siteCollection, siteCollections.length, messageList).then(function(result){
          return result ? targetSiteCollections.push(siteCollection) : targetSiteCollections;
        });
      });
    })(this);
    return Promise.all(promiseArr);
  }
  }
};
</script>
