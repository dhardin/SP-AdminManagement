<template>
  <div>
    <v-autocomplete v-model="selectedItem" @select="active=true" @focus="activ=true" @blur="active=false" clear-icon="" append-icon="" :items="items" label="Select"  :item-value="itemValue" :item-text="itemText" single-line autocomplete return-object clearable attach :color="color" :light="light" :dark="dark" :disabled="disabled" :value="value" @change="$emit('input', selectedItem)" clearable></v-autocomplete>
    <svg role="img" title="drop down" class="close" @click="clear" v-if="value != null && !active">
      <use xlink:href="/src/assets/svg-sprite-navigation-symbol.svg#ic_close_24px" :style="{fill: active == true ? activeColor : inactiveColor, opacity: disabled == true ? .38 : .87}"/>
    </svg>
    <svg role="img" title="drop down" class="dropdown" :class="{active: active == true, inactive: active == false}">
      <use xlink:href="/src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" :style="{fill: active == true ? activeColor : inactiveColor, opacity: disabled == true ? .38 : .87}"/>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: { title: '', url: ''}
    },
    itemValue: null,
    itemText: {
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
