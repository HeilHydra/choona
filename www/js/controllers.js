angular.module('choona.controllers', [])

  .controller('appCtrl', function ($scope, store) {
    $scope.profile = store.get('profile');
    $scope.name = $scope.profile.given_name || $scope.profile.name;
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

  .controller('playlistCtrl', function ($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/nowplaying.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.doRefresh = function() {
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply();
    };

    $scope.items = [
      { id:1, title: 'Gotta Be Somebody', artist: 'Nickelback', cover: 'img/cover.jpg' },
      { id:2, title: 'Dark Horse', artist: 'Nicelback', cover: 'img/cover.jpg' },
      { id:3, title: 'Someday', artist: 'Nickelback', cover: 'img/cover.jpg' },
      { id:4, title: 'All The Right Reasons', artist: 'Nickelback', cover: 'img/cover.jpg' },
      { id:5, title: 'All The Right Reasons', artist: 'Nickelback', cover: 'img/cover.jpg' },
      { id:6, title: 'All The Right Reasons', artist: 'Nickelback', cover: 'img/cover.jpg' },
      { id:7, title: 'All The Right Reasons', artist: 'Nickelback', cover: 'img/cover.jpg' }
    ];
    $scope.nowplaying = { id: 1, title: 'Someday', artist: 'Nickelback', cover: 'img/cover.jpg' };

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
