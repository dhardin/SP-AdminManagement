<template>
  <v-card class="flexcard" :style="{overflow: 'hidden'}">
    <v-card-title primary-title>
      <h4 class="grey--text text--darken-2">Current {{type.users  ? 'Groups' : 'Users'}}</h4>
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
<DataIterator :enter-left="true" :leave-left="true" :filteredItems="isSearching ? [] : sortedItems" :items="items" :loading="isSearching ? 'primary' : false" :rows-per-page-items="[-1, 10, 20, 50]">
  <v-flex slot="item" slot-scope="props" xs12 class="pa-0">
    <v-btn block :ripple="false" :disabled="disabled"
    :style="{'min-height': '52px'}"
    @click="selectItem(props.item, (pagination.page - 1) * pagination.rowsPerPage + props.item.index)"
    :color="props.item.selected ? 'red lighten-1' : 'red lighten-4'"  depressed light class="selectItem">
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
</DataIterator>
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
import DataIterator from './DataIterator.vue'

export default {
  mixins: [SelectHelper],
  components: {
    DataIterator: DataIterator
  },
  data: function(){
    return {
      searchAssigned: '',
      pagination: {
      },
      show: true,
      sourceType: 'assigned'
    };
  }
}
</script>
<style>
.item {
  height: 40px;
  display: block;
}
.items {
  overflow-x: hidden;
}

.left-right {
  left: -800px;
  transform: translateX(100px);
  transition: transform 10s ease-in;
}

.slide-enter {
  transform: translateX(-800px);
}
.slide-leave {
  transform: translateX(0px);
  height: 40px;
  display: block;
}
.slide-leave-to {
  transform: translateX(-800px);
}
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-enter-active {
  transition: all .5s;
}
.slide-leave-active {
  transition: all .5s;
}
</style>
