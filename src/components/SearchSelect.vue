<template>
  <div>
    <v-autocomplete ref="autocomplete" :loading="isSearching" v-model="selectedItem" no-filter :no-data-text="isSearching ? 'Searching' : 'No Data'" :item-text="itemText" @keyup="searchStuff" item-subtitle="itemSubtitle"  @click="active=true" @select="active=true" @focus="active=true;filteredItems=items; " @blur="active=false" clear-icon="" append-icon="" :items="sortedItems" label="Select"  :item-value="itemValue" return-object clearable attach :color="color" :light="light" :dark="dark" :disabled="disabled" :value="value" @change="onChange" v-if="hasSlot">
      <template slot="item" slot-scope="{ item, tile, parent }">
        <slot name="foo" :item="item"></slot>
      </template>
    </v-autocomplete>
    <v-autocomplete ref="autocomplete" :loading="isSearching" no-filter v-model="selectedItem" :item-text="itemText" :no-data-text="isSearching ? 'Searching' : 'No Data'" @keyup="searchStuff" item-subtitle="itemSubtitle"  @click="active=true" @select="active=true" @focus="active=true;filteredItems=items;" @blur="active=false" clear-icon="" append-icon="" :items="sortedItems" label="Select"  :item-value="itemValue" return-object clearable attach :color="color" :light="light" :dark="dark" :disabled="disabled" :value="value" @change="onChange" v-else>
    </v-autocomplete>
    <svg role="img" title="drop down" class="close" @click="clear" v-if="value != null && !active" :style="{fill: active == true ? activeColor : inactiveColor, opacity: disabled == true ? .38 : .87}">
      <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_close_24px" />
    </svg>
    <svg role="img" title="drop down" class="dropdown" :class="{active: active == true, inactive: active == false}" :style="{fill: active == true ? activeColor : inactiveColor, opacity: disabled == true ? .38 : .87}">
      <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" />
    </svg>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  props: {
    hasSlot: {
      type: Boolean,
      default: false
    },
    hasCustomFilter: {
      type: Boolean,
      default: false
    },
    filterProperties: {
      type: Array,
      default: null
    },
    value: {
      type: Object,
      default: null
    },
    itemValue: null,
    itemText: {
      type: String,
      default: ''
    },
    itemSubtitle: {
      type: String,
      default: ''
    },
    light: {
      type: Boolean,
      default: true
    },
    dark: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: function(){
        return []
      }
    },
    color: {
      type: String,
      default: "primary"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    activeColor: {
      type: String,
      default: '#1976d2'
    },
    inactiveColor: {
      type: String,
      default: 'white'
    },
    value: null
  },
  computed: {
    filterMethod: function(){
      return this.hasFilters ? this.customFilter : null;
    },
    sortedItems: function(){
      if(this.search == null || this.search.length == 0){
        this.filteredItems = this.items;
      }

      return (function(that){
        return that.$lodash.sortBy(that.filteredItems, [function(o){
          return o[that.itemText].toLowerCase();
        }]);
      })(this);
    }
  },
  watch: {
    value: {
      handler: function(newVal, oldVal){
        this.selectedItem = newVal;
        this.$emit('input', newVal);
      },
      deep: true
    },
    search: function(newVal, oldVal){
      this.isSearching = true;
      this.filteredItems = [];
      (function(that){
        if(that.items.length > 100){
        clearTimeout(that.searchTimeout);
          that.searchTimeout = setTimeout(function(){
            that.customFilter(that.items, newVal);
            that.isSearching = false;
          },  350);
        } else {
          that.customFilter(that.items, newVal);
          that.isSearching = false;
        }
      })(this);
    },
    items: function(newVal, oldVal){
      this.customFilter(this.items, this.search);
    }
  },
  data: function() {
    return {
      active: {
        type: Boolean,
        default: false
      },
      isSearching: false,
      selectedItem: null,
      filteredItems: this.items,
      search: "",
      hasFocus: false,
      searchTimeout: null
    }
  },

  methods: {
    searchStuff: function(e){
      this.search = e.currentTarget.value;
    },
    onChange: function(selectedItem){
      this.active = false;
      this.$emit('input', selectedItem);
    },
    customFilter: function(items, search){
      if(search == null || search.length == 0){
        this.filteredItems = items;
        return;
      }
      (function(that){
        that.filteredItems  = that.$lodash.filter(items, function(o){
          var i;
          var property;
          var searchText = search.toLowerCase();
          if(!that.hasCustomFilter){
            return o[that.itemText].toLowerCase().indexOf(searchText) > -1;
          } else {
            for(i = 0; i < that.filterProperties.length; i++){
              property = that.filterProperties[i];
              return o.hasOwnProperty(property) && o[property].toLowerCase().indexOf(searchText) > -1;
            }
          }
        });
      })(this);
},
clear: function(){
  this.selectedItem = null;
  this.$emit('input', null);
}
}
}
</script>

<style lang="css" scoped>
div {
  position: relative;
}
svg.dropdown {
  position: absolute;
  right: 0;
  top: 5px;
}

svg.close {
  position: absolute;
  right: 30px;
  top: 5px;
  cursor: pointer;
}
svg.dropdown.inactive {
  transition: all .2s;
}
svg.dropdown.active {
  /* Firefox */

  -moz-transform:  rotate(180deg);
  /* WebKit */
  -webkit-transform: rotate(180deg);
  /* Opera */
  -o-transform:  rotate(180deg);
  /* Standard */
  transform:  rotate(180deg);
  transition: all .2s;
}
</style>
