'use strict';

let monju = {
    region: 'us-east-1',
    identity: new $.Deferred(),
    IdentityData: {
        IdentityPoolId: "us-east-1:31e8710e-df81-4c5f-90b1-79a1ede85575"
    },
    PoolData: {
        UserPoolId: 'us-east-1_ugf6T6uZ0',
        ClientId: '7gqtekulb2qvp0j88i3klsjjk8',
    },
    user: {
        username: '',
        email: '',
        idToken: '',
    }
};

AWS.config.region = monju.region;
var userPool = new AmazonCognitoIdentity.CognitoUserPool(monju.PoolData);
var cognitoUser = userPool.getCurrentUser();

let app = angular.module('myApp', [ 'ui.router' ])
    .config(function($stateProvider) {
        $stateProvider.state('/', {
            url: '/',
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardController'
        })
    })
    .config(function($stateProvider) {
        $stateProvider.state('/login', {
            url: '/login',
            templateUrl: 'views/loginView.html',
            controller: 'LoginController'
        })
    })
    .config(function($stateProvider) {
        $stateProvider.state('/signup', {
            url: '/signup',
            templateUrl: 'views/signup.html',
            controller: 'SignupController'
        })
    })
    .config(function($stateProvider) {
        $stateProvider.state('/login/newpassword', {
            url: '/login/newpassword',
            templateUrl: 'views/newpassword.html',
            controller: 'NewpasswordController'
        })
    })
    .config(function($urlRouterProvider) {
        $urlRouterProvider.otherwise(function($injector) {
            let $state = $injector.get('$state');
            $state.go('/');
        })
    })
    .controller('LoginController', function($scope) {
        $scope.email = 'hariki@keio.jp';
        $scope.password = 'rNY#Xy';
        $scope.submit = function() {
            monju.userlogin($scope.email, $scope.password);
        };
    })
    .controller('SignupController', ['$scope', function($scope) {
    }])
    .controller('NewpasswordController', ['$scope', function($scope) {
        $scope.password = '';
        $scope.password2 = '';
        $scope.submit = function() {
            if ($scope.password == $scope.password2){
                monju.newpassword($scope.password);
            }else{
                console.log('確認と違う');
            }
        };
    }])
    .controller('DashboardController', ['$scope', '$interval', '$http', function($scope, $interval, $http) {
        let update = function() {
            $scope.email = monju.user.email;
        };
        update();
        $interval(update, 1000);

        let components = [];
        $scope.article_url = "";
        $scope.articles = components;
        $scope.add = function(type){
            if (type=="article"){
                monju.searchContent($scope.article_url).then(function(item){
                    let json_data = JSON.parse(item.Payload);
                    components.push(json_data);
                });
            }
        };
        // let searched_books = [];

        let pre_book_query = "";
        $scope.books = [];
        $scope.book_query = "";
        let incremental = function() {
            if ($scope.book_query != pre_book_query){
                pre_book_query = $scope.book_query;
                if ($scope.book_query != ""){
                    $scope.book_search();
                }
            }
        };
        $interval(incremental, 500);
        $scope.book_search = function(){
            const query = $scope.book_query;
            $http({
                method: "GET",
                url: "https://www.googleapis.com/books/v1/volumes?q="+query+"&country=JP"
            })
            .then(function successCallback(response) {
                $scope.books = [];
                for (let i=0; i<response.data.items.length; i++){
                    const r = {};
                    r.title = response.data.items[i].volumeInfo.title;
                    r.authors = "";
                    for (let j=0; j<response.data.items[i].volumeInfo.authors.length; j++){
                        r.authors += response.data.items[i].volumeInfo.authors[j] + ", ";
                    }
                    r.authors = r.authors.slice(0,-2);
                    r.img = response.data.items[i].volumeInfo.imageLinks.thumbnail;
                    r.publishedDate = response.data.items[i].volumeInfo.publishedDate;
                    $scope.books.push(r);
                }
                // console.log($scope.books);
                // console.log(response.data.items);
            }, function errorCallback(response) {
                console.log(response);
            });
        };

        $scope.delete_article = function(ind){
            if (ind == 0) {
                $scope.articles.shift();
            } else {
                $scope.articles.splice(ind, ind);
            }
        };

        $scope.registrate = function(type, ind){
            if (type=="article"){
                const item = $scope.articles[ind];
                if (ind == 0) {
                    $scope.articles.shift();
                } else {
                    $scope.articles.splice(ind, ind);
                }
                console.log(item);
            }
            if (type=="book") {
                const item = $scope.books[ind];
                if (ind == 0) {
                    $scope.books.shift();
                } else {
                    $scope.books.splice(ind, ind);
                }
                console.log(item);
            }
        }


    }]);

monju.appOnReady = function(){
    if (cognitoUser != null){
        cognitoUser.getSession(function(err, sessresult) {
            if (err) {
                console.log(err);
                window.location.href = '#!/login';
            } else {
                console.log('You are now logged in.');
                cognitoUser.getUserAttributes(function(err, attrresult) {
                    if (!err) {
                        for (let i = 0; i < attrresult.length; i++) {
                            if (attrresult[i].Name == 'sub') {
                                monju.user.username = attrresult[i].Value;
                            }
                            if (attrresult[i].Name == 'email') {
                                monju.user.email = attrresult[i].Value;
                            }
                        }
                    }
                });
                monju.user.idToken = sessresult.getIdToken().getJwtToken();
                const loginInfo = {};
                loginInfo["cognito-idp."+monju.region+".amazonaws.com/"+monju.PoolData.UserPoolId] = monju.user.idToken;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: monju.IdentityData.IdentityPoolId,
                    Logins: loginInfo
                });

                monju.awsRefresh().then(function(id){
                    monju.identity.resolve({
                        id: id,
                        email: monju.user.email
                    })
                });
            }
        });
    }
};

monju.userlogin = function(email, pw){
    let authenticationData = {
        Username : email,
        Password : pw,
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    let userData = {
        Username : email,
        Pool : userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('login');
            window.location.href = '/';
        },
        onFailure: function(err) {
            console.log(err);
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
            // console.log("User needs new password");
            window.location.href = '#!/login/newpassword';
        },
    });
};

monju.newpassword = function(npw){
    cognitoUser.completeNewPasswordChallenge(npw, null, this)
};

monju.awsRefresh = function() {
    let deferred = new $.Deferred();
    AWS.config.credentials.refresh(function(err){
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve(AWS.config.credentials.identityId);
        }
    });
    return deferred.promise();
};

monju.sendAwsRequest = function(req) {
    var promise = new $.Deferred();
    req.on('error', function(error) {
        if (error.code === "CredentialsError") {
            window.location.href = '#!/login';
        } else {
            promise.reject(error);
        }
    });
    req.on('success', function(resp) {
        promise.resolve(resp.data);
    });
    req.send();
    return promise;
};

monju.searchContent = function(url) {
    return monju.identity.then(function() {
        var lambda = new AWS.Lambda();
        var params = {
            FunctionName: 'monju_contents_search',
            Payload: JSON.stringify({"url": url})
        };
        return monju.sendAwsRequest(lambda.invoke(params));
    });
};

window.fbAsyncInit = function() {
    FB.init({
        appId            : '201981673731825',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v3.1',
        status           : true
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


$(window).ready(monju.appOnReady);