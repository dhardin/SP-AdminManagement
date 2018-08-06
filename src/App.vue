<template>
  <v-app id="app" v-cloak>
    <v-navigation-drawer app  :clipped="true" v-model="drawer" hide-overlay dark>
      <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-tile v-for="item in menuItems" :key="item.title" @click="">
          <router-link :to="item.path">
            <v-list-tile-action>
              <svg role="img" class="white">
                <use :href="item.icon"/>
              </svg>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </router-link>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app :clipped-left="true" color="blue-grey" dark>
      <v-toolbar-side-icon @click.stop="drawer = !drawer">
        <svg role="img" title="Menu" class="white">
          <use xlink:href="src/assets/svg-sprite-navigation-symbol.svg#ic_menu_24px"/>
        </svg>
      </v-toolbar-side-icon>
      <v-toolbar-title >SharePoint Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs" v-if="$route.name == 'Home'">
        <SearchSelect item-value="title" item-text="title" item-subtitle="url" :style="{marginTop: '10px', marginRight: '10px', minWidth: '225px'}" dark v-model="siteCollection" :items="siteCollections" :disabled="isSaving || isLoading" :has-slot="true" :has-custom-filter="true" :filterProperties="['title', 'url']">
                  <v-list-tile-content slot="foo" slot-scope="item">
                  <v-list-tile-title>{{item.item.title}}</v-list-tile-title>
                    <v-list-tile-sub-title>{{item.item.url.replace(item.item.origin, '')}}</v-list-tile-sub-title>
                  </v-list-tile-content>
        </SearchSelect>
      <!--  <v-autocomplete v-model="siteCollection" @select="isSiteCollectionDropdownActive=true" @focus="isSiteCollectionDropdownActive=true" @blur="isSiteCollectionDropdownActive=false" :items="siteCollections" label="Select"  item-value="title" item-text="title" single-line autocomplete return-object clearable attach  :disabled="isSaving || isLoading"></v-autocomplete>
        <svg role="img" title="drop down" class="dropdown" :class="{active: isSiteCollectionDropdownActive, inactive: !isSiteCollectionDropdownActive}">
          <use xlink:href="/src/assets/svg-sprite-navigation-symbol.svg#ic_arrow_drop_down_24px" class="white"/>
        </svg>-->
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="toggle_select" :light="false" class="toggle-select blue-grey darken-2" mandatory>
          <v-btn flat large @click="changeType" :disabled="isSaving || isLoading">
            Users
          </v-btn>
          <v-btn flat large @click="changeType" :disabled="isSaving || isLoading">
            Groups
          </v-btn>
        </v-btn-toggle>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <transition name="slide">
        <router-view class="view" @select-site-collection="selectSiteCollection" :site-collections="siteCollections" :isLoadingSiteCollections="isLoadingSiteCollections" @site-collection-selected="siteCollectionSelected" :is-testing="isTesting" :type="type" :site-collection="siteCollection" :is-site-collection-selected="isSiteCollectionSelected"></router-view>
      </transition>
    </v-content>
  </v-app>
</template>

<script>
import Data from './mixins/Data.vue'
import SearchSelect from './components/SearchSelect'
import svg4everybody from 'svg4everybody'
export default {
  mixins: [Data],
  components: {
    SearchSelect: SearchSelect
  },
  data: function() {
    return {
      drawer: false,
      toggle_select: 0,
      isSaving: false,
      isTesting: window.location.hostname == 'localhost',
      isLoading: false,
      stuff: false,
      isSiteCollectionDropdownActive: false,
      isLoadingSiteCollections: {
        status: true,
        hasError: false,
        message: ''
      },
      saveProgress: 0,
      savingIndex: 0,
      updateProgressInterval: false,
      siteCollection: null,
      isSiteCollectionSelected: false,
      type: {users: true, groups: false},
      selectedItem: false,
      snackbar: {
        show: false,
        y: 'top',
        x: 'right',
        mode: '',
        timeout: 6000,
        text: 'Data loaded successfully'
      },
      menuItems: [
        { title: 'User/Group Management', icon: 'src/assets/svg-sprite-social-symbol.svg#ic_group_add_24px', path: '/' },
        { title: 'About', icon: 'src/assets/svg-sprite-action-symbol.svg#ic_help_24px', path: '/about' }
      ],
      siteCollections: []
    };
  },
  watch : {
    siteCollection: {
      handler: function(newVal, oldVal){
        this.isSiteCollectionDropdownActive = false;
        if(newVal == null){
          this.isSiteCollectionSelected = false;
        }
      },
      deep: true
    }
  },
  methods: {
    selectSiteCollection: function(siteCollection){
      this.$set(this, 'siteCollection', siteCollection);
    },
    siteCollectionSelected: function(isSiteCollectionSelected){
      this.isSiteCollectionSelected = isSiteCollectionSelected;
    },
    changeType: function(){
      this.type.users = !this.type.users;
      this.type.groups = !this.type.groups;
    }
  },
  created: function(){
    svg4everybody();
    this.toggle_select = this.type.users ? 0 : 1;
    this.isLoading = true;
    this.isLoadingSiteCollections.status = true;
    (function(that){
      if(that.isTesting){
        setTimeout(function(){
          //populate items for current type and populate availabe items for the opposing type
          //re-select previously selected item if its available
          //trigger select change for selected item if it exists, else clear selected item
          that.siteCollections = [{title:'Home', url: 'https://localhost:8080/#/', origin: 'https://localhost:8080'},{title:  'Engineering', url: 'https://localhost:8080/#/sites/eng', origin: 'https://localhost:8080'}, {title: 'Quality Assurance', url: 'https://localhost:8080/#/sites/qa', origin: 'https://localhost:8080'}];
          that.isLoading = false;
          that.isLoadingSiteCollections.status = false;
        },1000);
      } else {
        that.getSiteCollections(function(siteCollections){
          var i;
          that.siteCollections = siteCollections;
          that.isLoading = false;
          that.isLoadingSiteCollections.status = false;
        }, function(error){
          that.isLoading = false;
          that.isLoadingSiteCollections.status = false;
          that.isLoadingSiteCollections.hasError = true,
          that.isLoadingSiteCollections.message = error.message;
        });
      }
    })(this);
  }
}
</script>
<style scoped>
.toolbar .input-group--single-line:not(.input-group--solo)  {
  padding-top: 15px;
  min-width: 150px;
}
.btn-toggle.toggle-select {
  background-color: transparent;
}
.btn-toggle--selected.toggle-select {
  box-shadow: none;
}
.toolbar .toggle-select .btn{
  width: 80px;
}
.toolbar .input-group--focused.input-group--select.primary--text {
  color: white !important;
}

.v-toolbar__content .v-input {
  top: 50px !important;
}
.navigation-drawer .list .list__tile--link a{
  color: inherit;
  display: flex;
  text-decoration: none;
  width:100%;
}

svg.white{
  background-color: transparent !important;
  fill: white;
}

.v-list__tile.v-list__tile--link * {
  display: flex;
  text-decoration: none;
  color: white;
}
</style>
