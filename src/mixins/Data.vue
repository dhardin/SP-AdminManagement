<script>
import axios from 'axios'
  export default {
  methods: {
    getSiteCollections: function(callback, errorCallback){
      return axios.get("/_api/search/query?querytext='(contentclass=STS_Site) AND (path:"+window.location.origin+")'&rowlimit='200'&selectproperties='Title,Path'&trimduplicates=false",
      {
      headers: {
        "accept": "application/json;odata=verbose"
      }
    }).then(function (response) {
    // handle success
        var data = response.data.d.query;
        var numRows = data.PrimaryQueryResult.RelevantResults.RowCount;
        var siteCollections = [];
        var i;
        var row;
        for(i = 0; i < numRows; i++){
            row = data.PrimaryQueryResult.RelevantResults.Table.Rows.results[i];
            siteCollections.push({title: row.Cells.results[2].Value, url: row.Cells.results[3].Value});
        }
        if (callback) {
          callback(siteCollections);
        }
    }).catch(function(error) {
      error = error != undefined ? error : {message: 'unspecified error'};

      if (errorCallback) {
        errorCallback(error);
      }
    });
    },
    getUsers: function(siteCollection, groupId, callback, errorCallback){
        return axios.get(siteCollection.url + "/_api/web/" + (groupId !== false ? 'sitegroups('+groupId+')/users' : 'siteusers'),
        {
        headers: {
          "accept": "application/json;odata=verbose"
        }
      }).then(function (response) {
      // handle success
          var users = response.data.d.results;
          if (callback) {
            callback(users);
          }
      }).catch(function(error) {
        error = error != undefined ? error : {message: 'unspecified error'};
        if (errorCallback) {
          errorCallback(error);
        }
      });
    },
    getGroups: function(siteCollection, userId, callback, errorCallback){
        return axios.get(siteCollection.url + "/_api/web/" + (userId !== false ? 'getuserbyid('+userId+')/Groups' : 'sitegroups'),
        {
        headers: {
          "accept": "application/json;odata=verbose"
        }
      }).then(function (response) {
      // handle success
          var groups = response.data.d.results;
          if (callback) {
            callback(groups);
          }
      }).catch(function(error) {
        error = error != undefined ? error : {message: 'unspecified error'};
        if (errorCallback) {
          errorCallback(error);
        }
      });
    },
    getUserGroups: function(siteCollection, userId, callback, errorCallback){
      return axios.get(siteCollection.url + "/_api/web/getuserbyid("+userId+")/Groups",
      {
      headers: {
        "accept": "application/json;odata=verbose"
      }
    }).then(function (response) {
    // handle success
        var groups = response.data.d.results;
        if (callback) {
          callback(groups);
        }
    }).catch(function(error) {
      error = error != undefined ? error : {message: 'unspecified error'};
      if (errorCallback) {
        errorCallback(error);
      }
    });
    },
    removeUserFromGroup: function(siteCollection, digest, groupId, user, callback, errorCallback){
        return axios.post(siteCollection.url + '/_api/web/sitegroups('+groupId+')/users/removebyid('+user.Id+')',
         {headers: { "X-HTTP-Method": "DELETE" }}
        ).then(function (response) {
          // handle success
          var results = response.data.d.results;
          if (callback) {
            callback(results);
          }
      }).catch(function(error) {
        error = error != undefined ? error : {message: 'unspecified error'};
        if (errorCallback) {
          errorCallback(error);
        }
      });
    },
    addUserToGroup: function(siteCollection, digest, groupId, user, callback, errorCallback){
        return axios({
          url: siteCollection.url + '/_api/web/sitegroups('+groupId+')/users',
        method: 'post',
        data: {
              __metadata: {
                type: 'SP.User',
                LoginName: user.LoginName
              }
        },
        headers: {
          "accept": "application/json; odata=verbose",
          "content-type": "application/json; odata=verbose",
          "X-RequestDigest": digest
        }
      }).then(function (response) {
      // handle success
          var results = response.data.d.results;
          if (callback) {
          callback(results);
          }
      }).catch(function(error) {
        error = error != undefined ? error : {message: 'unspecified error'};
        if (errorCallback) {
          errorCallback(error);
        }
      });
    },
      getDigest: function(siteCollection, callback, errorCallback){
        return axios({
          url: siteCollection.url +  "/_api/contextinfo",
          method: "post",
          headers: {
            "Accept": "application/json; odata=verbose"
          },
        }).then(function(response) {
          try {
            var digest;
            digest = response.data.d.GetContextWebInformation.FormDigestValue;
            if(callback){
              callback(digest);
            }
          }
          catch(error){
            console.log(error);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });
      },  // Get List Item Type metadata
      getItemTypeForListName: function (name) {
        return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
      },
      parseQuery: function(queryString) {
        var query = {};
        var pairs = (queryString[0] === '#' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
      },
      updateHash: function(settings){
        var key;
        var  hash = '';
        for(key in settings){
          hash += (hash.length > 0 ? '&' : '') + key + '=' + settings[key];
        }
        window.location.hash = hash;
      }
    }
  };
</script>
