<template>
  <div>
  <transition-group name="list" v-if="!isSearching && currentPageItems.length > 0"
  :class="{
    'enter-right': enterRight && !pageChange && !isIE,
    'enter-left': enterLeft && !pageChange && !isIE,
    'leave-right': leaveRight && !pageChange && !isIE,
    'leave-left': leaveLeft && !pageChange && !isIE
  }"
  @leave="onLeave"
    tag="ul">
    <li v-for="(item, index) in currentPageItems" v-bind:key="item.Id" :class="{'no-transition': pageChange}">
      <slot name="item" :item="item">{{ item.Name }}</slot>
         <v-divider dark></v-divider>
    </li>
  </transition-group>
  <div v-if="!isSearching && currentPageItems.length == 0">
    No results
  </div>
  <div v-if="isSearching">
    <v-container fill-height>
<v-layout row wrap align-center>
<v-flex>
<v-progress-circular
indeterminate
color="primary"
size="24"
></v-progress-circular>
</v-flex>
<v-flex>
Searching
</v-flex>
</v-layout>
</v-container>
  </div>
  <v-container fluid>
    <v-layout >
      <v-flex xs8>
  <div class="text-xs-center">
    <v-pagination v-if="currentPageItems.length > 0"
      ref="pagination"
      v-model="pagination.page"
      :length="numPages"
    ></v-pagination>
    </div>
  </v-flex>
  <v-flex xs2><span v-if="filteredItems.length > rowsPerPage">{{pagination.page > 0 ? (pagination.page  - 1 ) * rowsPerPage + 1 : 1}}-{{ pagination.page > 0 ? (pagination.page  - 1 ) * rowsPerPage + currentPageItems.length : currentPageItems.length}}</span><span v-else>{{currentPageItems.length}}</span> of {{items.length}}</v-flex>
  <v-flex xs2><v-select
          :items="rowsPerPageItems"
          v-model="pagination.rowsPerPageNumItems"
          label="Items Per Page"
        >
        <template slot="item" slot-scope="{item, index}"><span>{{item > -1 ? item : 'All'}}</span></template>
        <template slot="selection" slot-scope="{item, index}"><span>{{item > -1 ? item : 'All'}}</span></template>
      </v-select>
      </v-flex>
    </v-layout>
  </v-container>
</div>
</template>

<script>export default {
  props: {
    items: {
      type: Array,
      default: []
    },
    isSearchable: {
      type: Boolean,
      default: true
    },
    isSearching: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: true
    },
    enterRight: {
      type: Boolean,
      default: false
    },
    enterLeft: {
      type: Boolean,
      default: false
    },
    leaveRight: {
      type: Boolean,
      default: false
    },
    leaveLeft: {
      type: Boolean,
      default: false
    },
    filteredItems: {
      type: Array,
      default: []
    },
    rowsPerPageItems: {
      type: Array,
      default: function(){
        return  [-1, 10, 20, 50, 100]
      }
    }
  },
  computed: {
    rowsPerPage: function(){
      return this.rowsPerPageItems[this.pagination.rowsPerPageIndex] > 0 ? this.rowsPerPageItems[this.pagination.rowsPerPageIndex] : this.filteredItems.length;
    },
    numPages: function(){
      return this.rowsPerPage > 0 ? Math.ceil(this.filteredItems.length / this.rowsPerPage) : 1;
    },
    isIE: function(){
      return (navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true ); //IF IE > 10
    },
    currentPageItems: function(){
      //return items between two indecies.
      //start index is current page
      var startIndex = this.pagination.page > 0 ? (this.pagination.page - 1 ) * this.rowsPerPage : 0;
      var endIndex = startIndex + this.rowsPerPage < this.filteredItems.length ? startIndex + this.rowsPerPage : this.filteredItems.length;
      return this.filteredItems.slice(startIndex, endIndex );
    }
  },
  watch: {
    pagination: {
      handler: function(newVal, oldVal){
        this.pageChange = true;
        if(newVal.rowsPerPageNumItems != this.previousRowPerPageNumItems){
          this.pagination.rowsPerPageIndex = this.rowsPerPageItems.indexOf(this.pagination.rowsPerPageNumItems);
          this.pagination.page = 1;
          this.previousRowPerPageNumItems = newVal.rowsPerPageNumItems;

        }
      },
      deep: true
    },
    isSearching: function(newVal, oldVal){
      this.pagination.page = 1;
      if(!newVal){
        this.replacePaginationIcons();
      }
    },
    items: function(newVal, oldVal){
      this.pageChange = false;
      if(this.pagination.page > this.numPages || (this.pagination.page == 0 && this.numPages > 0)){
        this.pagination.page = 0;
      }
    }
  },
  data () {
    return {
      searchFocus: false,
      pagination: {
          page: 1,
          rowsPerPageIndex: 1,
          rowsPerPageNumItems: 10
        },
        pageChange: true,
        previousRowPerPageNumItems: 10
    }
  },
  methods: {
    onLeave: function(el){
      if(this.pageChange){
        el.style.display = 'none';
      }
    },
    replacePaginationIcons: function(){
      var paginationButtons;
      if(this.$refs.pagination){
        paginationButtons = this.$refs.pagination.$el.querySelectorAll('.v-pagination__navigation');
        paginationButtons[0].innerHTML = '<svg role="img" title="Prev" :style="{ opacity: disabled == true || pagination.page == 1 ? .38 : .87}"><use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_chevron_left_24px"/></svg>';
        paginationButtons[1].innerHTML = '<svg role="img" title="Next"  :style="{ opacity: disabled == true || (pagination.page == pages || pages == 0) ? .38 : .87}"><use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_chevron_right_24px"/></svg>';
      }
    }
 },
 mounted: function(){
   this.replacePaginationIcons();
 }
}
</script>
<style>
  .enter-left .list-enter {
    transform: translateX(-800px);
  }
  .enter-right .list-enter {
    transform: translateX(800px);
  }
  .enter-left .list-enter-to, .enter-right .list-enter-to {
    transform: translateX(0px);
  }
  .leave-left .list-leave-to {
    transform: translateX(-800px);
  }
  .leave-right .list-leave-to {
    transform: translateX(800px);
  }
  /* Enter and leave animations can use different */
  /* durations and timing functions.              */
  .enter-left .list-enter-active, .enter-right .list-enter-active {
    transition: all .5s;
  }
  .enter-left .list-leave-active, .enter-right .list-leave-active {
    transition: all .5s;
  }

</style>
