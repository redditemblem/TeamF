app.controller('OverworldCtrl', ['$scope', '$location', 'OverworldService', function ($scope, $location, OverworldService) {

    //Reroutes the user if they haven't logged into the app
    //Loads data from the OverworldService if they have
    if(OverworldService.getMapItems() == null)
        $location.path('/');
    else{
        $scope.mapUrl = OverworldService.getMap();
        $scope.mapItems = OverworldService.getMapItems();
    }

    $scope.itemHoverIn = function(i){ $scope[i+"hover"] = true; };
    $scope.itemHoverOut = function(i){ $scope[i+"hover"] = false; };
    $scope.itemHoverOn = function(i){ return $scope[i+"hover"] == true; };
}]);