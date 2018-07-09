<template>
  <div>
    <v-autocomplete ref="autocomplete" v-model="selectedItem" :item-text="itemText" item-subtitle="itemSubtitle"  @click="active=true" @select="active=true" @focus="active=true" @blur="active=false" clear-icon="" append-icon="" :items="items" label="Select"  :item-value="itemValue"  autocomplete return-object clearable attach :color="color" :light="light" :dark="dark" :disabled="disabled" :value="value" @change="onChange" v-if="hasSlot">
      <template slot="item" slot-scope="{ item, tile, parent }">
            <slot name="foo" :item="item"></slot>
      </template>
    </v-autocomplete>
    <v-autocomplete ref="autocomplete" v-model="selectedItem" :item-text="itemText" item-subtitle="itemSubtitle"  @click="active=true" @select="active=true" @focus="active=true" @blur="active=false" clear-icon="" append-icon="" :items="items" label="Select"  :item-value="itemValue"  autocomplete return-object clearable attach :color="color" :light="light" :dark="dark" :disabled="disabled" :value="value" @change="onChange" v-else>
    </v-autocomplete>
    <svg role="img" title="drop down" class="close" @click="clear" v-if="value != null && !active" :style="{fill: active == true ? activeColor : inactiveColor, opacity: disabled == true ? .38 : .87}">
      <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_close_24px" />
    </svg>
    <svg role="img" title="drop down" class="dropdown" :class="{active: active == true, inactive: active == false}" :style="{fill: active == true ? activeColor : inactiveColor, opacity: disabled == true ? .38 : .87}">
      <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" />
    </svg>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  props: {
    hasSlot: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: null
    },
    itemValue: null,
    itemText: {
      type: String,
      default: ''
    },
    itemSubtitle: {
      type: String,
      default: ''
    },
    light: {
      type: Boolean,
      default: true
    },
    dark: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: []
    },
    color: {
      type: String,
      default: "primary"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    activeColor: {
      type: String,
      default: '#1976d2'
    },
    inactiveColor: {
      type: String,
      default: 'white'
    }
  },
  data: function() {
    return {
      active: {
        type: Boolean,
        default: false
      },
      selectedItem: null
    }
  },
  methods: {
    onChange: function(selectedItem){
      this.active = false;
      this.$emit('input', selectedItem);
    },
    clear: function(){
         this.selectedItem = null;
      this.$emit('input', null);
    }
  }
}
</script>

<style lang="css" scoped>
  div {
    position: relative;
  }
  svg.dropdown {
    position: absolute;
    right: 0;
    top: 5px;
  }

  svg.close {
    position: absolute;
    right: 30px;
    top: 5px;
    cursor: pointer;
  }
  svg.dropdown.inactive {
    transition: all .2s;
  }
  svg.dropdown.active {
    /* Firefox */

  -moz-transform:  rotate(180deg);
  /* WebKit */
  -webkit-transform: rotate(180deg);
  /* Opera */
  -o-transform:  rotate(180deg);
  /* Standard */
  transform:  rotate(180deg);
  transition: all .2s;
  }
</style>
