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
      <v-data-iterator :items="availableItems" :search="searchAvailable" class="items" must-sort :rows-per-page-items="[{'text':'All', 'value': -1}]">
        <v-flex  slot="header" :style="{top: '24px', right: '16px', position: 'absolute'}" >
      <svg role="img" title="drop down" class="close" >
        <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" :style="{ opacity: disabled == true ? .38 : .87}"/>
      </svg>
      </v-flex>
        <v-flex slot="item"slot-scope="props" xs12>
          <v-btn block :disabled="isSaving || isLoading  || !isSiteCollectionSelected || !isItemSelected" :ripple="false" @click="selectItem(props.item, props.index)" :color="props.item.selected ? 'blue-grey lighten-4' : 'undefined'" :outline="!props.item.selected" depressed>  {{  props.item.title }} </v-btn>
        </v-flex>
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
      selected: {}
    };
  },
  computed: {
    disabled: function(){
      return this.isSaving || this.isLoading  || !this.isSiteCollectionSelected || !this.isItemSelected;
    }
  }
};
</script>
<style>
.v-data-iterator__actions__range-controls .v-btn {
  display: none;
}
.v-input__append-inner {
  display: none;
}
</style>
