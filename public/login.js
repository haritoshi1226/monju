'use strict';

let login = {
    region: 'us-east-1',
    PoolData: {
        UserPoolId: 'us-east-1_ugf6T6uZ0',
        ClientId: '7gqtekulb2qvp0j88i3klsjjk8',
    },
};

let userPool = new AmazonCognitoIdentity.CognitoUserPool(login.PoolData);
let cognitoUser = userPool.getCurrentUser();
angular.module('myApplogin', [ 'ngRoute' ])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: 'views/loginView.html',
                controller: 'LoginController'
            })
            .when('/signup', {
                templateUrl: 'views/signup.html',
                controller: 'SignupController'
            })
            .when('/newpassword', {
                templateUrl: 'views/newpassword.html',
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
    .controller('LoginController', ['$scope', function($scope) {
        $scope.email = 'hariki@keio.jp';
        $scope.password = 'rNY#Xy';
        $scope.submit = function() {
            login.userlogin($scope.email, $scope.password);
        };
    }])
    .controller('SignupController', ['$scope', function($scope) {
    }])
    .controller('NewpasswordController', ['$scope', function($scope) {
        $scope.password = '';
        $scope.password2 = '';
        $scope.submit = function() {
            if ($scope.password == $scope.password2){
                login.newpassword($scope.password);
            }else{
                console.log('確認と違う');
            }
        };
    }]);



if (cognitoUser != null){
    cognitoUser.getSession(function(err, sessresult) {
        if (sessresult) {
            console.log('You are now logged in.');
            cognitoUser.getUserAttributes(function(err, attrresult) {
                if (err) {
                    alert(err);
                    return;
                }
                window.location.href = '/';
            });
        }
    })
}

login.userlogin = function(email, pw){
    var authenticationData = {
        Username : email,
        Password : pw,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var userData = {
        Username : email,
        Pool : userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            window.location.href = '/';
        },
        onFailure: function(err) {
            console.log(err);
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
            // console.log("User needs new password");
            window.location.href = '#!/newpassword';
        },
    });
};

login.newpassword = function(npw){
    cognitoUser.completeNewPasswordChallenge(npw, null, this)
};
