<template>
  <v-card class="flexcard" >
    <v-card-title primary-title>
      <h4 class="grey--text text--darken-2">Available {{type.users ? 'Groups' : 'Users'}}</h4>
      <v-text-field
      v-model="searchAvailable"
      append-icon="search"
      label="Search"
      full-width
      hide-details
      ></v-text-field>
    </v-card-title>
    <v-card-text class="grow">
      <v-data-iterator :pagination.sync="pagination" :items="sortedItems" :search="searchAvailable" class="items" must-sort :rows-per-page-items="[10, 20, 50, {'text':'All', 'value': -1}]" next-icon="" prev-icon="">
        <v-flex  slot="header" :style="{top: '24px', right: '16px', position: 'absolute'}" >
      <svg role="img" title="drop down" class="close" :style="{ opacity: disabled == true ? .38 : .87}">
        <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
      </svg>
      </v-flex>
        <v-flex slot="item"slot-scope="props" xs12>
          <v-btn block :ripple="false" :disabled="disabled" @click="selectItem(props.item, (pagination.page - 1) * pagination.rowsPerPage + props.index)" :color="props.item.selected ? 'green lighten-1' : 'green lighten-4'"  depressed light>
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
         </v-layout>
       </v-container>
           </v-btn>
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
      <v-btn block color="green darken-4" outline :disabled="disabled || !isAnySelected" @click="clearSelected">Clear Selected ({{numSelected}})</v-btn>
      <v-btn block :disabled="disabled || !isAnySelected" :dark="!disabled && isAnySelected" color="green darken-3"  @click="giveSelected">Give Selected ({{numSelected}})</v-btn>
      <v-btn block :disabled="disabled || items.length == 0" color="green darken-3" :dark="!disabled && items.length > 0"  @click="giveAll">Give All</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import SelectHelper from '../mixins/SelectHelper.vue'

export default {
  mixins: [SelectHelper],
  data: function(){
    return {
      searchAvailable: '',
      selected: {},
      pagination: {
      }
    };
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
.v-btn .container {
  padding: 0 !important;
  margin: 0 !important;
}
.icon-error {
  margin-bottom: -5px;
  width: 24px;
  height: 24px;
  fill: #E53935;
}
</style>
