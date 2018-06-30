let myApp = angular.module('myApp', [ 'ngRoute' ])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl : 'dashboard.html',
                controller: 'DashboardController'
            })
            .when('/login', {
                templateUrl: 'login.html',
                controller: 'LoginController'
            })
            .when('/signup', {
                templateUrl: 'signup.html',
                controller: 'SignupController'
            })
            .when('/newpassword', {
                templateUrl: 'newpassword.html',
                controller: 'NewpasswordController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .config(['$stateProvider', function($stateProvider){
        $stateProvider
            .state('dashboard', {
                url : '/dashboard',
                controller: 'DashboardController'
            })
            .when('/login', {
                templateUrl: 'login.html',
                controller: 'LoginController'
            })
            .when('/signup', {
                templateUrl: 'signup.html',
                controller: 'SignupController'
            })
            .when('/newpassword', {
                templateUrl: 'newpassword.html',
                controller: 'NewpasswordController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .controller('RouteController', ['$scope', '$state', function($scope, $state) {
        $scope.changePage = function(page) {
            console.log(page);
            $state.go(page);
        }
    }])
    .controller('DashboardController', ['$scope', function($scope) {
    }])
    .controller('LoginController', ['$scope', function($scope) {
    }])
    .controller('SignupController', ['$scope', function($scope) {
    }])
    .controller('NewpasswordController', ['$scope', function($scope) {
    }]);

