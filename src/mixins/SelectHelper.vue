<script>
  export default {
    props: {
      siteCollectionHasItem: {
        type: Boolean,
        default: false
      },
      isItemSelected: {
        type: Boolean,
        default: false
      },
      numSelected: {
        type: Number,
        default: 0
      },
      type: {
        type: Object,
        default: function(){
          return {users: true, groups: false}
        }
      },
      isSaving: {
        type: Boolean,
        default: false
      },
      isSiteCollectionSelected: {
        type: Boolean,
        default: false
      },
      isLoading: {
        type: Boolean,
        default: false
      },
      items: {
        type: Array,
        default: function(){
          return []
        }
      },
      selectedItem: {

      }
    },
    data: function(){
      return {
        hasFocus: false,
        showDescription: false,
        searchTimeout: null,
        search: '',
        isSearching: false,
        filteredItems: []
      };
    },
  methods: {
    searchText: function(){
      (function(that){
       if(that.items.length > 100){
           that.isSearching = true;
        clearTimeout(that.searchTimeout);
        that.searchTimeout = setTimeout(function(){
          that.customFilter(that.items, that.search);
          that.isSearching = false;
        },350);
    } else {
        that.customFilter(that.items, that.search);
        that.isSearching = false;
      }
      })(this);
    },
    customFilter: function(items, search){
      (function(that){
           that.filteredItems  = that.$lodash.filter(items, function(o){
            return o.Title.toLowerCase().indexOf(search) > -1;
          });
      })(this);
    },
    selectItem: function(item, index){
      this.$emit('select-item', this.sourceType, item, index);
    },
    clearSelected: function(e){
       this.$emit('clear-selected', this.sourceType);
    },
    giveSelected: function(e){
           this.$emit('give-selected', this.sourceType);
    },
    giveAll: function(e){
        this.$emit('give-all', this.sourceType);
    },
    toggleDescription: function(isDisplayed){
      this.showDescription = isDisplayed;
    }
  },
  watch: {
    items: function(newVal, oldVal){
      this.customFilter(this.items, this.search);
    }
  },
  computed: {
    isAnySelected: function(){
      return this.numSelected > 0;
    },
    disabled: function(){
      return this.isSaving || this.isLoading  || !this.isSiteCollectionSelected || !this.isItemSelected || !this.siteCollectionHasItem;
    },
    sortedItems: function(){
      if(this.search.length == 0){
        this.filteredItems = this.items;
      }
      return (function(that){
        return that.$lodash.sortBy(that.filteredItems, [function(o){
        /*  (function(obj){
           setTimeout(function(){
             that.$set(obj, 'rightLeft', false);
             that.$set(obj, 'leftRight', true);
           },100);
         })(o);*/
          return o.Title.toLowerCase();
        }]);
      })(this);
    },
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0

      return Math.ceil(this.sortedItems.length / this.pagination.rowsPerPage)
    }
  }
  };
</script>
<style>
 .subheading {
  text-transform: none;
  padding: 5px;
}
.description {
  white-space: normal;
  text-align: left;
  padding: 5px;
  display: block;
}
.search input {
  border-bottom: 1px solid rgba(0,0,0,.37);
}
.search input:focus {
  border-bottom: 2px solid #1976d2;
  transition: all .5s ease-out;
}
.v-btn.selectItem {
  height: auto;
  min-height: 36px;
  padding: 10px 5px 10px 5px;
  margin: 0;
 }

 .v-btn, .v-btn::before, .v-btn::after {
   -webkit-transition: none !important;
    -moz-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
    transition-timing-function: step-end !important;
 }

.footer {
  text-align: right;
}
.v-input__icon.v-input__icon--append {
  display: none;
}
.v-btn.pagination {

  display: inline-block;
}
.v-btn.pagination, .v-btn.pagination .v-btn__content {
  width: 36px !important;
  height: 36px;
  padding: 0 !important;
  margin: 0;
  min-width: 36px;
}
.v-btn .container {
  padding: 0 !important;
  margin: 0 !important;
}
.icon-error {
  margin-bottom: -5px;
  width: 24px;
  height: 24px;
  fill: #E53935;
}
.loading {
  background-color: white;
  opacity: 0.25;
}
.v-progress-circular {
  float: right;
}

ul, li {
  list-style-type: none;
  padding: 0;
}
</style>
