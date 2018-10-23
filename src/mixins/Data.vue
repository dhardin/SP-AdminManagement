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
            siteCollections.push({title: row.Cells.results[2].Value, url: row.Cells.results[3].Value, origin: window.location.origin});
        }
        if (callback) {
          callback(siteCollections);
        }
    }).catch(function(error) {
      var responseError;
      try{
       responseError = {message: error.response.data.error.message.value};
     } catch(err){
       responseError = error;
       console.log(err);
     }
      if (errorCallback) {
        errorCallback(responseError);
      }
    });
    },
    updateUser: function(siteCollection, digest, loginName, updates, callback, errorCallback){
      var data = {  __metadata: {
          type: 'SP.User'
        }
      };
      var key;
      for(key in updates){
        data[key] = updates[key];
      }
      return axios({
        url: siteCollection.url + "/_api/web/siteusers(@v)?@v='" + encodeURIComponent(loginName) + "'",
        method: 'post',
        data: data,
        headers: {
          "accept": "application/json; odata=verbose",
          "content-type": "application/json; odata=verbose",
          "x-http-method": "MERGE",
          "X-RequestDigest": digest
        }
      }).then(function (response) {
    // handle success
      console.log(response);
      if(callback){
        callback(response);
      }
    }).catch(function(error) {
      var responseError;
      try{
       responseError = {message: error.response.data.error.message.value};
     } catch(err){
       responseError = {message: error.message, stack: error.stack};
       console.log(err);
     }
      if (errorCallback) {
        errorCallback(responseError);
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
        var responseError;
        try{
         responseError = {message: error.response.data.error.message.value};
       } catch(err){
         responseError = error;
         console.log(err);
       }
        if (errorCallback) {
          errorCallback(responseError);
        }
      });
    },
    getUserGroupsByLoginName: function(siteCollection, loginName, callback, errorCallback){
      return axios({
        url: siteCollection.url + "/_api/web/siteusers(@v)/groups?@v='" + encodeURIComponent(loginName) + "'",
        method: 'get',
        headers: {
          'accept': 'application/json; odata=verbose'
        }
      }).then(function(response){
        // handle success
        var groups = response.data.d.results;
        if (callback) {
          callback(groups);
        }
      }).catch(function(error){
        var responseError;
        try{
         responseError = {message: error.response.data.error.message.value};
       } catch(err){
         responseError = error;
       }
        if (errorCallback) {
          errorCallback(responseError);
        }
      });
    },
    getSiteCollectionAdmins: function(siteCollection, callback, errorCallback){
      return axios.get({
      url: siteCollection.url + "/_vti_bin/ListData.svc/UserInformationList?$filter=IsSiteAdmin eq true",
      headers: {
        "accept": "application/json;odata=verbose"
      }
    }).then(function (response) {
        var admins = response.data.d.results;
        if (callback) {
          callback(admins);
        }
    }).catch(function(error) {
      var responseError;
      try{
       responseError = {message: error.response.data.error.message.value};
     } catch(err){
       responseError = error;
     }
      if (errorCallback) {
        errorCallback(responseError);
      }
    });
    },
    getGroups: function(siteCollection, userId, callback, errorCallback){
        return axios.get(siteCollection.url + "/_api/web/" + (userId !== false ? 'getuserbyid('+userId+')/Groups' : 'sitegroups?$select=*'),
        {
        headers: {
          "accept": "application/json;odata=verbose"
        }
      }).then(function (response) {
          var groups = response.data.d.results;
          if (callback) {
            callback(groups);
          }
      }).catch(function(error) {
        var responseError;
        try{
         responseError = {message: error.response.data.error.message.value};
       } catch(err){
         responseError = error;
       }
        if (errorCallback) {
          errorCallback(responseError);
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
      var responseError;
      try{
       responseError = {message: error.response.data.error.message.value};
     } catch(err){
       responseError = error;
       console.log(err);
     }
      if (errorCallback) {
        errorCallback(responseError);
      }
    });
    },
    getByLoginName: function(siteCollection, loginName, callback, errorCallback){
      return axios({
        url: siteCollection.url + "/_api/web/siteusers(@v)?@v='" + encodeURIComponent(loginName) + "'",
        method: 'get',
        headers: {
          'accept': 'application/json; odata=verbose'
        }
      }).then(function(response){
        // handle success
        var result = response.data.d;
        if (callback) {
          callback(result);
        }
      }).catch(function(error){
        var responseError;
        try{
         responseError = {message: error.response.data.error.message.value};
       } catch(err){
         responseError = error;
         console.log(err);
       }
        if (errorCallback) {
          errorCallback(responseError);
        }
      });
    },
    removeUserFromGroup: function(siteCollection, digest, groupId, user, callback, errorCallback){
        return axios({
          url: siteCollection.url + '/_api/web/sitegroups('+groupId+')/users/removebyid('+user.Id+')',
          method: 'post',
          headers: {
           "X-HTTP-Method": "DELETE",
           "X-RequestDigest": digest,
           'accept': 'application/json; odata=verbose'
          }
       }).then(function (response) {
          // handle success
          var results = response.data.d;
          if (callback) {
            callback(results);
          }
      }).catch(function(error) {
        var responseError;
        try{
         responseError = {message: error.response.data.error.message.value};
       } catch(err){
         responseError = error;
         console.log(err);
       }
        if (errorCallback) {
          errorCallback(responseError);
        }
      });
    },
    //ensure user
    //https://msdn.microsoft.com/en-us/library/office/jj245233.aspx
    //
    removeUserFromSiteCollection: function(siteCollection, digest, user, callback, errorCallback){
      console.log(user.LoginName);
        return axios({
          url: siteCollection.url + '/_vti_bin/UserGroup.asmx',
            headers: {
              'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/directory/RemoveUserFromSite',
              'content-type': "text/xml; charset=\"utf-8\"",
              'data-type': 'json',
              'accept': 'application/json; odata=verbose'
            },
            method: 'post',
          data:  '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <RemoveUserFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <userLoginName>' + user.LoginName + '</userLoginName>\
                        </RemoveUserFromSite>\
                    </soap:Body>\
                </soap:Envelope>'
       }).then(function (response) {
          // handle success
          var results = response.data.d;
          if (callback) {
            callback(results);
          }
      }).catch(function(error) {
        var responseError;
        try{
          var xml = error.response.data;
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(xml, 'text/xml');
         responseError = {message: xmlDoc.getElementsByTagName('faultstring')[0].childNodes[0].nodeValue, stack: xmlDoc.getElementsByTagName('errorstring')[0].childNodes[0].nodeValue};
       } catch(err){
         responseError = error;
         console.log(err);
       }
        if (errorCallback) {
          errorCallback(responseError);
        }
      });
    },
    addUserToGroup: function(siteCollection, digest, groupId, user, callback, errorCallback){
      setTimeout(function(){
        return axios({
          url:  siteCollection.url + '/_api/web/sitegroups('+groupId+')/users',
        method: 'post',
        data: {
              __metadata: {
                type: 'SP.User'
              },
                LoginName: user.LoginName
        },
        headers: {
          "accept": "application/json; odata=verbose",
          "content-type": "application/json; odata=verbose",
          "X-RequestDigest": digest
        }
      }).then(function (response) {
      // handle success
          var results = response.data.d;
          if (callback) {
          callback(results);
          }
      }).catch(function(error) {
        var responseError;
        try{
         responseError = {message: error.response.data.error.message.value};
       } catch(err){
         responseError = error;
         console.log(err);
       }
        if (errorCallback) {
          errorCallback(responseError);
        }
      });
      }, this.isTesting ? 1000 : 0)
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
          var responseError;
          try{
           responseError = {message: error.response.data.error.message.value};
         } catch(err){
           responseError = {message: error.message, stack: error.stack};
         }
          if (errorCallback) {
            errorCallback(responseError);
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
