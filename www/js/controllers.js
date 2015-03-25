angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('playlistCtrl', function($scope, $ionicModal, $timeout) {

$scope.doRefresh = function(){
	$scope.$broadcast('scroll.refreshComplete');
	$scope.$apply()
};

})