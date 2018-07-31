<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex xs6>
        <Info :type="type" :update-selected-item="updateSelectedItem" :site-collection-has-item="siteCollectionHasItem" :is-saving="isSaving" :is-loading="isLoading" :site-collection="siteCollection" :is-site-collection-selected="isSiteCollectionSelected" :items="items" :assigned-items="assignedItems" :new-items="newItems"  @save="save" @item-changed="itemChanged"></Info>
      </v-flex>
      <v-flex xs6>
        <Console :is-item-selected="isItemSelected" :type="type" :is-saving="isSaving" :is-loading="isLoading || this.isLoadingSiteCollections.status" :save-progress="saveProgress" :is-site-collection-selected="isSiteCollectionSelected" :messages="messages" @clear-console="clearConsole"></Console>
      </v-flex>
      <v-flex xs6>
        <SelectAvailable :num-selected="itemsSelected.available" :site-collection-has-item="siteCollectionHasItem"  :is-any-selected="isAnyAvailableSelected" :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving" :is-loading="isLoading" :is-site-collection-selected="isSiteCollectionSelected" :items="availableItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAvailable>
      </v-flex>
      <v-flex xs6>
        <SelectAssigned :num-selected="itemsSelected.assigned" :site-collection-has-item="siteCollectionHasItem"  :is-any-selected="isAnyAssignedSelected" :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving" :is-loading="isLoading" :is-site-collection-selected="isSiteCollectionSelected" :items="assignedItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAssigned>
      </v-flex>
    </v-layout>
    <v-snackbar :timeout="snackbar.timeout" :top="snackbar.y === 'top'" :bottom="snackbar.y === 'bottom'" :right="snackbar.x === 'right'" :left="snackbar.x === 'left'" :multi-line="snackbar.mode === 'multi-line'" :vertical="snackbar.mode === 'vertical'" v-model="snackbar.show">
      {{ snackbar.text }}
      <v-btn flat color="pink" @click.native="snackbar.show = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import Console from './Console.vue'
import Info from './Info.vue'
import SelectAssigned from './SelectAssigned.vue'
import SelectAvailable from './SelectAvailable.vue'
import Data from '../mixins/Data.vue'
import TestData from '../mixins/TestData.vue'

export default {
  mixins: [Data, TestData],
  components: {
    Console: Console,
    Info: Info,
    SelectAssigned: SelectAssigned,
    SelectAvailable: SelectAvailable
  },
  props: {
    isLoadingSiteCollections: {
      type: Object,
      default: function(){
        return {
          status: false,
          hasError: false,
          message: ''
        }
      }
    },
    siteCollection: {
      type: Object,
      default: function(){
        return {
          title: '',
          url:  ''
        }
      }
    },
    siteCollections: {
      type: Array,
      default: function(){
        return [];
      }
    },
    isTesting: {
      type: Boolean,
      default: false
    },
    isSiteCollectionSelected: {
      type: Boolean,
      default: false
    },
    type: {
      type: Object,
      default: function(){
        return {users: true, groups: false}
      }
    },
    url: '',
    loginname: ''
  },
  watch: {
    selectedAvailable: {
      handler: function(newVal, oldVal){
        this.isAnyAvailableSelected = Object.keys(newVal).length > 0;
      },
      deep: true
    },
    selectedAssigned: {
      handler: function(newVal, oldVal){
        this.isAnyAssignedSelected = Object.keys(newVal).length > 0;
      },
      deep: true
    },
    isSiteCollectionSelected: {
      handler: function(newVal, oldVal){

      }
    },
    isLoadingSiteCollections: {
      handler: function(newVal, oldVal){
        this.getIsLoadingSiteCollections(newVal.status);
      },
      deep: true
    },
    siteCollection: {
      handler: function(newVal, oldVal){
        if(this.siteCollection == null){
          delete this.$route.query;
          return;
        }


        if(this.siteCollection !== null){
          (function(that){
            new Promise(function(resolve, reject){
              that.getData(function(){
                resolve();
              });
            }).then(function(result){
              if(that.checkIfUserExists(that.selectedItem != null ? that.selectedItem.LoginName : that.loginname != null ? that.loginname: '')){
                that.$router.push({ query: { url: that.siteCollection !== null ? that.siteCollection.url : '', loginname: that.selectedItem !== null ? that.selectedItem.LoginName : ''}});
              } else {
                that.$router.push({ query: { url: that.siteCollection !== null ? that.siteCollection.url : ''}});
              }
            });
          })(this);
        }
      },
      deep: true
    },
    selectedItem: {
      handler: function(newVal, oldVal){
        this.$router.push({ query: { url: this.siteCollection.url,loginname: this.selectedItem !== null ? this.selectedItem.LoginName : ''}});
      },
      deep: true
    },
    type: {
      handler: function(newVal, oldVal){
        if(this.isSiteCollectionSelected){
          this.getData();
        }
      },
      deep: true
    }
  },
  data: function() {
    return {
      updateSelectedItem: null,
      isAnyAvailableSelected: false,
      isAnyAssignedSelected: false,
      drawer: false,
      toggle_select: 0,
      isSaving: false,
      isLoading: false,
      saveProgress: 0,
      isItemSelected: false,
      itemsSelected: {
        available: 0,
        assigned: 0
      },
      metrics: {
        start: null,
        end: null
      },
      savingIndex: 0,
      updateProgressInterval: false,
      selectedItem: null,
      digest: null,
      siteCollectionHasItem: true,
      snackbar: {
        show: false,
        y: 'top',
        x: 'right',
        mode: '',
        timeout: 6000,
        text: 'Data loaded successfully'
      },
      items: [],
      availableItems: [
      ],
      originalAvailableItems: [],
      assignedItems:[
      ],
      originalAssignedItems:[],
      newItems: [],
      failedItems: [],
      messages: [],
      selectedAvailable: {},
      selectedAssigned: {},
      actions: {
        Starting: 'Starting',
        Finished: 'Finished',
        Failed: 'Failed',
        Success: 'Success'
      }
    };
  },
  methods: {
    checkIfUserExists: function(loginName){
      var currentItem;
      if(loginName.length > 0){
        currentItem = this.$lodash.find(this.items, function(o){
          if(o !== undefined && o.hasOwnProperty('Id')){
            return o.LoginName == loginName;
          } else {
            return false;
          }
        });
        //since we found a match, we'll update the selected user to the current items
        //this is due to the user IDs not being the same between site collections
        if(currentItem != undefined){
          this.updateSelectedItem = currentItem;
          this.selectedItem = currentItem;
        }
        if(this.selectedItem !== null){
          this.siteCollectionHasItem = currentItem !== undefined;
          if(  this.siteCollectionHasItem){
            return true;
          } else {
            this.items.push(this.selectedItem);
            this.messages.push({date: new Date(), verb: this.actions.Failed, text:  'Fetching ' + (this.type.users ? 'Groups' : 'Users'), preposition: 'for', hasError: true, message: 'Site collection does not contain user.', target: this.selectedItem.Title, url: this.siteCollection.url, type: 'error'});
            return false;

          }
        }
      }
      return false;
    },
    getIsLoadingSiteCollections: function(val){
      var siteCollectionSelected;
      if(this.isLoadingSiteCollections.status){
        this.messages.push({date: new Date(), verb: this.actions.Starting, preposition: ' ', text: 'Fetching Site Collections' , url: window.location.origin, type: 'info'});
      } else {
        this.messages.push({date: new Date(), verb: this.actions.Finished, preposition: ' ', hasError: this.isLoadingSiteCollections.hasError, message: this.isLoadingSiteCollections.message,  text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
        if(this.url != ''){
          //double check that site collection exists
          (function(that){
            siteCollectionSelected = that.$lodash.find(that.siteCollections, function(o){
              return o.url == that.url;
            });
          })(this);
          if(siteCollectionSelected){
            this.$emit('select-site-collection', siteCollectionSelected);
          }
        }
      }
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
            that.getGroupsForSiteCollection(function(data){
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
    getGroupsForSiteCollection: function(callback, errorCallback){
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
          that.getGroups(that.siteCollection, false, function(groups){

            callback(groups);
          }, function(error){
            errorCallback(error);
          });
        }
      })(this);
    },
    clearSelected: function(type){
      var key;
      var items = type == 'available' ? this.availableItems : this.assignedItems;
      this.$lodash.forEach(items, function(o){
        o.selected = false;
      });
      itemsSelected[type] = 0;
    },
    itemChanged: function(item){
      var i;
      if(item == null){
        this.giveAll('assigned');
        this.assignedItems = [];
        this.originalAssignedItems = [];
        this.newItems = [];
        this.selectedAvailable = {};
        this.selectedAssigned = {};
        this.$set(this, 'selectedItem', null);
        this.isItemSelected = false;
      } else {
        this.selectedItem = item.Title.length > 0 ? item : false;
        i = this.assignedItems.length;
        while(i--){
          this.originalAssignedItems.push(JSON.parse(JSON.stringify(this.assignedItems[i])));
        }
        this.isItemSelected = true;
        this.siteCollectionHasItem = true;
        this.getItem();
      }
    },
    getItem: function(callback){
      this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Fetching ' + (this.type.users ? 'Groups' : 'Users'), preposition: 'for', target: this.selectedItem.Title, url: this.siteCollection.url, type: 'warning'});
      this.isLoading = true;
      (function(that){
        if(that.isTesting){
          setTimeout(function(){
            that.assignedItems =  [];//that.$lodash.sampleSize(that.type.users ? that.testGroups : that.testUsers, Math.floor(Math.random() * 10) + 1);
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
              that.originalAssignedItems = JSON.parse(JSON.stringify(that.assignedItems));
              that.availableItems = that.$lodash.partition(that.originalAvailableItems, function(o){
                return that.$lodash.find(that.assignedItems, o) === undefined;
              })[0];
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
              that.originalAssignedItems = users;
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
    selectItem: function(type, item){
      this.$set(item, 'selected', item.hasOwnProperty('selected') ? !item.selected : true);
      this.itemsSelected[type] += (item.selected ? 1 : -1);
    },
    giveAll: function(sourceType){
      var sourceItems;

      if(sourceType == 'available'){
        sourceItems = this.availableItems;
      } else {
        sourceItems = this.assignedItems;
      }

      //select all items in current list
      this.$lodash.forEach(sourceItems, function(o){
        o.selected = true;
      });

      this.giveSelected(sourceType);

    },
    giveSelected: function(sourceType){
      var sourceSelectedItems;
      var targetSelectedItems;
      var sourceItems;
      var isOriginalItem = false;
      var key;
      var index = 0;
      var sourceItemIndex;
      var deleteMap = {};
      var itemIndex;
      var newItemIndex;
      var targetItems;
      var modIndex = 0;
      var i;
      var indexRemovedArr = [];

      this.itemsSelected[sourceType] = 0;

      if(sourceType == 'available'){
        sourceSelectedItems = this.selectedAvailable;
        targetSelectedItems = this.selectedAssigned;
        sourceItems = this.availableItems;
        targetItems =  this.assignedItems;
      } else {
        sourceSelectedItems = this.selectedAssigned;
        targetSelectedItems = this.selectedAvailable;
        sourceItems = this.assignedItems;
        targetItems =  this.availableItems;
      }
      sourceItems = this.$lodash.sortBy(sourceItems, [function(o){
        return o.Title.toLowerCase();
      }]);

      //move items from selected into target lists
      (function(that){
        i = sourceItems.length - 1;
        var o;
        while(i >= 0){
          o = sourceItems[i];
          if(!o.selected){
            i--;
            continue;
          }
          o.selected = false;
          o.hasError = false;
          console.log(that.originalAssignedItems);
          itemIndex = that.$lodash.findIndex(that.originalAssignedItems, function(originallyAssignedItem){
            return originallyAssignedItem.LoginName == o.LoginName
          });
          targetItems.push(o);
          console.log('item index: ' + itemIndex);
          isOriginalItem = itemIndex > -1;
          if(isOriginalItem && sourceType =='assigned' || !isOriginalItem && sourceType == 'available'){
            that.newItems.push(o);
            that.newItems[that.newItems.length - 1].operation = sourceType == 'available' ? 'add' : 'delete';
            that.newItems[that.newItems.length - 1].isNew = true;
          } else if(that.newItems.length > 0){
            newItemIndex = that.$lodash.findIndex(that.newItems, function(newItem){
              return newItem.LoginName == o.LoginName
            });
            that.newItems[newItemIndex].isNew = false;
            that.newItems.splice(newItemIndex, 1);
          }

          sourceItems.splice(i, 1);
          i--;
        }
      })(this);

      this.$set(this, sourceType == 'available' ? 'availableItems' : 'assignedItems', sourceItems);

      for(key in sourceSelectedItems){
        delete sourceSelectedItems[key];
      }
    },
    save: function(){
      this.isSaving = true;
      this.saveProgress = 0;
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
          that.saveItems(that.newItems).then(function(result){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Saving ' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.LoginName, url: that.siteCollection.url, type: 'info'});
            that.isSaving = false;
            that.metrics.end = new Date();
            that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'})
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
        /*Promise.all(promiseArr.then(function(){
        that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Saving ' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.LoginName, url: that.siteCollection.url, type: 'info'});
        that.isSaving = false;
        //set new items to failed items as these are still "new" and need to be processed.
        that.newItems = that.failedItems;
        that.originalAssignedItems = JSON.parse(JSON.stringify(that.assignedItems));
        that.originalAvailableItems = JSON.parse(JSON.stringify(that.availableItems));
      });
    });*/

  })(this);
},
saveItems: function(items){
  return (function(that){
    return items.reduce(function(promise, item){
      return promise.then(function (result) {
        /*  return new Promise(function(resolve, reject){
        setTimeout(function(){
        console.log(that.saveProgress);
        that.saveProgress++;
        return resolve();
      }, Math.random() * 1000);
    });*/
    return that.saveItem(item);
  }).catch(console.error);
}, Promise.resolve());
})(this)
},
saveItem: function(item){
  return  (function(that){
    return new Promise(function(resolve, reject){
      var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
      var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');;
      that.messages.push({
        date: new Date(),
        verb: that.actions.Starting,
        text:operationText + ' ' + item.Title,
        preposition: preposition,
        target: that.selectedItem.Title,
        url: that.siteCollection.url,
        type: 'info'
      });

      that[item.operation == 'add' ? 'addUserToGroup' : 'removeUserFromGroup'](that.siteCollection, that.digest, that.type.users ? item.Id : that.selectedItem.Id, that.type.groups ? item : that.selectedItem,function(results){
        var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
        var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
        that.messages.push({
          date: new Date(),
          verb: that.actions.Success,
          text:operationText + ' ' + item.Title,
          preposition: preposition,
          target: that.selectedItem.Title,
          url: that.siteCollection.url,
          type: 'success'
        });
        item.isNew = false;
        item.hasError = false;
        that.saveProgress += 100/that.newItems.length;
        return resolve();
      }, function(error){
        var operationText = item.operation.charAt(0).toUpperCase() +  item.operation.slice(1);
        var preposition = item.operation == 'add' ? (that.type.user ? 'for' : 'to') : (that.type.user ? 'for' :'from');
        item.hasError = true;
        that.failedItems.push(item);
        that.messages.push({date: new Date(), verb: that.actions.Failed, text:  operationText + ' ' + item.Title, preposition: preposition, hasError: true, message: error.message, target: that.selectedItem.Title, url: that.siteCollection.url, type: 'error'});
        that.saveProgress += 100/that.newItems.length;
        return resolve();
      })
    })
  })(this);
},
clearConsole: function(){
  this.messages = [];
},
},
created: function(){
  this.toggle_select = this.type.users ? 0 : 1;
  this.getIsLoadingSiteCollections();
}
}
</script>

<style scoped>
.full-height .flex{
  display: flex;
}
.full-height .flex > .card{
  flex: 1 1 auto;
}

.flexcard.v-card {
  width: 100%;
}
</style>
