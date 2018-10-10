<template>
  <div>
    <v-card-text>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12 align-end flexbox class="px-2">
            <SearchSelect :disabled="disabled" v-model="selectedItem" @change="itemChanged" :items="items" :item-value="itemValue" return-object :item-text="itemText" :label="label" light inactiveColor="#000"></SearchSelect>
          </v-flex>
          <v-flex xs12 align-end flexbox class="px-2">
            <div :style="{position: 'relative'}">
              <v-text-field v-model="search" @focus="searchFocus=true" @blur="searchFocus=false" :label="'Filter ' + (type.users ? 'Groups' : 'Users') " @keyup="filterTree"></v-text-field>
              <svg role="img" title="drop down" class="close" :style="{  fill:  searchFocus ? '#1976d2' : 'black', position: 'absolute', right: '10px', top: '0px'}">
                <use xlink:href="src/assets/svg-sprite-action-symbol.svg#ic_search_24px" />
              </svg>
            </div>
          </v-flex>
          <v-flex xs12 align-end flexbox class="px-2">
            <v-card>
              <v-card-title primary-title>
                <h3 class="font-weight-regular mb-0">Available Site Collections &amp; {{type.users ? 'Groups' : 'Users'}}</h3>
              </v-card-title>
              <v-card-text>
                <tree :search="search" :model="treeData" v-if="!isLoading"></tree>
                <div v-else class="v-align"><svg role="img" title="drop down" class="loading">
                  <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_refresh_24px" />
                </svg> <span class="pl-2">Loading</span></div>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
      color="danger"
      flat
      @click="closeCopy"
      >
      Cancel
    </v-btn>
    <v-btn
    color="pink"
    flat
    @click="copyItems"
    >
    Continue
  </v-btn>
</v-card-actions>
</div>
</template>

<script>
import SearchSelect from './SearchSelect';
import Tree from "./Tree";
import TestData from '../mixins/TestData.vue'

export default {
  mixins: [TestData],
  components: {
    SearchSelect: SearchSelect,
    Tree: Tree
  },
  props: {
    items: {
      type: Array
    },
    label: {
      type: String,
      default: 'Select Item'
    },
    itemValue: {
      type: String,
      default: 'Title'
    },
    itemText: {
      type: String,
      default: 'Title'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    type: {
      type: Object,
      default: function(){
        return {users: true, groups: false}
      }
    },
    availableUsersSiteCollectionGroups: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data () {
    return {
      selectedItem: null,
      searchFocus: false,
      search: ''
    }
  },
  computed: {
    treeData: function(){
      return {
        label: '',
        root: true,
        children: JSON.parse(JSON.stringify(this.availableUsersSiteCollectionGroups))
      }
    }
  },
  mounted: function(){
    this.$emit('get-site-collections-for-user');
  },
  methods:{
    itemChanged: function(){
      //get all site collections for user
      //get all groups for matching site collections
    },
    filterTree: function(){
      var i;
      var j;
      var matchedChildren;
      for(i = 0; i < this.treeData.children.length; i++){
        if(!this.treeData.children[i].hasOwnProperty('children')){
          continue;
        }
        (function(that){
          matchedChildren = that.$lodash.find(that.treeData.children[i].children, function(o){
            return that.search.length > 0 && o.label.toLowerCase().indexOf(that.search) > -1;
          });
        })(this);
        this.treeData.children[i].expandedBySearch = typeof matchedChildren !== 'undefined';
      }
    },
    closeCopy: function(){
      this.$emit('close-copy');
    },
    copyItems: function(){
      this.$emit('copy-items', null, []);
    }
  }
}
</script>
<style scoped>
svg.loading {
  -webkit-animation: rotation 2s infinite linear;
  animation: rotation 2s infinite linear;
  -moz-animation: rotation 2s infinite linear;
  -o-animation: rotation 2s infinite linear;
}
.v-align {
  display: flex;
  align-items: center
}

@-webkit-keyframes rotation {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}

@-o-keyframes rotation {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
@-moz-keyframes rotation {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}

@keyframes rotation {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
</style>
