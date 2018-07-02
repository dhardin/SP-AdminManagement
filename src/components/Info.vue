<template>
  <v-card class="flexcard" height="447px">
    <v-card-text class="grow">
      <v-container fill-height fluid>
        <v-layout fill-height>
          <v-flex xs12 align-end flexbox>
            <v-form>
              <v-select :disabled="isSaving || isLoading || !isSiteCollectionSelected" @change="itemChanged" :items="items" item-value="displayName" return-object item-text="displayName" label="Select Item" single-line autocomplete clearable attach ></v-select>
              <v-text-field label="Login Name" readonly disabled v-model="selectedItem.loginname"></v-text-field>
              <v-text-field label="E-mail" readonly disabled v-model="selectedItem.email"></v-text-field>
            </v-form>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-btn flat color="pink" @click="save" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || newItems.length == 0 || selectedItem.displayName.length == 0">Save</v-btn>
      <v-btn flat color="pink" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem.displayName.length == 0">Copy</v-btn>
      <v-btn flat color="pink" :disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem.displayName.length == 0">Purge</v-btn>
      <v-btn flat color="pink":disabled="isSaving || isLoading  || !isSiteCollectionSelected || selectedItem.displayName.length == 0" @click="exportData" >Export</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
 props:{
    items: {
      type: Array
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isSiteCollectionSelected: {
      type: Boolean,
      default: false
    },
    siteCollection: {
      type: Object,
      default: function(){
        return {}
      }
    },
    assignedItems: {
      type: Array,
      default: []
    },
    newItems: {
      type: Array,
      default: []
    }
  },
  data: function(){
    return {
      selectedItem: {
        displayName: '',
        loginname: '',
        email: ''
      }
    };
  },
  methods: {
    itemChanged: function(item){
      if(item == null){
        item = {
          displayName: '',
          loginname: '',
          email: ''
        }
      }
      this.selectedItem = Object.assign(this.selectedItem , item);
      this.$emit('item-changed', this.selectedItem);
    },
    save: function(e){
      this.$emit('save');
    },
    exportData: function(e){
      this.JSONToCSVConvertor(this.assignedItems, 'Permissions', true, {title: {displayText: "Title"}});
    },
    JSONToCSVConvertor: function(JSONData, ReportTitle, ShowLabel, columnMap) {
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
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

      // Now the little tricky part.
      // you can use either>> window.open(uri);
      // but this will not work in some browsers
      // or you will not get the correct file extension

      //this trick will generate a temp <a /> tag
      var link = document.createElement("a");
      link.href = uri;

      //set the visibility hidden so it will not effect on your web-layout
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";

      //this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>
