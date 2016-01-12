app.controller("AuthController", function AuthController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.title = myTexts.lbl.login;
    $scope.data = {};
    $scope.data.registerToggle = false;

    $scope.user = {
        email: "",
        password: "",
        username: ""
    };

    $scope.loginRegister = function(){
        var url = '';

        if($scope.data.registerToggle) {
            // register
            if($scope.user.username === '' || $scope.user.password === '' || $scope.user.email === '') {
                myToast.showToast(myTexts.msg.emailPassUsernameRequired, $mdToast);
                return;
            }

            if(!self.isValidEmail($scope.user.email)){
                myToast.showToast(myTexts.msg.invalidEmail, $mdToast);
                return;
            }

            url = myConfig.MY_API + '/register';
        } else {
            // login
            if($scope.user.username === '' || $scope.user.password === '') {
                myToast.showToast(myTexts.msg.usernamePassRequired, $mdToast);
                return;
            }

            url = myConfig.MY_API + '/login';
        }

        $http({
            url: url,
            method: 'POST',
            data: {
                username: $scope.user.username,
                password: $scope.user.password,
                email: $scope.user.email
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function (res) {
            if($scope.data.registerToggle) {
                myToast.showToast(myTexts.msg.verifyEmail, $mdToast);
            }

            var minutesLater = new Date();
            minutesLater.setMinutes(minutesLater.getMinutes() + 120);
            $cookies.put('token', res.data.token, { expires: minutesLater});
            $cookies.put('userId', res.data.userId, { expires: minutesLater});
            $location.path('/list');
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    self.isValidEmail = function(email){
        return !!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    };

    $scope.toggleRegister = function(){
        $scope.data.registerToggle = !$scope.data.registerToggle;
        $scope.title = $scope.data.registerToggle ? myTexts.lbl.register : myTexts.lbl.login;
    };

    //--------------- NAVIGATION

    $scope.showLists = function(){
        $location.path('/list');
    };

    $scope.showLayouts = function(){
        $location.path('/layout');
    };

    $scope.sync = function(){
    };

});