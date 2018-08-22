<template>
  <v-card class="flexcard" >
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
  </div>
    <v-card-text class="grow">
      <v-data-iterator :pagination.sync="pagination" :items="isSearching ? [] : sortedItems" :loading="isSearching ? 'primary' : false" must-sort :rows-per-page-items="[10, 20, 50, {'text':'All', 'value': -1}]" next-icon="" prev-icon="">
        <v-flex  slot="header" :style="{top: type.users ? '112px' : '64px', right: '16px', position: 'absolute'}" >
      <svg role="img" title="drop down" class="close" :style="{ opacity: disabled == true ? .38 : .87, fill: hasFocus ? '#1976d2' : 'black'}">
        <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
      </svg>
      </v-flex>
      <v-flex slot="no-data" :style="{'text-align': 'left'}">
        <div v-if="!isSearching" :style="{'text-align': 'center'}">No Data</div>
        <div v-else>
          <v-container fill-height>
  <v-layout row wrap align-center>
    <v-flex>
      <v-progress-circular
  indeterminate
  color="primary"
  size="24"
  ></v-progress-circular>
    </v-flex>
    <v-flex class="pl-2">
      Searching
    </v-flex>
  </v-layout>
</v-container>
</div>
      </v-flex>
        <v-flex slot="item"slot-scope="props" xs12 class="pa-0">
          <v-btn block :ripple="false" :disabled="disabled" @click="selectItem(props.item, (pagination.page - 1) * pagination.rowsPerPage + props.index)" :color="props.item.selected ? 'green lighten-1' : 'green lighten-4'"  depressed light class="selectItem">
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
      <v-btn block :disabled="disabled || sortedItems.length == 0" color="green darken-3" :dark="!disabled && items.length > 0"  @click="giveAll">Give All</v-btn>
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
