(function() {
    var app = angular.module("AngularJsStudy", []);

    app.factory("SharedStateService", function() {
        return {
            text: 'SharedStateService'
        };
    });

    app.controller("ShareControllerA", function($scope, SharedStateService) {
        $scope.data = SharedStateService;
    });

    app.controller("ShareControllerB", function($scope, SharedStateService) {
        $scope.data = SharedStateService;
    });
}());