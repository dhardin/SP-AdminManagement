<script>
  export default {
  methods: {
    getSiteCollectionsGroupsForUser: function(){
      (function(that){
        var targetSiteCollections = [];
        var siteCollections = [];
        that.metrics.start = new Date();
        that.progress = 0;
        that.isLoading = true;

        that.messages.push({
          date: new Date(),
          verb: that.actions.Starting,
          text: 'Fetching all site collections',
          preposition: 'for',
          target: that.selectedItem.Title,
          url: '',
          type: 'warning'
        });
        new Promise(function(resolve, reject){
          that.getSiteCollectionsForUserAsync(that.selectedItem, that.siteCollections, targetSiteCollections).then(function(result){
            that.metrics.end = new Date();
            that.messages.push({
              date: new Date(),
              verb: that.actions.Finished,
              text: 'Fetching all site collections',
              preposition: 'for',
              target: that.selectedItem.Title,
              url: '',
              type: 'info'
            });
            that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
            that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
            that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'})
            that.isLoading = false;
            siteCollections = result;
            resolve();
          });
        }).then(function(result){
          that.metrics.start = new Date();
          that.progress = 0;
          that.isLoading = true;
          that.messages.push({
            date: new Date(),
            verb: that.actions.Starting,
            text: 'Fetching Groups for user in Site Collections',
            preposition: 'for',
            target: that.selectedItem.Title,
            url: '',
            type: 'warning'
          });
          that.getGroupsForUserInSiteCollections(that.selectedItem, targetSiteCollections).then(function(result){
            that.metrics.end = new Date();
            that.messages.push({
              date: new Date(),
              verb: that.actions.Finished,
              text: 'Fetching Groups for user in Site Collections',
              preposition: 'for',
              target: that.selectedItem.Title,
              url: '',
              type: 'info'
            });
            that.messages.push({type: 'notification', text: 'Successes: ' + that.metrics.numSuccesses});
            that.messages.push({type: 'notification', text: 'Fails: ' + that.metrics.numFailed});
            that.messages.push({type: 'notification', text: 'Completed in ' + (that.metrics.end.getTime() - that.metrics.start.getTime())/1000 + ' seconds.'});
            that.isLoading = false;
            if(that.isTesting){
              result = [{title: 'blah', siteCollection: {title:'blah', IsSiteAdmin: true}, children: that.$lodash.sampleSize(that.testGroups, Math.floor(Math.random() * 10) + 5)}];
            }
            var userGroups = that.$lodash.filter(result, function(o){
               return o.children && o.children.length > 0;
            });

            that.availableUsersSiteCollectionGroups = userGroups;
          });
        });
      })(this);
    }
    }
  };
</script>
