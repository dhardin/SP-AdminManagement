<script>
  export default {
  methods: {
    saveSiteAdmin: function(){
      //async fetch/store digests
      //async add/rm
      this.isSaving = true;
      this.progress = 0;
      this.failedItems = [];
      this.metrics.start = new Date();
      this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Updating Site Collection Admins', target: this.selectedItem.Title,  url: this.siteCollection.url,  type: 'warning'});
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
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Updating Site Collection Admins', target: '',  url: '',  type: 'warning'});
          that.setSitesAdminAsync(user, isSiteAdminArr, siteCollections).then(function(result){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Updating Site Collection Admins', target: '',  url: '',  type: 'warning'});
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
    setSitesAdminAsync: function(user, isSiteAdminArr, siteCollections){
      this.metrics.numFailed = 0;
      this.metrics.numSuccesses = 0;
      if(isSiteAdminArr.length != siteCollections.length){
        throw new UerException('Site Admin Array and Site Collection Array not equal in length.')
      }
      var message =  {type: 'table', pagination: {
        sortBy: 'operation',
        descending: false
      },
      search: '',headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []};
      var messageList = message.rows;
      this.messages.push(message);
      var promiseArr;
      (function(that){
        promiseArr = siteCollections.map(function(siteCollection, index){
          return that.setSiteAdminAsync(user, siteCollection, isSiteAdminArr[index], isSiteAdmin, messageList);
        });
      })(this);
      return Promise.all(promiseArr);
    },
    setSiteAdminAsync: function(user, siteCollection, isSiteAdmin, messageList){
        var operationText = isSiteAdmin ? 'add' : 'remove';
        messageList.push({status: 'pending', url: siteCollection.url, target: siteCollection.Title, operation: operationText + ' ' + user.LoginName, error: {expanded: false, message: '', title: ''}});
        var message = messageList[messageList.length - 1];
        var promise;
        (function(that){
          promise = new Promise(function(resolve, reject){
          that.updateUser(that.siteCollection, that.digest, user.LoginName, {IsSiteAdmin: isSiteAdmin}, function(result){
              that.metrics.numSuccesses++;
              message.status = 'done';
              return resolve();
            }, function(error){
              message.status = 'error';
              message.error = {expanded: false, message: error.stack, title: error.message};
              that.metrics.numFailed++;
              return resolve();
            })
          });
        })(this);
        return promise;
      },
    toggleSiteAdmin: function(user){
      (function(that){
        var i;
        that.metrics.start = new Date();
        that.isSaving = true;
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
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Updating',  preposition: 'for', target: user.LoginName,   url: that.siteCollection.url,  type: 'warning'});
          that.updateUser(that.siteCollection, that.digest, user.LoginName, {IsSiteAdmin: !user.IsSiteAdmin}, function(result){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Updating', preposition: 'for', target: user.LoginName, url: that.siteCollection.url, type: 'info'});
            that.isSaving = false;
            that.metrics.end = new Date();
          }, function(error){
              that.metrics.end = new Date();
            that.messages.push({date: new Date(), verb: that.actions.Failed, text: 'Updating', hasError: true, message: error.message,  preposition: 'for', target: user.LoginName, url: that.siteCollection.url, type: 'error'});
            that.isSaving = false;
          });
        });
      })(this);
    }
    }
        }
</script>
