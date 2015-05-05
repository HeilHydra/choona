angular.module('choona.controllers', [])

  .controller('appCtrl', function ($scope, store, $state, socket, $rootScope) {
    $scope.profile = store.get('profile');
    $scope.name = $scope.profile.given_name || $scope.profile.name;

    $scope.showSearchInput = false;
    $scope.search = {
      text: ''
    };
    $scope.iconClass = 'button button-icon icon search-icon ion-plus-round';

    $scope.searchText = '';
    $scope.searching = false;
    $scope.searchResults = [];

    $scope.handleSearchClick = function () {
      if (!$scope.showSearchInput) {
        $state.go('app.search');
      } else {
        $state.go('app.playlist');
      }
    };

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
      if (fromState.name === "app.search" || toState.name === "app.search") {
        var show = !$scope.showSearchInput;
        $scope.showSearchInput = show;
        var className = 'button button-icon icon search-icon ';
        className += show ? 'ion-minus-round' : 'ion-plus-round';
        $scope.iconClass = className;
        $scope.searchResults = [];
        $scope.searchText = '';
        $scope.searching = false;
        $scope.search.text = '';
      }
    });

    $scope.handleSearch = function () {
      var searchText = $scope.search.text;
      $scope.searchText = searchText;
      $scope.searchResults = [];
      if (searchText.length > 0) {
        $scope.searching = true;
        doSearch(searchText);
      } else {
        $scope.searching = false;
      }
    };

    function doSearch(searchString) {
      socket.emit('playlist:search', searchString, function (searchResults) {
        if ($scope.search.text === searchString) {
          $scope.searching = false;
          $scope.searchResults = searchResults;
        }
      });
    }
  })

  .controller('settingsCtrl', function ($scope, auth, store, $state) {
    $scope.doLogout = function () {
      auth.signout();
      store.remove('token');
      store.remove('profile');
      store.remove('refreshToken');
      $state.go('login');
    };
  })

  .controller('searchCtrl', function ($scope, socket, toaster) {
    $scope.addTrack = function (track) {
      toaster("'" + track.title + "' added to queue");
      socket.emit('playlist:add', track.id);
      $scope.searchResults = $scope.searchResults.filter(function (result) {
        return result.id !== track.id;
      });
    };
    setTimeout(function () {
      document.getElementById("search-input").focus();
    }, 0);
  })

  .controller('introCtrl', function ($scope, $state, store) {
    $scope.activeSlide = 0;

    $scope.finishedTutorial = function () {
      store.set('didTutorial', true);
      $state.go('login');
    };
  })

  .controller('loginCtrl', function ($scope, auth, store, $state, socket) {
    var signinOpts = {
      container: 'lock-container',
      icon: 'img/choona-animated.svg',
      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      }
    };

    auth.signin(signinOpts, onAuthSuccess);

    function onAuthSuccess(profile, token, accessToken, state, refreshToken) {
      store.set('profile', profile);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      socket.emit('authenticate', { token: token });
    }
  })

  .controller('playlistCtrl', function ($scope, $ionicModal, socket, toaster) {
    $ionicModal.fromTemplateUrl('templates/nowplaying.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function () {
      $scope.modal.show();
    };

    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    $scope.upvote = function (track) {
      toaster("Upvoted '" + track.title + "'");
      socket.emit("playlist:upvote", track.id);
    };

    $scope.downvote = function (track) {
      toaster("Downvoted '" + track.title + "'");
      socket.emit("playlist:downvote", track.id);
    };

    $scope.$on('queue-empty', function () {
      $scope.modal.hide();
    });

    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
  })

  .controller('activityCtrl', function ($scope) {
    $scope.doRefresh = function () {
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply();
    };

    // TODO: sort dynamic time out to text e.g. 16:10 ==> 10 minutes ago
    $scope.activities = [
      { profile: 'img/profile.png', name: 'Jay Vagharia', title: 'Cotton Eye Joe', location: 'Starbucks', message: '#ballin', socialtype:'facebook', time: 'Just now' },
      { profile: 'img/profile.png', name: 'Simon Kerr', title: 'Barbie Girl', location: 'Costa', message: '#imabarbiegirlinabarbieworld', socialtype:'twitter', time: '10 minutes ago' },
      { profile: 'img/profile.png', name: 'Oliver Woodings', title: 'I\'m on a boat!', location: 'Starbucks', message: '#lonelyisland #imonaboat', socialtype: 'googleplus', time: '20 min' }
    ];

  })

  .controller('historyCtrl', function($scope) {
    $scope.visits = [
      { profile: 'img/starbucks.jpeg', name: 'Starbucks', location: 'Leicester', time: 'Today' },
      { profile: 'img/starbucks.jpeg', name: 'Costa', location: 'Loughborough', time: '2 days ago' },
      { profile: 'img/starbucks.jpeg', name: 'Starbucks', location: 'Leicester', time: '3 days ago' },
      { profile: 'img/starbucks.jpeg', name: 'Starbucks', location: 'Loughborough', time: 'A week ago' }
    ];
  });
