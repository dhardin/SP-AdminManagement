<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex :xs6="!maximize" :xs12="maximize" :order-xs2="!maximize" :order-xs1="maximize">
        <Console :maximize="maximize" :is-item-selected="isItemSelected" :type="type" :is-saving="isSaving" :is-loading="isLoading || this.isLoadingSiteCollections.status" :save-progress="progress" :is-site-collection-selected="isSiteCollectionSelected" :messages="messages" @clear-console="clearConsole" @resize="resize"></Console>
      </v-flex>
      <v-flex  :xs6="!maximize" :xs12="maximize" :order-xs1="!maximize" :order-xs2="maximize">
        <Info @get-site-collections-for-user="getSiteCollectionsGroupsForUser" @copy-dialog-opened="copyDialogOpened" :type="type" :update-selected-item="updateSelectedItem" :site-collection-has-item="siteCollectionHasItem" :is-saving="isSaving" :is-loading="isLoading" :site-collection="siteCollection" :is-site-collection-selected="isSiteCollectionSelected" :items="items" :assigned-items="assignedItems" :new-items="newItems"  @save="save" @item-changed="itemChanged" @purge-user="purgeUser"></Info>
      </v-flex>
      <v-flex xs6 order-xs3 >
        <SelectAvailable :type="type" :num-selected="itemsSelected.available" :site-collection-has-item="siteCollectionHasItem"  :is-any-selected="isAnyAvailableSelected" :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving || copyDialogOpen" :is-loading="isLoading || copyDialogOpen" :is-site-collection-selected="isSiteCollectionSelected" :items="availableItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAvailable>
      </v-flex>
      <v-flex xs6 order-xs4 >
        <SelectAssigned :type="type" :num-selected="itemsSelected.assigned" :site-collection-has-item="siteCollectionHasItem"  :is-any-selected="isAnyAssignedSelected" :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving || copyDialogOpen" :is-loading="isLoading || copyDialogOpen" :is-site-collection-selected="isSiteCollectionSelected" :items="assignedItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAssigned>
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
      progress: 0,
      isItemSelected: false,
      maximize: false,
      copyDialogOpen: false,
      itemsSelected: {
        available: 0,
        assigned: 0
      },
      metrics: {
        numSuccesses: 0,
        numFailed: 0,
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
      messages: [],//[{type: 'table', headers: ['url', 'target', 'status'], rows: [{status: 'pending', url: '/home', target: ''}, {status: 'error', error: {expanded: false, message: 'some error', title: 'Unable to reach domain'}, url: '/blah', target: ''}]}],
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
    copyDialogOpened: function(isOpened){
      this.copyDialogOpen = isOpened;
    },
    resize: function(){
      this.maximize = !this.maximize;
    },
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
        this.messages.push({date: new Date(), verb: this.actions.Starting, preposition: ' ', text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
      } else {
        this.messages.push({date: new Date(), verb: this.actions.Finished, preposition: ' ', hasError: this.isLoadingSiteCollections.hasError, message: this.isLoadingSiteCollections.message,  text: 'Fetching Site Collections' , url: window.location.origin, type: 'info'});
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
    clearSelected: function(type){
      var key;
      var items = type == 'available' ? this.availableItems : this.assignedItems;
      this.$lodash.forEach(items, function(o){
        o.selected = false;
      });
      this.itemsSelected[type] = 0;
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
    selectItem: function(type, item){
      this.$set(item, 'selected', item.hasOwnProperty('selected') ? !item.selected : true);
      console.log('Item Selected: ' + item.Title + ' - ' + item.selected);
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
          itemIndex = that.$lodash.findIndex(that.originalAssignedItems, function(originallyAssignedItem){
            return originallyAssignedItem.LoginName == o.LoginName
          });
          targetItems.push(o);
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
clearConsole: function(){
  this.messages = [];
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
        return that.removeUserAsync(user, siteCollection, siteCollections.length, messageList);
    });
  })(this);
  return Promise.all(promiseArr);
},
getGroupsForUserInSiteCollections: function(user, siteCollections){
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
        var promise;
        (function(that){
          promise = new Promise(function(resolve, reject){
            that.getGroups(item, user.Id, function(groups){
              resolve({siteCollection: item, children: groups});
          }, function(error){
            console.log('error');
            reject();
          }
        );
        });
        })(this);
        return promise;
    });
  })(this);
  return Promise.all(promiseArr);
},
removeUserAsync: function(user, siteCollection, numSiteCollections){
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
getSiteCollectionsGroupsForUser: function(){
  (function(that){
    var targetSiteCollections = [];
    var siteCollections = [];
    that.metrics.start = new Date();
    that.progress = 0;
    that.isSaving = true;

    that.messages.push({
      date: new Date(),
      verb: that.actions.Starting,
      text: 'Fetching all site collections',
      preposition: 'for',
      target: that.selectedItem.Title,
      url: '',
      type: 'warning'
    });
  new Promise(function(resolve, reject){
  that.getSiteCollectionsForUserAsync(that.selectedItem, that.siteCollections, targetSiteCollections).then(function(result){
    that.metrics.end = new Date();
    that.messages.push({
      date: new Date(),
      verb: that.actions.Finished,
      text: 'Fetching all site collections',
      preposition: 'for',
      target: that.selectedItem.Title,
      url: '',
      type: 'info'
    });
    that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
    that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
    that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'})
    that.isSaving = false;
    siteCollections = result;
    resolve();
  });
  }).then(function(){
    that.metrics.start = new Date();
    that.progress = 0;
    that.isSaving = true;
    that.messages.push({
      date: new Date(),
      verb: that.actions.Starting,
      text: 'Fetching Groups for user in Site Collections',
      preposition: 'for',
      target: that.selectedItem.Title,
      url: '',
      type: 'warning'
    });
    that.getGroupsForUserInSiteCollections(that.selectedItem, targetSiteCollections).then(function(result){
      that.metrics.end = new Date();
      that.messages.push({
        date: new Date(),
        verb: that.actions.Finished,
        text: 'Fetching Groups for user in Site Collections',
        preposition: 'for',
        target: that.selectedItem.Title,
        url: '',
        type: 'info'
      });
      that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
      that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
      that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'})
      that.isSaving = false;
      console.log(result);
    });
  })
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
}
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
