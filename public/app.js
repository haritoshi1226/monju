'use strict';

let monju = {
    region: 'us-east-1',
    IdentityData: {
        IdentityPoolId: "us-east-1:31e8710e-df81-4c5f-90b1-79a1ede85575"
    },
    PoolData: {
        UserPoolId: 'us-east-1_dkJZXEeMP',
        ClientId: '7bao36ekqs0g4khk5ert18r44',
    },
    accessToken: new $.Deferred(),
    idToken: new $.Deferred(),
    refreshToken: new $.Deferred(),
};

// AWS.config.region = monju.region;
// AWS.config.credentials = new AWS.CognitoIdentityCredentials(monju.IdentityData);

var userPool = new AmazonCognitoIdentity.CognitoUserPool(monju.PoolData);
var cognitoUser = userPool.getCurrentUser();

if (cognitoUser != null){
    cognitoUser.getSession(function(err, sessresult) {
        if (sessresult) {
            console.log('You are now logged in.');
            cognitoUser.getUserAttributes(function(err, attrresult) {
                if (err) {
                    alert(err);
                    return;
                }
                // $("#username").html("Username: " + cognitoUser.username);
                //
                // for (i = 0; i < attrresult.length; i++) {
                //     if (attrresult[i].getName()=="email"){
                //         $("#email").html("EMail: " + attrresult[i].getValue());
                //     }
                // }

                // Add the User's Id Token to the Cognito credentials login map.
                // AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                //     IdentityPoolId: 'ap-northeast-1:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                //     Logins: {
                //         'cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_XXXXXXXXXXX': sessresult.getIdToken().getJwtToken()
                //     }
                // });
            });
        } else {
            var url = "login.html";
            $(location).attr("href", url);
        }
    })

}

monju.loginView = function(data){

};

// }else{
//
// }


// var authenticationData = {
//     Username : 'hariki@keio.jp',
//     Password : 'Tukasa77',
// };
// var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
// var userData = {
//     Username : 'hariki',
//     Pool : userPool
// };
// var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// cognitoUser.authenticateUser(authenticationDetails, {
//     onSuccess: function (result) {
//         // console.log('access token + ' + result.getAccessToken().getJwtToken());
//         /*Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer*/
//         // console.log('idToken + ' + result.idToken.jwtToken);
//         monju.accessToken = result.getAccessToken().getJwtToken();
//         monju.idToken = result.idToken.jwtToken;
//         monju.refreshToken = result.refreshToken.token;
//     },
//     onFailure: function(err) {
//         alert(err);
//         console.log(err);
//     },
//     newPasswordRequired: function(userAttributes, requiredAttributes) {
//         console.log("User needs new password");
//         console.log({userAttributes, requiredAttributes});
//         cognitoUser.completeNewPasswordChallenge('Tukasa77', null, this)
//     },
// });



angular.module('myApp', [])
    .controller('AppController', function($scope) {
        $scope.username = '';
        $scope.password = '';
        $scope.users = [];
        $scope.submit = function() {
            $scope.users.push({
                username: $scope.username,
                password: $scope.password
            });
        };

    });


