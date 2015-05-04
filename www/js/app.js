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
        url: '/intro',
        templateUrl: 'templates/intro.html'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html'
      })

      .state('loading', {
        url: '/loading',
        templateUrl: 'templates/loading.html'
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        data: {
          requiresLogin: true
        }
      })

      .state('app.playlist', {
        url: '/playlist',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html'
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.search', {
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html'
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.activity', {
        url: '/activity',
        views: {
          'menuContent': {
            templateUrl: 'templates/activity.html'
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.history', {
        url: '/history',
        views: {
          'menuContent': {
            templateUrl: 'templates/history.html',
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.historysongs', {
        url: '/history/songs',
        views: {
          'menuContent': {
            templateUrl: 'templates/history-detail.html',
          }
        },
        data: {
          requiresLogin: true
        }
      })

      .state('app.settings', {
        url: '/settings',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings.html'
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
      ioSocket: io.connect('http://api.choona.net')
    });
  })

  .factory('webPlayer', function () {

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var nextTime = 0;
    var audioStack = [];

    function scheduleBuffers() {
      while (audioStack.length) {
        var data = audioStack.shift();
        var int16Arr = new Int16Array(data);
        
        var audio = [];

        for (var i = 0; i < int16Arr.length; i++) {
          audio[i] = int16Arr[i] > 0 ? int16Arr[i] / 32767 : int16Arr[i] / 32768;
        }

        var source = context.createBufferSource();
        var audioBuffer = context.createBuffer(2, audio.length, 88200);
        audioBuffer.getChannelData(0).set(audio);
        source.buffer = audioBuffer;
        source.connect(context.destination);
        if (nextTime === 0) {
          nextTime = context.currentTime + 0.1; // 50ms buffer time
        }
        source.start(nextTime);
        nextTime += source.buffer.duration;
      }
    }

    return {
      queue: function (data) {
        audioStack.push(data);
        if (audioStack.length > 10) {
          scheduleBuffers();
        }
      }
    };
  })

  .run(function($ionicPlatform, auth, $rootScope, jwtHelper, store, $state, socket, webPlayer) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
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

      else if (toState.name.substring(0, 3) === 'app' && !$rootScope.status) {
        event.preventDefault();
        $state.go('loading');
      }

      else if (toState.name === 'login' && auth.isAuthenticated) {
        event.preventDefault();
        $state.go('app.playlist');
      }
    });

    $rootScope.status = {
      playing: null,
      position: 0
    };
    $rootScope.progressPercent = 0;
    $rootScope.progressTime = moment.duration(0, "seconds");
    $rootScope.timeRemaining = moment.duration(0, "seconds");

    function updateNowPlaying() {
      var status = $rootScope.status;
      status.position++;
      var width = 0;
      if (status.playing !== null) {
        width = 100 / (status.playing.track.length / 1000) * status.position;
        $rootScope.progressTime = moment.utc(status.position * 1000);
        $rootScope.timeRemaining = moment.utc(status.playing.track.length - status.position * 1000);
      }
      if (width > 100) {
        width = 100;
      }
      $rootScope.progressPercent = width;
      $rootScope.$apply();
    }

    setInterval(updateNowPlaying, 1000);

    socket.on('playlist:empty', function () {
      $rootScope.queue = [];
      $rootScope.status.playing = null;
      $rootScope.status.position = 0;
      $rootScope.$broadcast('queue-empty');
    });

    socket.on('playlist:queue', function (data) {
      $rootScope.queue = data;
    });

    socket.on('playlist:playing', function (data) {
      $rootScope.status.playing = data;
      $rootScope.status.position = 0;
    });

    socket.on('playlist:data', function (data) {
      webPlayer.queue(data);
    });

    socket.on('playlist:init', function (data) {
      $rootScope.queue = data.queue;
      $rootScope.status = data.status;
      $state.go('app.playlist');
      socket.emit('playlist:stream:start');
    });

    socket.on('authenticated', function () {
      socket.emit('playlist:join', { playlistId: 1 });
    });
  });