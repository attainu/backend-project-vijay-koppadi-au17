// import { resolve } from "dns";

angular.module('maincontroller',['authService','ngAnimate'])
.controller('mainCtrl',['$scope', 'Auth','$timeout','$state','$rootScope','$window','$interval','AuthToken','userFactory','Authenticate','$animate' , function($scope, Auth, $timeout, $state, $rootScope, $window, $interval, AuthToken, userFactory, Authenticate, $animate, hasToken){
    // $animate.classNameFilter(/ng-animate-enabled/);
    var app= this;
    app.loadMe = false;
    app.errorMsg = "";
    app.successMsg = "";
    app.logUserRole;
    app.isLoggedIn = Auth.isLoggedIn();
    $scope.logUsername = Auth.identity.username;
    // this.loadingModal = $('#loading').modal();


    this.runSessionCheck = function(){
        $timeout(function(){
            if ((app.checkingSession == false || app.checkingSession == null) && Auth.isLoggedIn()){
                app.checkSession()
                app.checkingSession = true;
            } else {
                app.checkingSession = false;
            }
        },500)

    }
    app.runSessionCheck()

    this.triggerModal = function(dom){
        var id = '#'+dom;
        $(id).modal('toggle')
    }

    this.toggleDashboardMenu = function() {
        var toggleWidth = $("#dash-menu").width() == 200 ? "50px" : "200px";
        $('#dash-menu').animate({ width: toggleWidth });
    }

    this.checkSession = function(){
        app.loadMe = true;
        app.successMsg = "";
        app.errorMsg = "";
        var interval = $interval(function(){
            var storedToken = $window.localStorage.getItem('token');
            if(storedToken === null){
                $interval.cancel(interval);
            } else {
                var parsedJwt = Auth.parseJwtBody(storedToken);
                var expTime = parsedJwt.exp;
                var timeStamp = Math.floor(Date.now()/1000);
                var difference = expTime - timeStamp;
                if(difference > 30 ){
                }
                else if(difference  > 0 && difference <= 30 ) {
                $('#session').modal('show')
                    app.loading = false;
                } else {
                    app.loading = false;
                    $scope.logUsername = null;
                    Auth.logout();
                    app.errorMsg = "Goodbye!"
                    $timeout(function(){
                        app.errorMsg = "";
                        // $('#session').modal('hide');
                        // $state.reload()
                        app.sessionLogout();
                    }, 2000);
                }
                
            }
        }, 2000)
    }

    
    this.getName = function(){
        if(Authenticate.data.success){
            $scope.logUsername = Auth.identity.username;
        } else {
            // handle error
        }
    }
    app.getName(); //Function to renew user credentials on state change -- DEPRECATED
    
    this.fb = function(){
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
    }

    this.loginUser = function(loginData){
        app.loading = true;
        app.errorMsg = false;
        app.triggerModal('loading');
        Auth.login(app.loginData).then(function(data){
            if(data.data.success){
                app.loading = false;
                //Success Message
                app.successMsg = data.data.message + "...Redirecting, please wait";
                
                $scope.logUsername = data.data.username;
                app.logUserRole = data.data.role;
                app.checkingSession = true;
                
                //Timeout redirecting to homepage
                $timeout(function(){
                    // $location.path('/profile');
                    $('#loading').modal('hide')
                    $state.reload('app') // relaod parent state
                    
                    $state.go("app.dashboard",{}, {reload:true});
                    app.loginData = null;
                    app.successMsg = null;
                    app.checkSession();

                }, 500);
            } else {
                // Create an error message
                app.loading = false;
                app.errorMsg = data.data.message
                $timeout(function(){
                    $('#loading').modal('toggle')
                }, 500)
            }

        })
    }

    // this.logout = function(){
    //     Auth.logout();
    //         app.isLoggedIn = false;
    // }

    
    this.sessionLogout = function(){
        
        this.loading = false;
        this.errorMsg = "Thank you for your visit";
        $timeout(function(){
            // $state.go('app',{},{reload: true});
            $('#session').modal('hide');
            Auth.logout();
        }, 500)
    }

    //Renew session
    this.renewSession = function(){
        this.loading = true;
        // Function to retrieve a new token for the user
        userFactory.renewSession($scope.logUsername).then(function(data) {
            // Check if token was obtained
            if (data.data.success) {
                AuthToken.setToken();
                AuthToken.setToken(data.data.token); // Re-set token
                app.loading = false;
                app.successMsg = "Enjoy!";
                $timeout(function(){
                    $('#session').modal('hide');
                }, 1000)
            } else {
                app.loading = false;
                app.errorMsg = "Session renewal failed, please login"
                $timeout(function(){
                    $('#session').modal('hide');
                    $state.go('/login')
                }, 1000)
            }
        });
    }
}])
    //Password and Username Reset Controller
.controller('resetCtrl', function(userFactory, $scope, $timeout, $location, Auth, AuthToken){
    var app = this;
    this.loading = false;
    
    this.resendUsername = function(email){
        app.loading = true;
        userFactory.resendemail(email).then(function(data){
            if(data.data.success){
                app.loading = false;
                app.successMsg = data.data.message;
                $timeout(function(){
                    $('#reset').modal('hide');
                },6000)
            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        })
    }
    this.resetPasswordEmail = function(email)
    {
        app.loading = true;
        userFactory.sendpasswordlink(email).then(function(data){
            if(data.data.success){
                console.log(data)
                app.loading = false;
                app.successMsg = data.data.message;
                $timeout(function(){
                    $('#reset').modal('hide');
                },2000)

            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
                console.log(data.data.success)
                console.log(data)
            }
        })
    }
})
.config(['$animateProvider', function($animateProvider){
    // restrict animation to elements with the bi-animate css class with a regexp.
    // note: "bi-*" is our css namespace at @Bringr.
    $animateProvider.classNameFilter(/animate/);
  }]);
// .directive("disableAnimate", function ($animate) {
//     return function (scope, element) {
//         $animate.enabled(false, element);
//     };
// });
