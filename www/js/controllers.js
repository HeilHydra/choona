angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('playlistCtrl', function($scope, $ionicModal, $timeout) {

$ionicModal.fromTemplateUrl('templates/nowplaying.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

$scope.openModal = function() {
	$scope.modal.show()
}

$scope.closeModal = function() {
	$scope.modal.hide();
};

$scope.$on('$destroy', function() {
	$scope.modal.remove();
});

$scope.doRefresh = function(){
	$scope.$broadcast('scroll.refreshComplete');
	$scope.$apply()
};

})


.controller('activityCtrl', function($scope, $ionicModal, $timeout) {

$scope.doRefresh = function(){
	$scope.$broadcast('scroll.refreshComplete');
	$scope.$apply()
};

})
