<template>
  <v-btn class="radio-button" flat @click="toggleChecked" :disabled="disabled">
    <svg role="img" :class="{hidden: checked == true}" class="checkbox-icon"  width="24" height="24">
      <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_radio_button_unchecked_24px" />
    </svg>
    <svg role="img":class="{hidden: checked == false}" :style="{fill: '#1976d2' }" class="checkbox-icon"  >
      <use xlink:href="src/assets/svg-sprite-toggle-symbol.svg#ic_radio_button_checked_24px"  />
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
  },
  mounted: function(){
    this.checked = this.isChecked;
  }
}
</script>
<style scoped>
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

.radio-button::before {
  background-color: transparent  !important;
   opacity: 1;
}

.hidden {
  display: none;
}
</style>
