<template>
  <v-card class="flexcard" :style="{overflow: 'hidden'}">
    <v-card-title primary-title>
      <h4 class="grey--text text--darken-2">Available {{type.users ? 'Groups' : 'Users'}}</h4>
    </v-card-title>
    <div>
      <div class="checkbox" v-if="type.users && !showDescription">
        <v-btn flat @click="showDescription = !showDescription" :disabled="disabled">
          <svg role="img" :style="{ opacity: disabled == true ? .38 : .87}">
            <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_check_box_outline_blank_24px" />
          </svg>

          <span class="font-weight-thin subheading">
            Show Description
          </span>
        </v-btn>
      </div>
      <div v-if="type.users && showDescription">
        <v-btn flat @click="showDescription = !showDescription" :disabled="disabled">
          <svg role="img" :style="{ opacity: disabled == true ? .38 : .87, fill: '#1976d2'}">
            <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_check_box_24px" />
          </svg>
          <span class="font-weight-thin subheading">
            Show Description
          </span>
        </v-btn>
      </div>
      <div :style="{position: 'relative'}">
        <v-text-field
        @keyup="searchText"
        v-model="search"
        append-icon="search"
        label="Search"
        @focus="hasFocus=true"
        @blur="hasFocus=false"
        @keydown="items.length > 100 ? isSearching=true : false"
        class="search"
        full-width
        hide-details
        :disabled="disabled"
        ></v-text-field>
        <svg role="img" title="drop down" class="close" :style="{  fill:  hasFocus ? '#1976d2' : 'black', position: 'absolute', right: '10px', top: '0px'}">
          <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
        </svg>
      </div>
    </div>
    <v-card-text class="grow">
<DataIterator :enter-right="true" :leave-right="true" :filteredItems="isSearching ? [] : sortedItems" :items="items" :loading="isSearching ? 'primary' : false" :rows-per-page-items="[-1, 10, 20, 50]">
  <v-flex slot="item" slot-scope="props" xs12 class="pa-0">
    <v-btn block :ripple="false" :disabled="disabled"
    :style="{'min-height': '52px'}"
    @click="selectItem(props.item, (pagination.page - 1) * pagination.rowsPerPage + props.item.index)"
    :color="props.item.selected ? 'green lighten-1' : 'green lighten-4'"  depressed light class="selectItem">
    <v-container>
      <v-layout row wrap>
        <v-flex xs1>
          <v-chip small dark color="green lighten-1" text-color="white" class="font-weight-thin" v-if="props.item.isNew">New</v-chip>
          <svg role="img" v-if="props.item.hasError" class="icon-error">
            <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_report_problem_24px" />
          </svg>
        </v-flex>
        <v-flex xs11>
          {{  props.item.Title }}
        </v-flex>
        <v-flex xs12 class="caption fot-weight-thin" v-if="showDescription">
          <small class="description">{{ props.item.Description}}</small>
        </v-flex>
      </v-layout>
    </v-container>
  </v-btn>
</v-flex>
</DataIterator>
</v-card-text>
<v-card-actions>
  <v-btn block color="green darken-4" outline :disabled="disabled || !isAnySelected" @click="clearSelected">Clear Selected ({{numSelected}})</v-btn>
  <v-btn block :disabled="disabled || !isAnySelected" :dark="!disabled && isAnySelected" color="green darken-3"  @click="giveSelected">Give Selected ({{numSelected}})</v-btn>
  <v-btn block :disabled="disabled || sortedItems.length == 0" color="green darken-3" :dark="!disabled && items.length > 0"  @click="giveAll">Give All</v-btn>
</v-card-actions>
</v-card>
</template>
<script>
import SelectHelper from '../mixins/SelectHelper.vue'
import DataIterator from './DataIterator.vue'

export default {
  mixins: [SelectHelper],
  components: {
    DataIterator: DataIterator
  },
  data: function(){
    return {
      searchAvailable: '',
      selected: {},
      pagination: {
        page: 0,
        rowsPerPage: 1000
      },
      sourceType: 'available'
    };
  },
  watch: {
    sortedItems: function(newVal, oldVal){
      (function(that){
        that.$lodash.each(newVal, function(o){
          (function(obj){
            setTimeout(function(){
              that.$set(obj, 'leftRight', false);
              that.$set(obj, 'rightLeft', true);
            },5000);
          })(o);
        })
      })(this)
    }
  }
};
</script>
