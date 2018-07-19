<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex xs6>
        <Info :type="type" :update-selected-item="updateSelectedItem" :site-collection-has-item="siteCollectionHasItem" :is-saving="isSaving" :is-loading="isLoading" :site-collection="siteCollection" :is-site-collection-selected="isSiteCollectionSelected" :items="items" :assigned-items="assignedItems" :new-items="newItems"  @save="save" @item-changed="itemChanged"></Info>
      </v-flex>
      <v-flex xs6>
        <Console :is-saving="isSaving" :is-loading="isLoading" :save-progress="saveProgress" :is-site-collection-selected="isSiteCollectionSelected" :messages="messages" @clear-console="clearConsole"></Console>
      </v-flex>
      <v-flex xs6>
        <SelectAvailable :site-collection-has-item="siteCollectionHasItem"  :is-any-selected="isAnyAvailableSelected" :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving" :is-loading="isLoading" :is-site-collection-selected="isSiteCollectionSelected" :items="availableItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAvailable>
      </v-flex>
      <v-flex xs6>
        <SelectAssigned :site-collection-has-item="siteCollectionHasItem"  :is-any-selected="isAnyAssignedSelected" :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving" :is-loading="isLoading" :is-site-collection-selected="isSiteCollectionSelected" :items="assignedItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAssigned>
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
                that.getItem(function(){
                  that.$router.push({ query: { url: that.siteCollection !== null ? that.siteCollection.url : '', loginname: that.selectedItem !== null ? that.selectedItem.LoginName : ''}});
                });
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
        this.messages.push({date: new Date(), verb: this.actions.Starting, preposition: ' ', text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
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
                that.assignedItems = []
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
            var rand = Math.random();

            return rand == 0 ? errorCallback({message: 'Bad Stuff Happened'}) : callback(that.testUsers);
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
      var selectedItems = type == 'available' ? this.selectedAvailable : this.selectedAssigned;
      var items = type == 'available' ? this.availableItems : this.assignedItems;
      var isAnySelected = type == 'available' ? this.isAnyAvailableSelected : this.isAnyAssignedSelected;
      items = this.$lodash.sortBy(items, [function(o){
        return o.Title.toLowerCase();
      }]);

      for(key in selectedItems){
        items[selectedItems[key].index].selected = false;
        delete selectedItems[key];
      }
      isAnySelected = false;
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
            that.assignedItems =  that.$lodash.sampleSize(that.type.users ? that.testGroups : that.testUsers, Math.floor(Math.random() * 10) + 1);
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
    selectItem: function(type, item, index){
      var selectedItems = type == 'available' ? this.selectedAvailable : this.selectedAssigned;
      var items = type == 'available' ? this.availableItems : this.assignedItems;
      var isAnySelected = type == 'available' ? this.isAnyAvailableSelected : this.isAnyAssignedSelected;
      /*  selectedItems = this.$lodash.sortBy(selectedItems, [function(o){
      return o.Title;
    }]);
    */  items = this.$lodash.sortBy(items, [function(o){
    return o.Title.toLowerCase();
  }]);
  this.$set(items[index], 'selected', items[index].selected !== undefined ? !items[index].selected : true);
  //items[index].selected = items[index].selected !== undefined ? !items[index].selected : true;
  if(  items[index].selected){
    this.$set(selectedItems, item.LoginName, items[index]);
    //set index so we can easily find this item when we "give/remove" it
    selectedItems[item.LoginName].index = index;
  } else {
    delete selectedItems[item.LoginName];
  }
  this.$set(this, type == 'available' ? 'selectedAvailable' : 'selectedAssigned', selectedItems);
},
giveAll: function(sourceType){
  var sourceSelectedItems;
  var targetSelectedItems;
  var sourceItems;
  var key;
  var index = 0;
  var targetItems;
  var isOriginalItem;
  var itemIndex;
  var newItemIndex;
  var i;
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
  if(sourceType == 'assigned'){
    this.newItems = [];
  }
  //move items from selected into target lists
  i = sourceItems.length;
  while(i--){
    //push item to target
    sourceItems[i].selected = false;
    targetItems.push(JSON.parse(JSON.stringify(sourceItems[i])));
    itemIndex = this.$lodash.findIndex(this.originalAssignedItems, function(o){
      return o.title == sourceItems[i].title
    });
    isOriginalItem = itemIndex > -1;
    if(isOriginalItem && sourceType =='assigned' || !isOriginalItem && sourceType == 'available'){
      this.newItems.push(JSON.parse(JSON.stringify(sourceItems[i])));
      this.newItems[this.newItems.length - 1].operation = sourceType == 'available' ? 'add' : 'delete';
    } else {
      newItemIndex = this.$lodash.findIndex(this.newItems, function(o){
        return o.title == sourceItems[i].title
      });
      this.newItems.splice(newItemIndex, 1);
    }
    sourceItems.splice(i, 1);
  }


  //merge the selected items into the target selected items (maintains previously selected items)
  //      targetSelectedItems = Object.assign(targetSelectedItems, sourceSelectedItems);
  //now that the target selected items are merged, delete
  //index = targetItems.length - Object.keys(sourceSelectedItems).length;
  for(key in sourceSelectedItems){
    //    targetSelectedItems[key].index = this.$lodash.findIndex(targetItems, function(o) { return o.title == key});
    delete sourceSelectedItems[key];
    //  index++;
  }
},
giveSelected: function(sourceType){
  var sourceSelectedItems;
  var targetSelectedItems;
  var sourceItems;
  var isOriginalItem = false;
  var key;
  var index = 0;
  var itemIndex;
  var newItemIndex;
  var targetItems;
  var modIndex = 0;
  var indexRemovedArr = [];
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
  for(key in sourceSelectedItems){
    sourceItems[sourceSelectedItems[key].index].selected = false;
    //push item to target
    targetItems.push(JSON.parse(JSON.stringify(sourceItems[sourceSelectedItems[key].index])));
    //delete targetItems[targetItems.length -1].index;
    itemIndex = this.$lodash.findIndex(this.originalAssignedItems, function(o){
      return o.LoginName == sourceSelectedItems[key].LoginName
    });
    isOriginalItem = itemIndex > -1;
    if(isOriginalItem && sourceType =='assigned' || !isOriginalItem && sourceType == 'available'){
      this.newItems.push(JSON.parse(JSON.stringify(sourceItems[sourceSelectedItems[key].index])));
      this.newItems[this.newItems.length - 1].operation = sourceType == 'available' ? 'add' : 'delete';
    } else {
      newItemIndex = this.$lodash.findIndex(this.newItems, function(o){
        return o.LoginName == sourceSelectedItems[key].LoginName
      });
      this.newItems.splice(newItemIndex, 1);
    }
  }

  for(key in sourceSelectedItems){
    //remove item from source
    modIndex = this.$lodash.filter(indexRemovedArr, function(indexNum){ return indexNum < sourceSelectedItems[key].index }).length;
    sourceItems.splice(sourceSelectedItems[key].index - modIndex, 1);
    indexRemovedArr.push(sourceSelectedItems[key].index);
  }

  this.$set(this, sourceType == 'available' ? 'availableItems' : 'assignedItems', sourceItems);

  //merge the selected items into the target selected items (maintains previously selected items)
  //    targetSelectedItems = Object.assign(targetSelectedItems, sourceSelectedItems);
  //  index = targetItems.length - Object.keys(sourceSelectedItems).length;
  for(key in sourceSelectedItems){
    //    targetSelectedItems[key].index = index;
    delete sourceSelectedItems[key];
    index++;
  }
},
save: function(){
  this.isSaving = true;
  this.saveProgress = 0;
  this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Saving ' + (this.type.users ? 'Groups' : 'Users'), target: this.selectedItem.Title,  url: this.siteCollection.url,  type: 'warning'});
  this.saveIndex = 0;
  (function(that){
    var promiseArr = [];
    var i;
    if(!that.isTesting){
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
      for(i = 0; i < that.newItems.length; i++){
        promiseArr.push(new Promise(function(resolve, reject){
          var operationText = that.newItems[that.saveIndex].operation.charAt(0).toUpperCase() +  that.newItems[that.saveIndex].operation.slice(1);
          var preposition = that.newItems[that.saveIndex].operation == 'add' ? 'to' : 'from';
          that.messages.push({
            date: new Date(),
            verb: that.actions.Starting,
            text:operationText + ' ' + that.newItems[i].LoginName,
            preposition: preposition,
            target: that.selectedItem.LoginName,
            url: that.siteCollection.url,
            type: 'info'
          });
          that[that.newItems[that.saveIndex].operation == 'add' ? 'addUserToGroup' : 'removeUserFromGroup'](that.siteCollection, that.digest, that.type.users ? that.newItems[i].Id : that.selectedItem.Id, that.type.groups ? that.newItems[i] : that.selectedItem,function(results){
            var operationText = that.newItems[that.saveIndex].operation.charAt(0).toUpperCase() +  that.newItems[that.saveIndex].operation.slice(1);
            var preposition = that.newItems[that.saveIndex].operation == 'add' ? 'to' : 'from';
            that.messages.push({
              date: new Date(),
              verb: that.actions.Success,
              text:operationText + ' ' + that.newItems[i].LoginName,
              preposition: preposition,
              target: that.selectedItem.LoginName,
              url: that.siteCollection.url,
              type: 'success'
            });
                that.saveProgress += 100/that.newItems.length;
            resolve();
          }, function(error){
            console.log(error);
            console.log("index: " + that.saveIndex);
            console.log(that.newItems);
            var operationText = that.newItems[that.saveIndex].operation.charAt(0).toUpperCase() +  that.newItems[that.saveIndex].operation.slice(1);
            var preposition = that.newItems[that.saveIndex].operation == 'add' ? 'to' : 'from';
            that.messages.push({date: new Date(), verb: that.actions.Failed, text:  operationText + (that.type.users ? 'Groups' : 'Users'), preposition: preposition, hasError: true, message: error.message, target: that.selectedItem.Title, url: that.siteCollection.url, type: 'error'});
            that.saveProgress += 100/that.newItems.length;
              resolve();
          })
        }));
      }
      Promise.all(promiseArr).then(function(){
        that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Saving' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.LoginName, url: that.siteCollection.url, type: 'info'});
        that.isSaving = false;
      });
        });
    } else {
      that.updateProgressInterval = setInterval(function(){
        that.saveProgress += 100/that.newItems.length;

        that.messages.push({date: new Date(), verb: that.actions.Success, text:operationText + ' ' + that.newItems[that.saveIndex].LoginName, preposition: preposition, target: that.selectedItem.LoginName,  url: that.siteCollection.url, type: 'success'});
        that.saveIndex++;
        if(that.saveIndex == that.newItems.length){
          that.isSaving = false;
          that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Saving' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.LoginName, url: that.siteCollection.url, type: 'info'});
          that.newItems = [];
          clearInterval(  that.updateProgressInterval);
          //update originating Items
          var i = 0;
          that.originalAssignedItems = [];
          that.newItems = [];
          for(i = 0; i < that.assignedItems.length; i++){
            that.originalAssignedItems.push(JSON.parse(JSON.stringify(that.assignedItems[i])));
          }
        }
      }, 100);
    }
  })(this);
},
clearConsole: function(){
  this.messages = [];
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
