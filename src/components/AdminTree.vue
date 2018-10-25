<template>
  <div class="flexcard" :style="{width: '100%', 'min-height': '480px'}">
    <v-card class="grow flexcard">
      <div class="grow flexcard">
        <v-card-title primary-title>
          <h3 class="grey--text text--darken-2">Site Collections</h3>
        </v-card-title>
        <v-card-text class="grow">
          <v-container fill-height fluid>
            <v-layout fill-height>
              <v-flex xs12 align-end flexbox>
                <div v-if="isLoading">
                  <v-flex>
                  <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                  ></v-progress-circular>
                  </v-flex>
                  <v-flex>
                  Loading
                  </v-flex>
                </div>
                <v-form v-else>
                  <div v-for="(siteCollection, index) in siteCollectionAdmins">
                    <h3>{{siteCollection.title}}</h3>
                    <div class="combobox-container">
                      <combobox :url="siteCollection.url" :isAsyncSearch="true" item-title="Name" item-value="LoginName" :filter="customUserFilter"></combobox>
                    </di>
            <svg role="img" @click="" title="drop down" class="dropdown" :class="{active: siteCollection.focus == true, inactive: siteCollection.focus == false}">
              <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" />
            </svg>
          </div>
        </div>
      </v-form>
    </v-flex>
  </v-layout>
</v-container>
</v-card-text>
<v-card-actions>
  <v-btn flat color="pink" @click="save" :disabled="isSaving || isLoading  || !isSiteCollectionSelected">Save</v-btn>
</v-card-actions>
</div>
</v-card>
</div>
</template>

<script>
import TestData from '../mixins/TestData.vue';
import Combobox from './Combobox.vue';
export default {
  components: {
    Combobox: Combobox
  },
  mixins: [TestData],
  props:{
    /*  items: {
    type: Array
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
  isTesting: {
    type: Boolean,
    default: false
  },
  isSiteCollectionSelected: {
    type: Boolean,
    default: false
  },
  updateSelectedItem: {
    type: Object,
    default: null
  },
  siteCollections: {
    type: Array,
    default: function(){
      return [];
    }
  }
},
data: function(){
  return {
    searchMap: {},
    colors: ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'],
  siteCollectionAdmins: [],
  model: ''
  }
},
mounted: function(){

},
watch : {
  siteCollections: {
    handler: function(newVal, oldVal) {
      var i;
      var testAdminData;
      if(this.isTesting){
        for(i = 0; i < this.siteCollections.length; i++){
          testAdminData = this.getTestAdminData();
          this.siteCollectionAdmins.push({
            title: this.siteCollections[i].title,
            search: '',
            focus: false,
            admins:  testAdminData.admins,
            users: testAdminData.users
          });
        }
      }
    },
    deep: true
  }
},
methods: {
  customUserFilter: function(url, search, callback, errorCallback){
    (function(that){
      var queryArr = [{fieldName: 'Name', value: search, operator: 'substringof'}];
      that.getUsersQuery(url, queryArr, function(results){
        console.log(results);
        if(callback){
          callback(results);
        }
      }, function(error){
        console.log(error);
        if(errorCalback){
          errorCalback(error);
        }
      });
    })(this);
  },
  blurCombo: function(siteCollection, index){
    siteCollection.focus = false;
    var combobox = this.$refs['combobox-' + index][0];
    combobox.$el.ownerDocument.body.click();
  },
  filter: function(item, queryText, itemText) {
      if (item.header) return false;
      var hasValue = function hasValue(val) {return val != null ? val : '';};

      const text = hasValue(itemText)
      const query = hasValue(queryText)
      var matches = text.toString()
        .toLowerCase()
        .indexOf(query.toString().toLowerCase()) > -1;

      return matches;
    },
  getTestAdminData: function(){
    var admins = this.$lodash.sampleSize(this.testUsers, Math.floor(Math.random() * 10) + 1);
    var users = this.testUsers;
    return {
      admins: admins,
      users: users
    }
  },
  getValue: function(text){

  },
  getColor: function(text){
    if(text && text.length > 0){
      return this.colors[text.length% (this.colors.length - 1)];
    } else {
      return '';
    }
  },
  toggleIsSiteAdmin: function(parent, item, index){
    parent.selectItem(item);
    this.$emit('toggle-site-admin', item);
  },
  focusCombo: function(siteCollection, index){
    //find input in comboboxthis
    var combobox = this.$refs['combobox-' + index][0];
    var $combobox = combobox.$el;
    var input = $combobox.getElementsByTagName('input')[0];
    combobox.hasFocused = !siteCollection.focus;
    if(combobox.hasFocused){
      input.click()
    } else {
      input.blur();
    }
  },
  getSiteCollectionsForUser: function(){
    this.$emit('get-site-collections-for-user', this.selectedItem);
  },
  purgeUser: function(purgeAll){
    purgeAll = purgeAll !== 'undefined' ? purgeAll : false;
    this.dialog = false;
    this.isPurging = false;
    this.$emit('purge-user', purgeAll);
  },
  itemChanged: function(item){
    this.$emit('item-changed', this.selectedItem);
  },
  save: function(e){
    this.$emit('save');
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
.icon.close{
  height: 20px;
  width: 20px;
  cursor: pointer;
  fill: rgba(0,0,0, .4);
}
.icon.close:hover{
  fill: rgba(0,0,0, .6);
}
div.combobox-container{
  position: relative;
}
svg.dropdown {
  position: absolute;
  right: 0;
  top: 5px;
  cursor: pointer;
}
svg.dropdown.inactive {
  transition: all .2s;
  fill: 'white';
}
svg.dropdown.active {
  /* Firefox */
 fill: #1976d2;
  -moz-transform:  rotate(180deg);
  /* WebKit */
  -webkit-transform: rotate(180deg);
  /* Opera */
  -o-transform:  rotate(180deg);
  /* Standard */
  transform:  rotate(180deg);
  transition: all .2s;
}
.v-menu__content .v-autocomplete__content{
  display: block !important;
}
</style>
