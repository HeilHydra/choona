// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
  $stateProvider

      .state('app', {
        url:  "/app",
        abstract:true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.playlist', {
        url:  "/playlist",
        views: {
          'menuContent' :{
            templateUrl: "templates/playlist.html",
            controller:'playlistCtrl'
          }
        }
    })

    .state('app.activity', {
        url:  "/activity",
        views: {
          'menuContent' :{
            templateUrl: "templates/activity.html"
          }
        }
    })

    .state('app.history', {
        url:  "/history",
        views: {
          'menuContent' :{
            templateUrl: "templates/history.html",
          }
        }
    })

    .state('app.historysongs', {
        url:  "/history/songs",
        views: {
          'menuContent' :{
            templateUrl: "templates/history-detail.html",
          }
        }
    })

    .state('app.settings', {
        url:  "/settings",
        views: {
          'menuContent' :{
            templateUrl: "templates/settings.html"
          }
        }
    });
    $urlRouterProvider.otherwise('/app/playlist');
});
