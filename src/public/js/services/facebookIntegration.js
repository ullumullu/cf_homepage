/**
* CFfacebook Module
*
* Facebook integration for the CF site. First focus is on page acces to update/insert/delete articels.
* But in future commenting should also be used by facebook.
*/
var cfFB = angular.module('CFfacebook', []);

 cfFB.factory('Facebook', ['$q', '$http', function($q, $http){
        var FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth';
        var tokenStore = window.sessionStorage;
        var fbAppId;
        var fbPageId;
        var oauthRedirectURL;
        var deferredLogin;
        var loginProcessed;

        /**
        * Use this method always before invoke any other method
        */
        function init (appId, pageId, redirectURL, store) {
          fbAppId = appId;
          fbPageId = pageId;
          if (redirectURL) oauthRedirectURL = redirectURL;
          if (store) tokenStore = store;
        }

        function login (fbScope) {
          
            if (!fbAppId) {
                return error({error: 'Facebook App Id not set.'});
            }

            var loginWindow;

            fbScope = fbScope || '';

            deferredLogin = $q.defer();

            loginProcessed = false;

            logout();

            console.log(oauthRedirectURL);

            loginWindow = window.open(FB_LOGIN_URL + '?client_id=' + fbAppId + '&redirect_uri=' + oauthRedirectURL +
                '&response_type=token&display=popup&scope=' + fbScope, '_blank', 'location=no');

            return deferredLogin.promise;

        }


         function oauthCallback(url) {
            // Parse the OAuth data received from Facebook
            var queryString,
                obj;

            loginProcessed = true;
            if (url.indexOf("access_token=") > 0) {
                queryString = url.substr(url.indexOf('#') + 1);
                obj = parseQueryString(queryString);
                tokenStore['fbtoken'] = obj['access_token'];
                pageToken(fbPageId);
            } else if (url.indexOf("error=") > 0) {
                queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
                obj = parseQueryString(queryString);
                deferredLogin.reject(obj);
            } else {
                deferredLogin.reject();
            }
        }

        function pageToken(pageId) {
          params = {};
          params['access_token'] = tokenStore['fbtoken'];
          $http.get('https://graph.facebook.com/me/accounts', {params: params})
            .success(function(data, status, headers, config) { 
              
              if(data && data.data && angular.isArray(data.data)) {
                var pages = data.data;
                for(var itr = 0; itr < pages.length; itr++) {
                  var page = pages[itr];
                  if(page.id == pageId) {
                    tokenStore[pageId] = page.access_token;
                  }
                }
                console.log(data);
              }
              deferredLogin.resolve();
          }).error(function(data, status, headers, config) {
              console.log(status);
              deferredLogin.reject();
          });
        }

        function logout (argument) {
          tokenStore['fbtoken'] = undefined;
        }


        function api(obj) {

            var method = obj.method || 'GET',
                params = obj.params || {},
                body   = obj.body   || {};

            var target = obj.path.split('/')[1];
            if(target === "me") {
              params['access_token'] = tokenStore['fbtoken'];
            } else {
              params['access_token'] = tokenStore[fbPageId];
            }

            var request = {
              method: method,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              url: 'https://graph.facebook.com' + obj.path, params: params,
              data: $.param(body)
            }

            return $http(request)
                .error(function(data, status, headers, config) {
                    if (data.error && data.error.type === 'OAuthException') {
                        $rootScope.$emit('OAuthException');
                    }
                });
        }

        function post(path, params, body) {
            return api({method: 'POST', path: path, params: params, body: body});
        }

        function get(path, params) {
            return api({method: 'GET', path: path, params: params});
        }


        function parseQueryString(queryString) {
            var qs = decodeURIComponent(queryString),
                obj = {},
                params = qs.split('&');
            params.forEach(function (param) {
                var splitter = param.split('=');
                obj[splitter[0]] = splitter[1];
            });
            return obj;
        }

        return {
            init: init,
            login: login,
            logout: logout,
            // revokePermissions: revokePermissions,
            api: api,
            post: post,
            get: get,
            oauthCallback: oauthCallback
        }
  }]);

// Global function called back by the OAuth login dialog
function oauthCallback(url) {
    var injector = angular.element(document.getElementById('adminarea_maincontent')).injector();
    injector.invoke(function (Facebook) {
        Facebook.oauthCallback(url);
    });
}