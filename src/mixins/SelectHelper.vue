<script>
  export default {
    props: {
      siteCollectionHasUser: {
        type: Boolean,
        default: false
      },
      isItemSelected: {
        type: Boolean,
        default: false
      },
      isAnySelected: {
        type: Boolean,
        default: false
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
        default: []
      },
      selectedItem: {

      }
    },
  methods: {
    selectItem: function(item, index){
      this.$emit('select-item', this.type, item, index);
    },
    clearSelected: function(e){
       this.$emit('clear-selected', this.type);
    },
    giveSelected: function(e){
           this.$emit('give-selected', this.type);
    },
    giveAll: function(e){
        this.$emit('give-all', this.type);
    }
  },
  computed: {
    disabled: function(){
      return this.isSaving || this.isLoading  || !this.isSiteCollectionSelected || !this.isItemSelected || !this.siteCollectionHasUser;
    },
    sortedItems: function(){
      return _.sortBy(this.items, function(o){
        return o.Title;
      });
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
