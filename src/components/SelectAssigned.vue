<template>
  <v-card class="flexcard" >
    <v-card-title primary-title>
      <h4 class="grey--text text--darken-2">Current {{type}}</h4>
      <v-text-field
      v-model="searchAssigned"
      append-icon="search"
      label="Search"
      full-width
      hide-details
      ></v-text-field>
    </v-card-title>
    <v-card-text class="grow">
      <v-data-iterator :items="assignedItems" :search="searchAssigned" class="items" must-sort :rows-per-page-items="[{'text':'All', 'value': -1}]" >
          <v-flex  slot="header" :style="{top: '24px', right: '16px', position: 'absolute'}" >
        <svg role="img" title="drop down" class="close" >
          <use xlink:href="/src/assets/svg-sprite-action-symbol.svg#ic_search_24px" :style="{ opacity: disabled == true ? .38 : .87}"/>
        </svg>
        </v-flex>

        <v-flex slot="item"slot-scope="props" xs12>
              <v-btn block :ripple="false" :disabled="disabled" @click="selectItem(props.item, props.index)" :color="props.item.selected ? 'blue-grey lighten-4' : 'undefined'" :outline="!props.item.selected" depressed> {{  props.item.title }} </v-btn>
        </v-flex>
      </v-data-iterator>
    </v-card-text>
    <v-card-actions>
     <v-btn block color="red darken-4" :disabled="disabled" :dark="!isSaving || !isLoading  || !isSiteCollectionSelected || !isItemSelected" @click="giveAll">Remove All</v-btn>
     <v-btn block :disabled="disabled" color="red darken-4" :dark="!isSaving || !isLoading  || !isSiteCollectionSelected || !isItemSelected" @click="giveSelected">Remove Selected</v-btn>
      <v-btn block :disabled="disabled" color="red darken-1" :dark="!isSaving || !isLoading  || !isSiteCollectionSelected || !isItemSelected" @click="clearSelected">Clear Selected</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import SelectHelper from '../mixins/SelectHelper.vue'

export default {
  mixins: [SelectHelper],
    props:{
      assignedItems: {
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
      searchAssigned: '',
      type: 'assigned'
    };
  },
  computed: {
    disabled: function(){
      return this.isSaving || this.isLoading  || !this.isSiteCollectionSelected || !this.isItemSelected;
    }
  }
}
</script>

<style>
.v-data-iterator__actions__range-controls .v-btn {
  display: none;
}

.v-input__icon.v-input__icon--append {
  display: none;
}
</style>
