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
        showDescription: false
      };
    },
  methods: {
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
      return this.$lodash.sortBy(this.items, [function(o){
        return o.Title.toLowerCase();
      }]);
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
.blue {
  fill: #1976d2;
}
.checkbox svg {

}
.checkbox .subheading {
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
.selectItem {
  height: auto;
  min-height: 36px;
  padding: 5px;
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
</style>
