<script>
export default {
  methods: {
    getGroupsForUserInSiteCollections: function(user, siteCollections){
      this.metrics.numFailed = 0;
      this.metrics.numSuccesses = 0;
      this.progress = 0;
      var message =  {
        type: 'table',
        pagination: {
          sortBy: 'operation',
          descending: false
        },
        search: '',
        headers: [{text: 'Operation', value: 'operation'}, {text: 'URL', value: 'url'}, {text: 'Target', value: 'target'}, {text: 'Status', value: 'status'}], rows: []
      };
      var messageList = message.rows;
      this.messages.push(message);
      var promiseArr;
      (function(that){
        promiseArr = siteCollections.map(function(item){
          var promise;
          promise = new Promise(function(resolve, reject){
            //var message = messageList[messageList.length - 1];
            messageList.push({status: 'pending', url: item.url, target: user.Title, operation:  'Fetching Groups', error: {expanded: false, message: '', title: ''}});
            var messageIndex = messageList.length - 1;
            that.getUserGroupsByLoginName(item, user.LoginName, function(groups){
              var message = messageList[messageIndex];
              that.metrics.numSuccesses++;
              item.isNew = false;
              item.hasError = false;
              that.progress += 100/that.newItems.length;
              message.status = 'done';
              resolve({siteCollection: item, title: item.title, children: groups});
            }, function(error){
              var message = messageList[messageIndex];
              item.hasError = true;
              that.failedItems.push(item);
              message.status = 'error';
              message.error = {expanded: false, message: error.stack, title: error.message};
              that.progress += 100/that.newItems.length;
              that.metrics.numFailed++;
              resolve();
            });
          });
          return promise;
        });
      })(this);
      return Promise.all(promiseArr);
    },
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
            //siteCollections = result;
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
          console.log('--Site Collections--');
          console.log(targetSiteCollections);
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
