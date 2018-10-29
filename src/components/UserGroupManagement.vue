<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex :xs6="!maximize" :xs12="maximize" :order-xs2="!maximize" :order-xs1="maximize">
        <Console default-message="To start, please select a site collection." :maximize="maximize" :is-item-selected="isItemSelected" :type="type" :is-saving="isSaving" :is-loading="isLoading || this.isLoadingSiteCollections.status" :save-progress="progress" :is-site-collection-selected="isSiteCollectionSelected" :messages="messages" @clear-console="clearConsole" @resize="resize"></Console>
      </v-flex>
      <v-flex  :xs6="!maximize" :xs12="maximize" :order-xs1="!maximize" :order-xs2="maximize">
        <Info @toggle-site-admin="toggleSiteAdmin(user, siteCollection)" @get-site-collections-for-user="getSiteCollectionsGroupsForUser" :available-users-site-collection-groups="availableUsersSiteCollectionGroups" @copy-dialog-opened="copyDialogOpened" :type="type" :update-selected-item="updateSelectedItem" :site-collection-has-item="siteCollectionHasItem" :is-saving="isSaving" :is-loading="isLoading" :site-collection="siteCollection" :is-site-collection-selected="isSiteCollectionSelected" :items="items" :assigned-items="assignedItems" :new-items="newItems"  @save="save" @item-changed="itemChanged" @purge-user="purgeUser"></Info>
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
          this.$router.push({ query: {}});
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
        this.clearSelected('available');
        this.clearSelected('assigned');
      },
      deep: true
    },
    type: {
      handler: function(newVal, oldVal){
        this.clearSelected('available');
        this.clearSelected('assigned');
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
