<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex xs6>
        <Info :is-saving="isSaving" :is-loading="isLoading" :site-collection="siteCollection" :is-site-collection-selected="isSiteCollectionSelected" :items="items" :assigned-items="assignedItems" :new-items="newItems"  @save="save" @item-changed="itemChanged"></Info>
      </v-flex>
      <v-flex xs6>
        <Console :is-saving="isSaving" :is-loading="isLoading" :save-progress="saveProgress" :is-site-collection-selected="isSiteCollectionSelected" :messages="messages" @clear-console="clearConsole"></Console>
      </v-flex>
      <v-flex xs6>
        <SelectAvailable :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving" :is-loading="isLoading" :is-site-collection-selected="isSiteCollectionSelected" :available-items="availableItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAvailable>
      </v-flex>
      <v-flex xs6>
        <SelectAssigned :is-item-selected="isItemSelected" :selected-item="selectedItem" :is-saving="isSaving" :is-loading="isLoading" :is-site-collection-selected="isSiteCollectionSelected" :assigned-items="assignedItems" @give-all="giveAll" @give-selected="giveSelected" @clear-selected="clearSelected" @select-item="selectItem"></SelectAssigned>
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


export default {
  mixins: [Data],
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
    }
  },
  watch: {
    isSiteCollectionSelected: {
      handler: function(){
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
        this.getData();
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
      drawer: false,
      toggle_select: 0,
      isSaving: false,
      isLoading: false,
      saveProgress: 0,
      isItemSelected: false,
      savingIndex: 0,
      updateProgressInterval: false,
      selectedItem: null,
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
    getIsLoadingSiteCollections(val){
      if(this.isLoadingSiteCollections.status){
        this.messages.push({date: new Date(), verb: this.actions.Starting, preposition: ' ', text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
      } else {
        this.messages.push({date: new Date(), verb: this.actions.Finished, preposition: ' ', hasError: this.isLoadingSiteCollections.hasError, message: this.isLoadingSiteCollections.message,  text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
      }
    },
    getData: function(){
      this.isLoading = true;
      (function(that){
        new Promise(function(resolve, reject){
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Users', target: that.siteCollection.title, url: that.siteCollection.url, type: 'warning'});
          that.getUsersForSiteCollection(function(data){
            if(that.type.users){
              that.items = data;
            }
            that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Users', target: that.siteCollection.title, url: that.siteCollection.url, type: 'info'});
            resolve();
          }, function(error){
            that.messages.push({date: new Date(), verb: that.actions.Failed, text:  'Fetching Users',  hasError: true, error: error.message, target: that.siteCollection.title, url: that.siteCollection.url, type: 'error'});
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
              }
              that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Groups', target: that.siteCollection.title, url: that.siteCollection.url, type: 'info'});
              resolve();
            }, function(error){
              that.messages.push({date: new Date(), verb: that.actions.Failed, text:  'Fetching Groups', hasError: true, error: error.message, target: that.siteCollection.title, url: that.siteCollection.url, type: 'error'});
              that.isLoading = false;
            });
          });
        }).then(function(result){
          that.isLoading = false;
          that.$emit('site-collection-selected', true);
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

            return rand == 0 ? errorCallback({message: 'Bad Stuff Happened'}) : callback([{Title:'Foo Bar', LoginName: 'foo.bar', Email: 'foo.bar@example.com'},{Title:'Joe Schmoe', LoginName: 'joe.schmoe', Email: 'joe.schmoe@example.com'}]);
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

            return rand == 0 ? errorCallback({message: 'Bad Stuff Happened'}) : callback([{title: 'Perm1', subtitle: "", selected: false },
            {title: 'Perm2', subtitle: "", selected: false },
            { title: 'Perm3', subtitle: "", selected: false },
            {title: 'Perm4', subtitle: "", selected: false },
            {title: 'Perm5', subtitle: "", selected: false },
            { title: 'Perm6', subtitle: "", selected: false }]);

          },1000);
        } else {

        }
      })(this);
    },
    clearSelected: function(type){
      var key;
      var selectedItems = type == 'available' ? this.selectedAvailable : this.selectedAssigned;
      var items = type == 'available' ? this.availableItems : this.assignedItems;
      for(key in selectedItems){
        items[selectedItems[key].index].selected = false;
        delete selectedItems[key];
      }
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
        this.selectedItem = null;
        this.isItemSelected = false;
      } else {
        this.selectedItem = item.Title.length > 0 ? item : false;
        i = this.assignedItems.length;
        while(i--){
          this.originalAssignedItems.push(JSON.parse(JSON.stringify(this.assignedItems[i])));
        }
        this.isItemSelected = true;
        this.getItem();
      }
    },
    getItem: function(){
      this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Fetching ' + (this.type.users ? 'Groups' : 'Users'), preposition: 'for', target: this.selectedItem.Title, type: 'warning'});
      this.isLoading = true;
      (function(that){
        if(that.isTesting){
          setTimeout(function(){
            if(that.type.users){
              that.assignedItems =  [{title: 'Perm4', subtitle: "", selected: false },
              {title: 'Perm5', subtitle: "", selected: false },
              { title: 'Perm6', subtitle: "", selected: false }];
              //remove assigned items from available
              that.availableItems = that.$lodash.partition(that.originalAvailableItems, function(o){
                return that.$lodash.find(that.assignedItems, o) === undefined;
              })[0];
            }
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Fetching ' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.Title, type: 'info'});
            that.isLoading = false;
          },1000);
        } else {

        }
      })(this);
    },
    selectItem: function(type, item, index){
      var selectedItems = type == 'available' ? this.selectedAvailable : this.selectedAssigned;
      var items = type == 'available' ? this.availableItems : this.assignedItems;
      items[index].selected = !items[index].selected;
      if(  items[index].selected){
        selectedItems[item.title] =  items[index];
        //set index so we can easily find this item when we "give/remove" it
        selectedItems[item.title].index = index;
      } else {
        delete selectedItems[item.title];
      }
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

      //move items from selected into target lists
      for(key in sourceSelectedItems){
        sourceItems[sourceSelectedItems[key].index].selected = false;
        //push item to target
        targetItems.push(JSON.parse(JSON.stringify(sourceItems[sourceSelectedItems[key].index])));
        //delete targetItems[targetItems.length -1].index;
        itemIndex = this.$lodash.findIndex(this.originalAssignedItems, function(o){
          return o.title == sourceSelectedItems[key].title
        });
        isOriginalItem = itemIndex > -1;
        if(isOriginalItem && sourceType =='assigned' || !isOriginalItem && sourceType == 'available'){
          this.newItems.push(JSON.parse(JSON.stringify(sourceItems[sourceSelectedItems[key].index])));
          this.newItems[this.newItems.length - 1].operation = sourceType == 'available' ? 'add' : 'delete';
        } else {
          newItemIndex = this.$lodash.findIndex(this.newItems, function(o){
            return o.title == sourceSelectedItems[key].title
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
      this.messages.push({date: new Date(), verb: this.actions.Starting, text: 'Saving ' + (this.type.users ? 'Groups' : 'Users'), target: this.selectedItem.Title, type: 'warning'});
      this.saveIndex = 0;
      (function(that){
        that.updateProgressInterval = setInterval(function(){
          that.saveProgress += 100/that.newItems.length;
          var operationText = that.newItems[that.saveIndex].operation.charAt(0).toUpperCase() +  that.newItems[that.saveIndex].operation.slice(1);
          var preposition = that.newItems[that.saveIndex].operation == 'add' ? 'to' : 'from';
          that.messages.push({date: new Date(), verb: that.actions.Success, text:operationText + ' ' + that.newItems[that.saveIndex].title, preposition: preposition, target: that.selectedItem.Title,type: 'success'});
          that.saveIndex++;
          if(that.saveProgress >= 100){
            that.isSaving = false;
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Saving' + (that.type.users ? 'Groups' : 'Users'), preposition: 'for', target: that.selectedItem.Title,type: 'info'});
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
