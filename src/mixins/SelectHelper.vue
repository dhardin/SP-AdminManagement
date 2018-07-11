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
    }
  };
</script>
