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
