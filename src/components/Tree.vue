<template>
  <li class="node-tree" :class="{'first-child': firstChild}">
    <div v-if="!model.root">
      <div class="dot">
        <div class="top"></div>
        <div class="bottom left" v-if="!leaf && typeof leaf !== 'undefined'"></div>
        <div class="bottom right" v-if="expand"></div>
      </div>
      <v-btn class="expand-button" @click="expanded = model.children && model.children.length > 0 && !expand" flat v-if="model.children && model.children.length">
        <svg role="img" title="drop down" class="expand-icon" :class="{opened: expand, closed: !expand}">
          <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" />
        </svg>
      </v-btn>
      <div class="expand-placeholder" v-else>
      </div>
      <Checkbox @toggle-checked="toggleChecked" :isChecked="checked"><span v-html="displayText"></span></Checkbox>
    </div>
    <div class="children">
      <transition name="dropdown">
        <ul v-if="model.children && model.children.length && (expand || model.root)" >
          <node v-for="(child,index) in model.children" :model="child" :search="search" :leaf="index == model.children.length - 1" :first-child="index == 0" :checked="checkChildren"></node>
        </ul>
      </transition>
    </div>
  </li>
</template>

<script>
import Checkbox from './Checkbox.vue'
export default {
  name: "node",
  components: {
    Checkbox: Checkbox
  },
  props: {
    model: Object,
    checked:{
      type: Boolean,
      default: false
    },
    leaf: {
      type: Boolean,
      default: false
    },
    search: {
      type: String,
      default: ''
    },
    firstChild: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayText: function(){
      return this.getFormattedSearchText(this.model);
    },
    expand: function(){
      return this.model.expandedBySearch || this.expanded;
    }
  },
  watch: {
    search: function(){
        this.$forceUpdate();
    }
  },
  data: function(){
    return {
      expanded: false,
      checkChildren: false
    }
  },
  methods: {
    toggleChecked: function(val){
      var i;
      if(this.model.children && this.model.children.length){
        this.checkChildren = val;
        for(i = 0; i < this.model.children.length; i++){
          this.model.children[i].checked = val;
        }
      } else {
        return;
      }
    },
    getFormattedSearchText: function(model){
      var regex = new RegExp(this.search, 'g');
      return model.label.replace(regex, '<span class="yellow">' + this.search + '</span>');
    }
  }
};
</script>
<style>
.node-tree {

}
.node-tree {
  position: relative;
  overflow-y: hidden;
}
.children {
  overflow-y: hidden;
}
.node-tree .v-btn {
  margin: 0;
  padding: 0 5px;
  margin-left: -10px;

}
.node-tree ul {
  padding-left: 37px;
  margin: 6px 0;
}
.expand-icon {
  width: 42px;
  height: 42px;
  fill:  #e91e63;
  transform: rotate(-90deg);
  transition: all .2s linear;
}
.expand-icon.opened {
  fill: #1976d2;
  transform: rotate(0deg);
  margin-top: 5px;
}
.dropdown-enter-active, .dropdown-leave-active {
  transition: all .2s ease;
}
.dropdown-enter, .dropdown-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(-100px);
}
.dropdown-enter-to{
  height: translateY(0px);
}

.dot {
  width: 40px;
  top:0;
  bottom: 0;
  position: absolute;
}
.dot .top {
  height:20px;
  border-left: 3px dotted black;
  border-bottom: 3px dotted black;
}
.dot .bottom.right {
  margin-top: 0px;
  height: 21px;
  border-right: 3px dotted black;
}
.dot .bottom.left {
  margin-top: 3px;
  height: 100%;
  border-left: 3px dotted black;
}
.v-btn.expand-button {
  min-width: auto;
  margin-left: 18px;
  padding: 0;
}
.expand-placeholder {
  width: 48px;
  margin-left: 11px;
  display: inline-block;
}
.yellow {
  background-color: yellow;
}

</style>
