<template>
  <v-container fluid grid-list-md ref="container">
    <v-layout row wrap class="full-height">
      <v-flex :xs6="!maximize" :xs12="maximize" :order-xs2="!maximize" :order-xs1="maximize" >
        <Console ref="console" :width="consoleWidth" :height='consoleHeight +"px"' :position="consolePosition" :top="scrollTop + 'px'" :maximize="maximize" :is-item-selected="isItemSelected" :is-saving="isSaving" :is-loading="isLoading || this.isLoadingSiteCollections.status" :save-progress="progress" :messages="messages" @clear-console="clearConsole" @resize="resize"></Console>
      </v-flex>
      <v-flex  :xs6="!maximize" :xs12="maximize" :order-xs1="!maximize" :order-xs2="maximize">
        <admin-tree ref="adminTree" @toggle-site-admin="toggleSiteAdmin" :is-saving="isSaving" :is-loading="isLoading" :is-testing="isTesting" :site-collections="siteCollections" :site-collections-admins="siteCollectionsArr"></admin-tree>
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
        this.getIsLoadingSiteCollections();
      },
      deep: true
    }
  },

  data: function() {
    return {
      toggle_select: 0,
      isLoading: true,
      isSaving: false,
      progress: 0,
      isItemSelected: false,
      maximize: false,
      siteCollectionsArr: [],
      itemsSelected: {
        available: 0,
        assigned: 0
      },
      consolePosition: 'relative',
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
      },
      scrollTop: 0,
      consoleWidth: 'auto',
      consoleHeight: '480px'
    };
  },
  mounted:function(){

  },
  computed: {
    isIE: function(){
      return (navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true ); //IF IE > 10
    }
  },
  methods: {
    handleScroll: function(e){
    //  this.scrollTop = e.srcElement.scrollingElement ? e.srcElement.scrollingElement.scrollTop : document.documentElement.scrollTop;
  //    if(this.scrollTop > 0){
    //    this.consolePosition = 'fixed';
      //  this.scrollTop = this.$refs.console.$el.offsetTop +  this.$refs.console.$el.parentElement.offsetTop;
    //  } else {
    //    this.consolePosition = 'relative';
    //  }
    },
    toggleSiteAdmin: function(item, siteCollection){
      (function(that){
        var i;
        that.metrics.start = new Date();
        that.isSaving = true;
        var text = (item.IsSiteAdmin ? 'Removing from' : 'Adding to') + ' Site Collection Admins';
        new Promise(function(resolve, reject){
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Digest', target: '',  url: siteCollection.url,  type: 'warning'});
          that.getDigest(siteCollection, function(digest){
            that.digest = digest;
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: 'Fetching Digest', target: '', url: siteCollection.url,  type: 'info'});
            resolve();
          }, function(error){
            that.messages.push({date: new Date(), verb: that.actions.Failed, text: 'Fetching Digest', target: '',  hasError: true, message: error.message, url: siteCollection.url,  type: 'error'});
            resolve();
          });
        }).then(function(result){
          that.messages.push({date: new Date(), verb: that.actions.Starting, text: text,  preposition: 'for', target: item.Account ? item.Account : item.Name,   url: siteCollection.url,  type: 'warning'});
          that.updateUser(siteCollection, that.digest, item.Account, {IsSiteAdmin: !item.IsSiteAdmin}, function(result){
            that.messages.push({date: new Date(), verb: that.actions.Finished, text: text, preposition: 'for', target: item.Account ? item.Account : item.Name, url: siteCollection.url, type: 'info'});
            that.isSaving = false;
            that.metrics.end = new Date();
            that.$set(item, 'hasError', false);

          }, function(error){
              that.metrics.end = new Date();
              that.$set(item, 'hasError', true);
            that.messages.push({date: new Date(), verb: that.actions.Failed, text: text, hasError: true, message: error.message,  preposition: 'for', target: item.Account, url: siteCollection.url, type: 'error'});
            that.isSaving = false;
          });
        });
      })(this);
    },
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
    getTestAdminData: function(){
      var admins = this.$lodash.sampleSize(this.testUserProfiles, Math.floor(Math.random() * 10) + 1);
      var users = this.testUsers;
      var i;
      for(i = 0; i < admins.length; i++){
        admins[i].IsSiteAdmin = true;
      }
      return {
        admins: admins,
        users: users
      }
    },
    getIsLoadingSiteCollections: function(){
      var siteCollectionSelected;
      var adminsArr;
      var usersArr;
      if(this.isLoadingSiteCollections.status){
        this.messages.push({date: new Date(), verb: this.actions.Starting, preposition: ' ', text: 'Fetching Site Collections' , url: window.location.origin, type: 'warning'});
      } else {
        this.messages.push({date: new Date(), verb: this.actions.Finished, preposition: ' ', hasError: this.isLoadingSiteCollections.hasError, message: this.isLoadingSiteCollections.message,  text: 'Fetching Site Collections' , url: window.location.origin, type: 'info'});
        //now fetch all users and site collection admins for those site collections
        if(this.isTesting){
          var i;
          var testAdminData;
          if(this.isTesting){
            for(i = 0; i < this.siteCollections.length; i++){
              testAdminData = this.getTestAdminData();
              this.siteCollectionsArr.push({
                title: this.siteCollections[i].title,
                url: this.siteCollections[i].url,
                search: '',
                focus: false,
                admins:  testAdminData.admins,
                users: testAdminData.users
              });
            }
                this.isLoading = false;
          }
        } else{
        (function(that){
          new Promise(function(resolve, reject){
            that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Admins', preposition: false, target: '', url: '', type: 'warning'});
            that.getSiteCollectionsAdmins().then(function(data){
            adminsArr = data;
            that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Admins',  preposition: false, target: '', url: '', type: 'info'});
            resolve();
            });
          })/*.then(function(result){
            return new Promise(function(resolve, reject){
              that.messages.push({date: new Date(), verb: that.actions.Starting, text: 'Fetching Users',  preposition: false, target: '', url: '', type: 'warning'});
              that.getSiteCollectionsUsers().then(function(data){
                usersArr = data;
                  that.messages.push({date: new Date(), verb: that.actions.Finished, text:  'Fetching Users', preposition: false,  target: '', url: '', type: 'info'});
                  resolve();
              });
            });
          })*/.then(function(result){
            var i;
            for(i = 0; i < that.siteCollections.length; i++){
              if(typeof adminsArr[i] === 'undefined'){
                continue;
              }
              that.siteCollectionsArr.push({
                title: that.siteCollections[i].title,
                url: that.siteCollections[i].url,
                search: '',
                focus: false,
                admins:  adminsArr[i],
                users:  []
              });
            }
            that.isLoading = false;
          });
        })(this);
      }
      }
      return this.isLoadingSiteCollections.status;
    },
    getSiteCollectionsAdmins: function(){
      this.metrics.numFailed = 0;
      this.metrics.numSuccesses = 0;
      var message =  {
        type: 'table',
        pagination: {
          sortBy: 'operation',
          descending: false
        },
        search: '',
        headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []
      };
      var messageList = message.rows;
      this.messages.push(message);
      var promiseArr;
      (function(that){
        promiseArr = that.siteCollections.map(function(siteCollection){
          return that.getSiteCollectionDataAsync(siteCollection, messageList);
        });
      })(this);
      return Promise.all(promiseArr);
    },
    getSiteCollectionDataAsync: function(siteCollection, messageList){
      messageList.push({status: 'pending', url: siteCollection.url, target: siteCollection.Title, operation: 'Get Admins', error: {expanded: false, message: '', title: ''}});
      var message = messageList[messageList.length - 1];
      var promise;
      (function(that){
        promise = new Promise(function(resolve, reject){
          that.getSiteCollectionAdmins(siteCollection, function(results){
            message.status="done"
            resolve(results);
          }, function(error){
              message.status = 'error';
              message.error = {expanded: false, message: error.stack, title: error.message};
              resolve();
          });
        });
      })(this);
      return promise;
    },
    getSiteCollectionsUsers: function(){
      this.metrics.numFailed = 0;
      this.metrics.numSuccesses = 0;
      var message =  {
        type: 'table',
        pagination: {
          sortBy: 'operation',
          descending: false
        },
        search: '',
        headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []
      };
      var messageList = message.rows;
      this.messages.push(message);
      var promiseArr;
      (function(that){
        promiseArr = that.siteCollections.map(function(siteCollection){
          return that.getSiteCollectionUsersAsync(siteCollection, messageList);
        });
      })(this);
      return Promise.all(promiseArr);
    },
    getSiteCollectionUsersAsync: function(siteCollection, messageList){
      messageList.push({status: 'pending', url: siteCollection.url, target: siteCollection.Title, operation: 'Get Users', error: {expanded: false, message: '', title: ''}});
      var message = messageList[messageList.length - 1];
      var promise;
      (function(that){
        promise = new Promise(function(resolve, reject){
          that.getUsers(siteCollection, false, function(users){
            message.status = 'done';
            resolve(users);
          }, function(error){
            message.status = 'error';
            message.error = {expanded: false, message: error.stack, title: error.message};
            resolve();
          })
        })
      })(this);
      return promise;
    },
    clearConsole: function(){
      this.messages = [];
    }
},
beforeMount: function(){
  window.addEventListener('scroll', this.handleScroll);
},
beforeDestroy: function(){
   window.removeEventListener('scroll', this.handleScroll);
},
mounted: function(){
  if(!this.isIE){
    this.consoleWidth =  '100%';
    this.consolePosition = 'sticky';
  } else {
    this.consoleWidth =  this.$refs.console.$el.parentElement.offsetWidth + 'px';
  }
    this.consoleHeight = document.documentElement.clientHeight - (this.$refs.console.$el.offsetTop + this.$refs.console.$el.offsetParent.offsetTop) - this.$refs.console.$el.offsetTop;

    if(this.isIE){
      this.consoleWidth =  this.$refs.adminTree.$el.clientWidth + 'px';
      this.consolePosition = 'fixed';
    }
    this.scrollTop = this.$refs.console.$el.offsetTop + this.$refs.console.$el.offsetParent.offsetTop;
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
  transition: width .2s;
}


</style>
