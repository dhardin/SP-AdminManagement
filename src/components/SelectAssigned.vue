<template>
  <v-card class="flexcard" >
    <v-card-title primary-title>
      <h4 class="grey--text text--darken-2">Current {{type.users  ? 'Groups' : 'Users'}}</h4>
    </v-card-title>
    <div>
      <div class="checkbox" v-if="type.users" >
          <v-btn flat @click="showDescription = !showDescription" :disabled="disabled">
        <svg role="img" :style="{ opacity: disabled == true ? .38 : .87, fill: '#1976d2'}" v-if="showDescription">
          <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_check_box_24px" />
        </svg>
        <svg role="img" :style="{ opacity: disabled == true ? .38 : .87}">
          <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_check_box_outline_blank_24px" v-if="!showDescription"/>
        </svg>
        <span class="font-weight-thin subheading">
            Show Description
          </span>
        </v-btn>
      </div>
      <v-text-field
      v-model="searchAssigned"
      append-icon="search"
      label="Search"
      class="search"
      @focus="hasFocus=true"
      @blur="hasFocus=false"
      full-width
      hide-details
       :disabled="disabled"></v-text-field>
     </div>
    <v-card-text class="grow">
      <v-data-iterator :pagination.sync="pagination" :items="sortedItems" :search="searchAssigned" class="items" must-sort  :rows-per-page-items="[10, 20, 50, {'text':'All', 'value': -1}]" next-icon="" prev-icon="">
          <v-flex  slot="header" :style="{top: type.users ? '112px' : '64px', right: '16px', position: 'absolute'}" >
        <svg role="img" title="drop down" class="close" :style="{ opacity: disabled == true ? .38 : .87, fill: hasFocus ? '#1976d2' : 'black'}">
          <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
        </svg>
        </v-flex>

        <v-flex slot="item"slot-scope="props" xs12 class="item">
              <v-btn block :ripple="false" :class="{'left-right': props.item.leftRight}" :disabled="disabled" @click="selectItem(props.item, (pagination.page - 1) * pagination.rowsPerPage + props.index )" :color="props.item.selected ? 'red lighten-1' : 'red lighten-4'"  depressed light class="selectItem listItem">
                <v-container>
               <v-layout row wrap>
                 <v-flex xs1>
                       <v-chip small dark color="red lighten-1" text-color="white" class="font-weight-thin" v-if="props.item.isNew">New</v-chip>
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
     <v-btn block color="red darken-4" :disabled="disabled || items.length == 0" :dark="!disabled && items.length > 0"  @click="giveAll">Remove All</v-btn>
     <v-btn block :disabled="disabled || !isAnySelected" :dark="!disabled && isAnySelected" color="red darken-4" @click="giveSelected">Remove Selected ({{numSelected}})</v-btn>
      <v-btn block outline :disabled="disabled || !isAnySelected" color="red darken-4" @click="clearSelected">Clear Selected ({{numSelected}})</v-btn>
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
      pagination: {
      },
      sourceType: 'assigned'
    };
  },
  watch: {
    /*sortedItems: function(newVal, oldVal){
      (function(that){
      that.$lodash.each(newVal, function(o){
       (function(obj){
        setTimeout(function(){
          that.$set(obj, 'leftRight', true);
        },100);
      })(o);
      })
    })(this)
  }*/
  }
}
</script>
<style>

/*.items {
  overflow-x: hidden;
}
.listItem{
  left: -800px;
}
.left-right {
 transform: translateX(800px);
 transition: all .2s ease-in;
}*/

</style>
