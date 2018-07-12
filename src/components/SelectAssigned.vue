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
      <v-data-iterator :pagination.sync="pagination" :items="sortedItems" :search="searchAssigned" class="items" must-sort  :rows-per-page-items="[1, 2, 3, {'text':'All', 'value': -1}]" next-icon="" prev-icon="">
          <v-flex  slot="header" :style="{top: '24px', right: '16px', position: 'absolute'}" >
        <svg role="img" title="drop down" class="close" :style="{ opacity: disabled == true ? .38 : .87}">
          <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
        </svg>
        </v-flex>

        <v-flex slot="item"slot-scope="props" xs12>
              <v-btn block :ripple="false" :disabled="disabled" @click="selectItem(props.item, (pagination.page - 1) * pagination.rowsPerPage + props.index )" :color="props.item.selected ? 'red lighten-1' : 'red lighten-4'"  depressed light> {{  props.item.Title }} </v-btn>
        </v-flex>
        <template slot="footer">
          <div class="footer">
          <v-btn flat @click="pagination.page == 1 ? '' : pagination.page--" :disabled="pagination.page == 1" class="pagination">
            <svg role="img" title="Prev" :style="{ opacity: disabled == true || pagination.page == 1 ? .38 : .87}">
              <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_chevron_left_24px"/>
            </svg></v-btn>
          <v-btn flat @click="pagination.page == pages ? '' : pagination.page++" :disabled="pagination.page == pages" class="pagination">
            <svg role="img" title="Next"  :style="{ opacity: disabled == true || (pagination.page == pages || pages == 0) ? .38 : .87}">
              <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_chevron_right_24px"/>
            </svg></v-btn>
          </div>
        </template>
      </v-data-iterator>

    </v-card-text>
    <v-card-actions>
     <v-btn block color="red darken-4" :disabled="disabled" :dark="!disabled"  @click="giveAll">Remove All</v-btn>
     <v-btn block :disabled="disabled || !isAnySelected" :dark="!disabled && isAnySelected" color="red darken-4" @click="giveSelected">Remove Selected</v-btn>
      <v-btn block outline :disabled="disabled || !isAnySelected" color="red darken-4" @click="clearSelected">Clear Selected</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import SelectHelper from '../mixins/SelectHelper.vue'

export default {
  mixins: [SelectHelper],
  data: function(){
    return {
      searchAssigned: '',
      type: 'assigned',
      pagination: {
      }
    };
  }
}
</script>

<style>
.footer {
  text-align: right;
  margin-bottom: -48px;
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
