
<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex :xs6="!maximize" :xs12="maximize" :order-xs2="!maximize" :order-xs1="maximize">
        <Console
        :showDefaultMessage="(siteCollection == null || (selectedItem == null && !selectedItemExists))"
        :defaultMessage="siteCollection == null ? 'Please select a site collection.' : (selectedItem == null ? 'Please select a ' + type.substring(0, type.length - 1) : '')"
        :maximize="maximize" :is-item-selected="isItemSelected"
        :is-saving="isSaving"
        :is-loading="isLoading" :save-progress="progress" :is-site-collection-selected="isSiteCollectionSelected" :messages="messages" @clear-console="clearConsole" @resize="resize"></Console>
      </v-flex>
      <v-flex  :xs6="!maximize" :xs12="maximize" :order-xs1="!maximize" :order-xs2="maximize">
        <Info
        :selected-item-exists="selectedItemExists"
        :site-collections="siteCollections"
        :initial-site-collection="siteCollection"
        :initial-type="type"
        :initial-selected-item="selectedItem"
        :available-users-site-collection-groups="availableUsersSiteCollectionGroups"
        :type="type"
        :update-selected-item="updateSelectedItem"
        :site-collection-has-item="siteCollectionHasItem"
        :is-saving="isSaving" :is-loading="isLoading"
        :site-collection="siteCollection"
        :is-site-collection-selected="isSiteCollectionSelected"
        :items="items"
        :assigned-items="assignedItems"
        :new-items="newItems"
        @save="save"
        @type-changed="typeChanged"
        @site-collection-changed="siteCollectionChanged"
        @toggle-site-admin="toggleSiteAdmin(selectedItem, siteCollection)"
        @get-site-collections-for-user="getSiteCollectionsGroupsForUser"
        @copy-dialog-opened="copyDialogOpened"
        @item-changed="itemChanged"
        @purge-user="purgeUser"
        @create-user="createUser"
        ></Info>
      </v-flex>
      <v-flex xs6 order-xs3 >
        <SelectAvailable
        :type="type"
        :num-selected="itemsSelected.available"
        :site-collection-has-item="siteCollectionHasItem"
        :is-any-selected="isAnyAvailableSelected"
        :is-item-selected="isItemSelected"
        :selected-item="selectedItem"
        :is-saving="isSaving || copyDialogOpen"
        :is-loading="isLoading || copyDialogOpen"
        :is-site-collection-selected="isSiteCollectionSelected"
        :items="availableItems"
        @give-all="giveAll"
        @give-selected="giveSelected"
        @clear-selected="clearSelected"
        @select-item="selectItem">
      </SelectAvailable>
    </v-flex>
    <v-flex xs6 order-xs4 >
      <SelectAssigned
      :type="type"
      :num-selected="itemsSelected.assigned"
      :site-collection-has-item="siteCollectionHasItem"
      :is-any-selected="isAnyAssignedSelected"
      :is-item-selected="isItemSelected"
      :selected-item="selectedItem"
      :is-saving="isSaving || copyDialogOpen"
      :is-loading="isLoading || copyDialogOpen"
      :is-site-collection-selected="isSiteCollectionSelected"
      :items="assignedItems"
      @give-all="giveAll"
      @give-selected="giveSelected"
      @clear-selected="clearSelected"
      @select-item="selectItem">
    </SelectAssigned>
  </v-flex>
</v-layout>
<v-snackbar :timeout="snackbar.timeout" :top="snackbar.y === 'top'" :bottom="snackbar.y === 'bottom'" :right="snackbar.x === 'right'" :left="snackbar.x === 'left'" :multi-line="snackbar.mode === 'multi-line'" :vertical="snackbar.mode === 'vertical'" v-model="snackbar.show">
  {{ snackbar.text }}
  <v-btn flat color="pink" @click.native="snackbar.show = false">Close</v-btn>
</v-snackbar>
</v-container>
</template>

<script>
import Console from './Console.vue';
import Info from './Info.vue';
import SelectAssigned from './SelectAssigned.vue';
import SelectAvailable from './SelectAvailable.vue';
import Data from '../mixins/Data.vue';
import TestData from '../mixins/TestData.vue';
import UserGroupManagement_SiteCollectionAdmins from '../mixins/UserGroupManagement.SiteCollectionAdmins.vue';
import UserGroupManagement_UserGroups from '../mixins/UserGroupManagement.UserGroups.vue';
import UserGroupManagement_Copy from '../mixins/UserGroupManagement.Copy.vue';

export default {
  mixins: [Data, TestData, UserGroupManagement_SiteCollectionAdmins, UserGroupManagement_UserGroups, UserGroupManagement_Copy],
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
    initialType: {
      type: String,
      default: 'users'
    },
    initialSiteCollectionUrl: {
      type: String,
      default: ''
    },
    initialSelectedItem: {
      type: String,
      default: ''
    },
    isTesting: {
      type: Boolean,
      default: false
    }
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
          return;
        }
        this.isSiteCollectionSelected = true;
        this.$router.push({ query: this.query});
        if(this.siteCollection !== null){
          (function(that){
            new Promise(function(resolve, reject){
              that.getData(function(){
                if(that.selectedItem !== null && that.initialSelectedItem.length > 0){
                  that.selectedItem = that.$lodash.find(that.items, function(o){
                    return o.LoginName == that.initialSelectedItem;
                  });
                }
                that.selectedItemExists = typeof that.selectedItem != 'undefined';
                resolve();
              });
            });
      })(this);
    }
  },
  deep: true
},
type: {
  handler: function(newVal, oldVal){
    this.$router.push({query: this.query});
  }
},
selectedItem: {
  handler: function(newVal, oldVal){
    this.$router.push({ query: this.query});
    this.selectedItemExists = true;
    this.clearSelected('available');
    this.clearSelected('assigned');
  },
  deep: true
}
},
computed: {
  query: function(){
    var query = {};
    if(this.siteCollection !== null){
      query.url = this.siteCollection.url;
    }
    if(this.selectedItem !== null && typeof this.selectedItem != 'undefined'){
      query.loginname = this.selectedItem.LoginName;
    }
    query.type = this.type;
    return query;
  }
},
data: function() {
  return {
    updateSelectedItem: null,
    isAnyAvailableSelected: false,
    isAnyAssignedSelected: false,
    isSiteCollectionSelected: false,
    drawer: false,
    toggle_select: 0,
    isSaving: false,
    isLoading: false,
    selectedItemExists: true,
    progress: 0,
    isItemSelected: false,
    maximize: false,
    copyDialogOpen: false,
    availableUsersSiteCollectionGroups: [],
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
    siteCollections: [],
    savingIndex: 0,
    updateProgressInterval: false,
    selectedItem: null,
    siteCollection: null,
    type: this.initialType,
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
    consoleMessage: 'Please select a site collection',
    actions: {
      Starting: 'Starting',
      Finished: 'Finished',
      Failed: 'Failed',
      Success: 'Success'
    }
  };
},
methods: {
  createUser: function(user){
    (function(that){
    new Promise(function(resolve, reject){
      if(user == null || typeof user === 'undefined'){
        return;
      }
      that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Digest', target: that.siteCollection.title, url: that.siteCollection.url, type: 'warning'});
      that.getDigest(that.siteCollection, function(data){
        that.digest = data;
        that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Digest', target: that.siteCollection.title, url: that.siteCollection.url, type: 'info'});
        resolve();
      }, function(error){
        that.messages.push({date: new Date(), verb: that.actions.Failed, text:  'Fetching Digest', hasError: true, message: error.message, target: that.siteCollection.title, url: that.siteCollection.url, type: 'error'});
        resolve();
      });
    }).then(function(result){
    that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Creating User', target: that.siteCollection.title, url: that.siteCollection.url, type: 'warning'});
      that.ensureUser(that.siteCollection, that.digest, user.LoginName, function(user){
        that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Creating User', target: that.siteCollection.title, url: that.siteCollection.url, type: 'info'});
        //that.checkIfUserExists(that.selectedItem != null ? that.selectedItem.LoginName : that.loginname != null ? that.loginname: '');
        //now that we have ensured the user in the site collection, add them to the users dropdown
        //that.items.push(user);
        that.selectedItem = user;
      }, function(error){
        that.messages.push({date: new Date(), verb: that.actions.Failed, text:  'Creating User', hasError: true, message: error.message, target: that.siteCollection.title, url: that.siteCollection.url, type: 'error'});
      });
    });
  })(this);
},
typeChanged: function(type){
  this.type = type;
  this.getData();
},
copyDialogOpened: function(isOpened){
  this.copyDialogOpen = isOpened;
},
resize: function(){
  this.maximize = !this.maximize;
},
getSiteCollectionData: function(){
  (function(that){
    if(that.isTesting){
      that.messages.push({date: new Date(), verb: that.actions.Starting, preposition: ' ', text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
      setTimeout(function(){
        //populate items for current type and populate availabe items for the opposing type
        //re-select previously selected item if its available
        //trigger select change for selected item if it exists, else clear selected item
        that.siteCollections = [{
          title:'Home',
          url: 'https://localhost:8080/#/',
          origin: 'https://localhost:8080'},
          {title:  'Engineering', url: 'https://localhost:8080/#/sites/eng', origin: 'https://localhost:8080'}, {title: 'Quality Assurance', url: 'https://localhost:8080/#/sites/qa', origin: 'https://localhost:8080'}];
          that.isLoading = false;
          if(that.initialSiteCollectionUrl.length > 0){
            that.siteCollection = that.$lodash.find(that.siteCollections, function(o){
              return o.url == that.initialSiteCollectionUrl;
            });
          }
          that.siteCollection = typeof that.siteCollection !== 'undefined' ? that.siteCollection : null;
          if(that.siteCollection != null){
            that.isSiteCollectionSelected = true;
          }
        },1000);
      } else {
        that.getSiteCollections(function(siteCollections){
          var i;
          that.siteCollections = siteCollections;
          that.isLoading = false;
          that.messages.push({date: new Date(), verb: that.actions.Finished, preposition: ' ', hasError: that.isLoadingSiteCollections.hasError, message: that.isLoadingSiteCollections.message,  text: 'Fetching Site Collections' , url: window.location.origin, type: 'info'});
          if(that.initialSiteCollectionUrl.length > 0){
            that.siteCollection = that.$lodash.find(that.siteCollections, function(o){
              return o.url == that.initialSiteCollectionUrl;
            });
          }
          that.siteCollection = typeof that.siteCollection !== 'undefined' ? that.siteCollection : null;
          if(that.siteCollection != null){
            that.isSiteCollectionSelected = true;
          }
        }, function(error){
          that.isLoading = false;
          that.messages.push({date: new Date(), verb: that.actions.Failed, preposition: ' ', hasError: true, message: error.message,  text: 'Fetching Site Collections' , url: window.location.origin, type: 'error'});
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
  siteCollectionChanged: function(item){
    this.siteCollection = item;
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

  clearConsole: function(){
    this.messages = [];
  }
},
created: function(){
  this.getSiteCollectionData();
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
