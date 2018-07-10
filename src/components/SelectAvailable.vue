<template>
  <v-card class="flexcard" >
    <v-card-title primary-title>
      <h4 class="grey--text text--darken-2">Available {{type}}</h4>
      <v-text-field
      v-model="searchAvailable"
      append-icon="search"
      label="Search"
      full-width
      hide-details
      ></v-text-field>
    </v-card-title>
    <v-card-text class="grow">
      <v-data-iterator :pagination.sync="pagination" :items="availableItems" :search="searchAvailable" class="items" must-sort :rows-per-page-items="[50, 100, {'text':'All', 'value': -1}]" next-icon="" prev-icon="">
        <v-flex  slot="header" :style="{top: '24px', right: '16px', position: 'absolute'}" >
      <svg role="img" title="drop down" class="close" :style="{ opacity: disabled == true ? .38 : .87}">
        <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
      </svg>
      </v-flex>
        <v-flex slot="item"slot-scope="props" xs12>
          <v-btn block :disabled="isSaving || isLoading  || !isSiteCollectionSelected || !isItemSelected" :ripple="false" @click="selectItem(props.item, props.index)" :color="props.item.selected ? 'blue-grey lighten-4' : 'undefined'" :outline="!props.item.selected" depressed>  {{  props.item.Title + props.item.selected}} </v-btn>
        </v-flex>
        <template slot="footer">
          <div class="footer">
          <v-btn flat @click="pagination.page--" :disabled="pagination.page == 1" class="pagination">
            <svg role="img" title="Prev" :style="{ opacity: disabled == true || pagination.page == 1 ? .38 : .87}">
              <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_chevron_left_24px"/>
            </svg></v-btn>
          <v-btn flat @click="pagination.page++" :disabled="pagination.page == pages" class="pagination">
            <svg role="img" title="Next"  :style="{ opacity: disabled == true || (pagination.page == pages || pages == 0) ? .38 : .87}">
              <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_chevron_right_24px"/>
            </svg></v-btn>
          </div>
        </template>
      </v-data-iterator>
    </v-card-text>
    <v-card-actions>
      <v-btn block color="blue-grey darken-1" :dark="!isSaving || !isLoading  || !isSiteCollectionSelected || !isItemSelected" :disabled="disabled" @click="clearSelected">Clear Selected</v-btn>
      <v-btn block :disabled="disabled" color="blue-grey darken-3" :dark="!isSaving || !isLoading  || !isSiteCollectionSelected || !isItemSelected" @click="giveSelected">Give Selected</v-btn>
      <v-btn block :disabled="disabled" color="blue-grey darken-3" :dark="!isSaving || !isLoading  || !isSiteCollectionSelected || !isItemSelected" @click="giveAll">Give All</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import SelectHelper from '../mixins/SelectHelper.vue'

export default {
  mixins: [SelectHelper],
  props:{
    availableItems: {
      type: Array
    },
    isItemSelected: {
      type: Boolean,
      default: false
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    isSiteCollectionSelected: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    selectedItem: {

    }
  },
  data: function(){
    return {
      searchAvailable: '',
      type: 'available',
      selected: {},
      pagination: {
      }
    };
  },
  computed: {
    disabled: function(){
      return this.isSaving || this.isLoading  || !this.isSiteCollectionSelected || !this.isItemSelected;
    },
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0

      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  }
};
</script>
<style>
.footer {
  text-align: right;
}
.v-input__icon.v-input__icon--append {
  display: none;
}
.v-btn.pagination {

  display: inline-block;
}
.v-btn.pagination, .v-btn.pagination .v-btn__content {
  width: 36px !important;
  height: 36px;
  padding: 0 !important;
  margin: 0;
  min-width: 36px;
}
</style>
