<template>
<div class="flexcard" :style="{width: '100%', 'min-height': '480px'}">
  <v-card class="grow flexcard" >
    <transition name="card-swap">
    <div v-if="copyDialog==false" class="grow flexcard">
    <v-card-text class="grow">
      <v-container fill-height fluid>
        <v-layout fill-height>
          <v-flex xs12 align-end flexbox>
            <v-form>
                <SearchSelect :disabled="isSaving || isLoading" v-model="siteCollection" @change="itemChanged" :items="siteCollections" item-value="title" return-object item-text="title" label="Select Site Collection" light inactiveColor="#000"></SearchSelect>
                <v-radio-group v-model="type" row :disabled="isSaving || isLoading">
                   <v-radio key="users" label="Users" value="users"></v-radio>
                   <v-radio key="groups" label="Groups" value="groups"></v-radio>
                 </v-radio-group>
                 <div v-if="siteCollection != null">
              <SearchSelect :disabled="isSaving || isLoading || !isSiteCollectionSelected" v-model="selectedItem" @change="itemChanged" :items="items" item-value="Title" return-object item-text="Title" :label="'Select ' + (type == 'users' ? 'User' : 'Group')" light inactiveColor="#000"></SearchSelect>
              <div v-if="type == 'users'">
                <v-text-field label="Login Name" readonly disabled :value="selectedItem !== null ? selectedItem.LoginName: ''"></v-text-field>
                <v-text-field label="E-mail" readonly disabled :value="selectedItem !== null ? selectedItem.Email : ''"></v-text-field>
                <Checkbox :disabled="selectedItem == null || isSaving || isLoading || !isSiteCollectionSelected" @toggle-checked="toggleIsSiteAdmin" :isChecked="selectedItem !== null ? selectedItem.IsSiteAdmin : false">Is Site Admin</Checkbox>
              </div>
              <div v-else>
                <v-text-field label="Owner" readonly disabled :value="selectedItem !== null ? selectedItem.OwnerTitle: ''"></v-text-field>
                <v-textarea label="Description" readonly auto-grow rows="1" disabled :value="selectedItem !== null ? selectedItem.Description: ''"></v-textarea>
              </div>
            </div>
            </v-form>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-btn :ripple="false" flat color="pink" @click="save" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || newItems.length == 0 || selectedItem.Title.length == 0">Save</v-btn>
        <v-btn :ripple="false"  flat color="pink" @click="copyDialog=true" slot="activator" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem == null" v-if="type.users">Copy</v-btn>
      <v-dialog :persistent="true" id="purge-warning" v-model="dialog"  width="500" v-if="type.users" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem == null">
        <v-btn :ripple="false" flat color="pink"   slot="activator" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem == null">Purge</v-btn>
        <v-card :style="{ overflow: 'hidden'}">
                <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                >
                <svg role="img" class="icon-error">
                  <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_report_problem_24px" />
                </svg>Warning
                </v-card-title>
                <v-card-text>
                  <div :class="{'slide-leave-active': isPurging, 'slide-leave-to': isPurging}" >
                    Purge will remove the user's account from all affiliated site collections.  Are you sure you want to do this?
                    <div class="text-xs-right" style="color: #e91e63; font-size: small">
                  1/2
                   </div>
                  </div>
                  <div :class="{'slide-enter-active': isPurging, 'slide-enter': !isPurging}" >
                    What site collection(s) would you like to remove the user from?
                    <div class="text-xs-right" style="color: #e91e63; font-size: small">
                      2/2
                     </div>
                  </div>
              </v-card-text>
              <v-divider></v-divider>
                <v-card-actions :class="{'slide-leave-active': isPurging, 'slide-leave-to': isPurging}">
                  <v-spacer></v-spacer>
                  <v-btn
                  :ripple="false"
                    color="primary"
                    flat
                    @click="isPurging = true"
                  >
                   Yes
                  </v-btn>
                  <v-btn
                  :ripple="false"
                    color="primary"
                    flat
                    @click="dialog = false"
                  >
                   No
                  </v-btn>
                </v-card-actions>
                <v-card-actions :class="{'slide-enter-active': isPurging, 'slide-enter': !isPurging}">
                  <v-spacer></v-spacer>
                  <v-btn
                  :ripple="false"
                    color="primary"
                    flat
                    @click="purgeUser(true)"
                  >
                   All
                  </v-btn>
                  <v-btn
                  :ripple="false"
                    color="primary"
                    flat
                    @click="purgeUser(false)"
                  >
                   Currently Selected
                     </v-btn>
                  <v-btn
                  :ripple="false"
                    color="primary"
                    flat
                    @click="isPurging = false; dialog = false"
                  >
                   Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
      </v-dialog>
      <v-btn :ripple="false" flat color="pink" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem == null" :href="csv" @click="downloadCSV" download="download.csv">Export</v-btn>
    </v-card-actions>
  </div>
    <Copy :is-loading="isLoading" @get-site-collections-for-user="getSiteCollectionsForUser" :items="items" :available-users-site-collection-groups="availableUsersSiteCollectionGroups" :type="type" @copy-items="copyItems" @close-copy="closeCopy" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem == null" :label="'Select ' + (type.users ? 'User' : 'Group') + ' To Copy To'" v-else></Copy>
  </transition>
  </v-card>


</div>
</template>

<script>
import SearchSelect from './SearchSelect'
import Copy from './Copy'
import Checkbox from './Checkbox.vue'

export default {
  components: {
    SearchSelect: SearchSelect,
    Copy: Copy,
    Checkbox: Checkbox
  },
 props:{
    items: {
      type: Array
    },
    initialType: {
      type: String,
      default: ''
    },
    initialSelectedItem: {
      type: Object,
      default: null
    },
    initialSiteCollection: {
      type: Object,
      default: function(){
        return {
          url: '',
          title: '',
          origin: ''
        }
      }
    },
    /*type: {
      type: Object,
      default: function(){
        return {users: true, groups: false}
      }
    },*/
    isSaving: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    siteCollectionHasItem: {
      type: Boolean,
      default: false
    },
    siteCollections: {
      type: Array,
      default: function(){
        return []
      }
    },
    isSiteCollectionSelected: {
      type: Boolean,
      default: false
    },
    assignedItems: {
      type: Array,
      default: []
    },
    newItems: {
      type: Array,
      default: []
    },
    updateSelectedItem: {
      type: Object,
      default: null
    },
    availableUsersSiteCollectionGroups: {
      type: Array,
      default: function(){
        return []
      }
    },

  },
  data: function(){
    return {
      selectedItem: null,
      selectedItemToCopyTo: null,
      dialog: false,
      copyDialog: false,
      type: this.initialType.length > 0 ? this.initialType : 'users',
      siteCollection: null,
      isPurging: false
    };
  },
  watch : {
    copyDialog: function(newVal, oldVal){
      this.$emit('copy-dialog-opened', newVal);
    },
    selectedItem: {
      handler: function(newVal, oldVal){
        this.itemChanged(newVal);
      },
      deep: true
    },
    initialSiteCollection: {
      handler: function(newVal, oldVal){
          this.siteCollection = newVal;
      },
      deep: true
    },
    siteCollection: {
      handler: function(newVal, oldVal){
        this.$emit('site-collection-changed', newVal);
      },
      deep: true
    },
    updateSelectedItem: {
      handler: function(newVal, oldVal){
        this.selectedItem = newVal;
      },
      deep: true
    },
    type: {
      handler: function(newVal, oldVal){
          //clear out selected since type changed
          this.selectedItem = null;
          this.$emit('type-changed', newVal);
      },
      deep: true
    },
    siteCollectionHasItem: {
      handler: function(newVal, oldVal){
        //clear current item if group and site collection doesn't have a match
        if(this.isSiteCollectionSelected && !newVal && this.type.groups){
          this.selectedItem = null;
        }
      }
    }
  },
  computed: {
    csv: function(){
        return !navigator.msSaveBlob ? 'data:text/csv;charset=utf-8,' + escape(this.getCSV(this.assignedItems, 'Permissions', true, this.getExportOptions())) : '';
    }
  },
  methods: {
    toggleIsSiteAdmin: function(){
      this.$emit('toggle-site-admin', this.selectedItem);
    },
    copyItems: function(selectedItem, items){

    },
    getSiteCollectionsForUser: function(){
        this.$emit('get-site-collections-for-user', this.selectedItem);
    },
    closeCopy: function(){
      this.copyDialog = false;
      this.selectedItem = this.selectedItem;
    },
    purgeUser: function(purgeAll){
      purgeAll = purgeAll !== 'undefined' ? purgeAll : false;
      this.dialog = false;
      this.isPurging = false;
      this.$emit('purge-user', purgeAll);
    },
    getExportOptions: function(){
      return this.type.groups
      ? {
          Title: {displayText: 'Title'},
          loginName: {displayText: 'Login Name'},
          email: {displayText: 'Email'}
      }
      : {
        Title: {displayText: 'Title'},
        Description: {displayText: 'Description'}
      };
    },
    itemChanged: function(item){
      this.$emit('item-changed', this.selectedItem);
    },
    save: function(e){
      this.$emit('save');
    },
    exportData: function(e){
      this.JSONToCSVConvertor(this.assignedItems, 'Permissions', true, this.getExportOptions());
    },
    downloadCSV: function(){
      var csv;
      var filename = 'download.csv';
      var blob;
      if(navigator.msSaveBlob){
        csv  = this.getCSV(this.assignedItems, 'Permissions', true, this.getExportOptions());
        blob = new Blob([csv], {
            type: 'text/csv;charset=utf8;'
        });
        navigator.msSaveBlob(blob, filename);
      } else {
        return;
      }
    },
    getCSV: function(JSONData, ReportTitle, ShowLabel, columnMap) {
      //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
      var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

      var CSV = '';

      //This condition will generate the Label/Header
      if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var key in arrData[0]) {
          if(columnMap.hasOwnProperty(key)){
            //Now convert each value to string and comma-seprated
            row += columnMap[key].displayText + ',';
          }
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
      }

      //1st loop is to extract each row
      for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var key in arrData[i]) {
          if(columnMap.hasOwnProperty(key)){
            row += '"' + arrData[i][key] + '",';
          }
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
      }

      if (CSV == '') {
        alert("Invalid data");
        return;
      }

      //Generate a file name
      var fileName = "";
      //this will remove the blank-spaces from the title and replace it with an underscore
      fileName += ReportTitle.replace(/ /g,"_");

      //Initialize file format you want csv or xls
      return CSV;

      // Now the little tricky part.
      // you can use either>> window.open(uri);
      // but this will not work in some browsers
      // or you will not get the correct file extension

      //this trick will generate a temp <a /> tag
      /*var link = document.createElement("a");
      link.href = uri;

      //set the visibility hidden so it will not effect on your web-layout
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";

      //this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);*/
    }
  }
}
</script>
<style scoped>
.input-group input:disabled {
  color: rgba(0,0,0,.9) !important;
}
.icon-error {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  fill: #E53935;
  margin-top: -5px;
}
.v-btn, .v-btn::before, .v-btn::after {
  -webkit-transition: none !important;
   -moz-transition: none !important;
   -o-transition: none !important;
   transition: none !important;
   transition-timing-function: step-end !important;
}
</style>
