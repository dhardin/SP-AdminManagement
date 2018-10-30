<template>
  <div class="combobox-container" >
  <div class="combobox" @click="comboboxClick">
    <div class="combobox-selection">
        <span v-for="(item, index) in sortedSelected">
          <slot name="item">
            <v-chip
              :color="`${getColor(item)} lighten-3`"
              label
              class="py-1"
              @click="itemClick"
              >
              <span class="pr-2 pl-2">
                <v-avatar :color="getColor(item)">
     <span class="white--text headline">{{getTitle(item).charAt(0).toUpperCase()}}</span>
     </v-avatar>
                {{ getTitle(item) }}
              </span>
              <svg role="img" v-if="item.hasError" @click="retrySelect(item)" class="icon error">
                <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_report_problem_24px" />
              </svg>
              <svg role="img" @click="closeClick(item)" class="icon close">
                <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_close_24px" />
              </svg>
            </v-chip>
          </slot>
        </span>
        <input :disabled="disabled" v-model="search" type="text" ref="input" @focus="isFocused=true" @blur="onBlur"/>
    </div>
    <svg role="img" @click="dropdownClick" title="drop down" class="dropdown" :class="{active: isFocused == true, inactive: isFocused == false}">
      <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" />
    </svg>
  </div>
  <div class="combobox-search" v-show="isFocused && !disabled">
    <v-list subheader>
          <v-subheader inset>
                <span v-if="!isSearching && search.length < 3 && isAsyncSearch">
                  Please type {{3 - search.length}} more characters.
                </span>
          <v-flex v-if="isSearching">
              <v-progress-circular
              indeterminate
              color="primary"
              size="24"
              ></v-progress-circular>
              <span>Searching</span>
            </v-flex>
            <span v-if="(!isSearching && search.length >= 3 && isAsyncSearch) || (!isAsyncSearch)">
              Search returned with {{searchResults.length}} results.
            </span>
          </v-subheader>
           <v-list-tile
              :background="getColor(item)"
             v-for="(item, index) in sortedResults"
             :key="getTitle(item)"
             @mousedown="isSelecting = true"
             @click="selectItem(item, index)"
           >
           <v-list-tile-avatar :color="getColor(item)">
             <span class="white--text headline">{{getTitle(item).charAt(0).toUpperCase()}}</span>
            </v-list-tile-avatar>
           <v-list-tile-content>
            <v-list-tile-title v-text="getTitle(item)"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
  </div>
</div>
</template>

<script>export default {
  props: {
    items: {
      type: Array,
      default: function(){
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    initialSelectedItems: {
      type: Array,
      default: function(){
        return []
      }
    },
    isTesting: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Function,
      default: function(){
        return function(){return []}
      }
    },
    itemTitle: {
      type: String,
      default: 'Title'
    },
    itemValue: {
      type: String,
      default: 'Title'
    },
    isAsyncSearch: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    colors: {
      type: Array,
      default: function(){
        return [ 'red', 'blue', 'brown', 'green', 'purple', 'indigo', 'cyan',  'pink', 'teal', 'orange', 'blue-grey']
      }
    }
  },
  computed: {
    isIE: function(){
      return (navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true ); //IF IE > 10
    },
    sortedResults: function(){
      return (function(that){
        return that.$lodash.sortBy(that.searchResults, [function(o){return that.getTitle(o)}]);
      })(this);
    },
    sortedSelected: function(){
      return (function(that){
        return that.$lodash.sortBy(that.selectedItems, [function(o){return that.getTitle(o)}]);
      })(this);
    }
  },
  watch: {
    search: {
      handler: function(newVal, oldVal){
          this.searchResults = [];
        if(this.search.length < 3 && this.isAsyncSearch){
            this.isSearching = false;
            clearTimeout(this.searchTimeout);
            return;
        }
        if(this.search.length == 0 && !this.isAsyncSearch){
          this.searchResults = JSON.parse(JSON.stringify(this.items));
        }
        (function(that){
          that.isSearching = true;
          clearTimeout(that.searchTimeout);
          that.searchTimeout = setTimeout(function(){
            that.searchItems(that.search, function(results){
              results = that.$lodash.partition(results, function(resultItem){
                return that.$lodash.find(that.selectedItems, function(prevSelectedItem){
                  return that.getTitle(resultItem).toLowerCase() === that.getTitle(prevSelectedItem).toLowerCase();
                }) === undefined;
              })[0];
              that.searchResults = results;
              that.isSearching = false;
            });
          }, that.isAsyncSearch ? 500 : 0);
        })(this);
    }
  }
  },
  data () {
    return {
      isFocused: false,
      selectedItems: this.initialSelectedItems,
      searchResults: this.isAsyncSearch ? [] : this.items,
      isSelecting: false,
      isSearching: false,
      search: ''
    }
  },
  methods: {
    itemClick: function(){
      this.isSelecting = false;
      this.isFocused = false;
    },
    comboboxClick: function(){
      if(!this.isFocused){
        this.$refs.input.focus();
      }
    },
    onBlur: function(){
      if(!this.isSelecting){
        this.isFocused = false;
      }
    },
    getSearchHeader: function(){
      if(this.isSearching){
        return 'Searching...'
      }
    },
    searchItems: function(search, callback){
      var searchResults;
          (function(that){
      if(!that.isAsyncSearch || that.isTesting){
          searchResults = that.$lodash.filter(that.items, function(o){
            return that.getTitle(o).toLowerCase().indexOf(search.toLowerCase()) > -1;
          });
          if(callback){
            callback(searchResults);
          }
        } else {
          that.filter(that.url, search, function(results){
            callback(results);
          }, function(error){
            console.log(error);
          })
        }
      })(this);
    },
    retrySelect: function(item){
      this.$emit('select-item', item);
    },
    selectItem: function(item){
      var index;
      this.search = '';
      this.selectedItems.push(item);
      index = (function(that){ return that.$lodash.findIndex(that.searchResults, function(o){
          return that.getTitle(o) == that.getTitle(item);
        });
      })(this)
      this.searchResults.splice(index, 1);
      this.isSelecting = false;
      this.isFocused = false;
      this.$emit('select-item', item);
    },
    getColor: function(item){
      var text = item[this.itemTitle]
      if(text && text.length > 0){
        return this.colors[text.charCodeAt(0)%this.colors.length];
      } else {
        return '';
      }
    },
    getTitle: function(item){
      return item[this.itemTitle];
    },
    getValue: function(item){
      return item[this.itemValue];
    },
    closeClick: function(item){
      //find index of removed item
      var index;
      var currentItem;
      for(index = 0; index < this.selectedItems.length; index++){
        currentItem = this.selectedItems[index];
        if(this.getValue(currentItem) == this.getValue(item)){
          break;
        }
      }
      this.selectedItems.splice(index, 1);
      this.$emit('remove-item', item);
    },
    dropdownClick: function(){
      this.$refs.input.focus();
    }
 }
}
</script>
<style>
svg.dropdown {
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
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
.combobox-container {
  position: relative;
  width: 100%;
}
.combobox {
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
  cursor: text;
  padding: 15px 12px;
  border-radius: 2px;
background: #fff;
  transition: background 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  align-items: center;
color: inherit;
display: flex;
margin-bottom: 8px;
min-height: inherit;
position: relative;
width: 100%;
}
.combobox-selection {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  line-height: 18px;
}
.combobox-selection input {
  min-width: 0;
  flex: 1 1;
  max-height: 32px;
  line-height: 20px;
  padding: 8px;
  max-width: 100%;
  width: 100%;
  align-self: center;
  border-style: none;
  position: relative;
}
.combobox-selection input:focus {
  border: 1px solid #1976d2;
}

.combobox-search {
  background: #fff;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
    border-radius: 2px;
    margin-top: -8px;
    position: absolute;
    left: 0;
    right: 0;
    z-index:2;
}

.icon{
  height: 20px;
  width: 20px;
  cursor: pointer;
  fill: rgba(0,0,0, .4);
}
.icon.close:hover{
  fill: rgba(0,0,0, .6);
}
.icon.error {
background-color: transparent !important;
fill: rgba(255, 0, 0, 0.6);
}
.icon.error:hover {
fill: rgba(255, 0, 0, 0.8);
}
</style>
