angular.module('choona', [
  'ionic',
  'choona.controllers',
  'auth0',
  'angular-storage',
  'angular-jwt',
  'btford.socket-io'])

  .config(function($stateProvider, $urlRouterProvider, authProvider) {

    $stateProvider
      .state('intro', {
        url: "/intro",
        templateUrl: 'templates/intro.html',
        controller: 'introCtrl'
      })

      .state('login', {
        url: "/login",
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      })

      .state('loading', {
        url: '/loading',
        templateUrl: 'templates/loading.html'
      })

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'appCtrl',
        data: {
          requiresLogin: true
        }
      })

      .state('app.playlist', {
        url: "/playlist",
        views: {
          'menuContent': {
            templateUrl: "templates/playlist.html",
            controller: 'playlistCtrl'
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.activity', {
        url: "/activity",
        views: {
          'menuContent': {
            templateUrl: "templates/activity.html"
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.history', {
        url: "/history",
        views: {
          'menuContent': {
            templateUrl: "templates/history.html",
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.historysongs', {
        url: "/history/songs",
        views: {
          'menuContent': {
            templateUrl: "templates/history-detail.html",
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.settings', {
        url: "/settings",
        views: {
          'menuContent': {
            templateUrl: "templates/settings.html"
          }
        },
        data: {
          requiresLogin: true
        }
      });

    $urlRouterProvider.when(/^\/?$/, '/login');

    authProvider.init({
      domain: 'choona.eu.auth0.com',
      clientID: 'ayp76kQ1YxZJfLnY7TUKRj5KdiHcHSAH',
      loginState: 'login'
    });
  })

  .factory('socket', function (socketFactory) {
    return socketFactory({
      ioSocket: io.connect('localhost:8080')
    });
  })

  .run(function($ionicPlatform, auth, $rootScope, jwtHelper, store, $state, socket) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });

    auth.hookEvents();

    $rootScope.$on('$stateChangeStart', function(event, toState) {
      if (toState.name !== 'intro' && !store.get('didTutorial')) {
        event.preventDefault();
        $state.go('intro');
      }

      else if (toState.name === 'intro' && store.get('didTutorial')) {
        event.preventDefault();
        $state.go('app.playlist');
      }

      else if (!auth.isAuthenticated) {
        var token = store.get('token');
        if (token) {
          if (!jwtHelper.isTokenExpired(token)) {
            auth.authenticate(store.get('profile'), token);
            socket.emit('authenticate', { token: token });
          } else if (toState.name !== 'login') {
            return $state.go('login');
          }
        }
      }

      else if (toState.name.substring(0, 3) === "app" && !$rootScope.status) {
        event.preventDefault();
        $state.go('loading');
      }

      else if (toState.name === 'login' && auth.isAuthenticated) {
        event.preventDefault();
        $state.go('app.playlist');
      }
    });

    socket.on('playlist:init', function (data) {
      $rootScope.queue = data.queue;
      $rootScope.status = data.status;
      $state.go('app.playlist');
    });

    socket.on('authenticated', function () {
      socket.emit("playlist:join", { playlistId: 1 });
    });
  });