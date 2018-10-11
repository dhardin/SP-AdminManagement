<template>
  <v-btn class="checkbox-button" flat @click="toggleChecked" :disabled="disabled">
    <svg role="img" :class="{hidden: checked == true}" class="checkbox-icon"  width="24" height="24">
      <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_check_box_outline_blank_24px" />
    </svg>
    <svg role="img":class="{hidden: checked == false}" :style="{fill: '#1976d2' }" class="checkbox-icon"  >
      <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_check_box_24px"  />
    </svg>
    <span class="font-weight-thin subheading">
      <slot default>{{label}}</slot>
    </span>
  </v-btn>
</template>

<script>
export default {
  props: {
    disabled: false,
    label: '',
    isChecked: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    isChecked: function(newVal, oldVal){
      this.checked = newVal;
    }
  },
  data () {
    return {
      checked: false
    }
  },
  methods: {
    toggleChecked: function(){
      this.checked = !this.checked;
      this.$emit('toggle-checked', this.checked);
    }
  }
}
</script>
<style>
.v-btn:disabled .subheading{
  color: rgba(0,0,0,0.38);
}

.subheading {
  display: flex;
}

.v-btn:disabled svg {
  opacity: 0.37;
}
.checkbox-icon{
  padding: 0;
  background-color: white;
}

.hidden {
  display: none;
}
</style>
