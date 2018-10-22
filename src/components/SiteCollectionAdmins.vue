<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap class="full-height">
      <v-flex :xs6="!maximize" :xs12="maximize" :order-xs2="!maximize" :order-xs1="maximize" >
        <Console :maximize="maximize" :is-item-selected="isItemSelected" :is-saving="isSaving" :is-loading="isLoading || this.isLoadingSiteCollections.status" :save-progress="progress" :messages="messages" @clear-console="clearConsole" @resize="resize"></Console>
      </v-flex>
      <v-flex  :xs6="!maximize" :xs12="maximize" :order-xs1="!maximize" :order-xs2="maximize">
        <admin-tree :is-testing="isTesting" :site-collections="siteCollections" :site-collection-admins="siteCollectionAdmins"></admin-tree>
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
import AdminTree from "./AdminTree";
import Data from '../mixins/Data.vue';
import TestData from '../mixins/TestData.vue';
import UserGroupManagement_SiteCollectionAdmins from '../mixins/UserGroupManagement.SiteCollectionAdmins.vue';
import UserGroupManagement_UserGroups from '../mixins/UserGroupManagement.UserGroups.vue';
import UserGroupManagement_Copy from '../mixins/UserGroupManagement.Copy.vue';

export default {
  mixins: [Data, TestData, UserGroupManagement_SiteCollectionAdmins, UserGroupManagement_UserGroups, UserGroupManagement_Copy],
  components: {
    Console: Console,
      AdminTree: AdminTree
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
    siteCollections: {
      type: Array,
      default: function(){
        return [];
      }
    },
    isTesting: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    isLoadingSiteCollections: {
      handler: function(newVal, oldVal){
        this.getIsLoadingSiteCollections(newVal.status);
      },
      deep: true
    }
  },

  data: function() {
    return {
      toggle_select: 0,
      isSaving: false,
      isLoading: false,
      progress: 0,
      isItemSelected: false,
      maximize: false,
      siteCollectionAdmins: [],
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
      messages: [],
      actions: {
        Starting: 'Starting',
        Finished: 'Finished',
        Failed: 'Failed',
        Success: 'Success'
      }
    };
  },
  mounted:function(){

  },
  methods: {
    resize: function(){
      this.maximize = !this.maximize;
    },
    getChildren: function(){
      return this.$lodash.sampleSize(this.testUsers, Math.floor(Math.random() * 10) + 1)
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

clearConsole: function(){
  this.messages = [];
}
},
created: function(){
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
