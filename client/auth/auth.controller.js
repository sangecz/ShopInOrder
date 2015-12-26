app.controller("AuthController", function AuthController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.texts = myTexts;
    $scope.title = myTexts.lbl.login;

    $scope.user = {
        email: "",
        password: ""
    };

    $scope.login = function(){

        if($scope.user.email === '' || $scope.user.password === '') {
            myToast.showToast(myTexts.msg.emailPassRequired, $mdToast);
            return;
        }

        if(!self.isValidEmail($scope.user.email)){
            myToast.showToast(myTexts.msg.invalidEmail, $mdToast);
            return;
        }

        $http({
            url: myConfig.MY_API + '/login',
            method: 'POST',
            data: {
                user: $scope.user
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function (res) {
            var minutesLater = new Date();
            minutesLater.setMinutes(minutesLater.getMinutes() + 120);
            $cookies.put('token', res.data.token, { expires: minutesLater});
            $location.path('/list');
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    self.isValidEmail = function(email){
        return !!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
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