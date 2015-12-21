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
            self.showToast(myTexts.msg.emailPassRequired);
            return;
        }

        if(!self.isValidEmail($scope.user.email)){
            self.showToast(myTexts.msg.invalidEmail);
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
            self.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err);
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

    //--------------- TOAST
    var last = {
        bottom: false,
        top: true,
        left: false,
        right: true
    };
    $scope.toastPosition = angular.extend({},last);
    $scope.getToastPosition = function() {
        sanitizePosition();
        return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
    };
    function sanitizePosition() {
        var current = $scope.toastPosition;
        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;
        last = angular.extend({},current);
    }

    self.showToast = function(msg){
        $mdToast.show(
            $mdToast.simple()
                .textContent(msg)
                .position($scope.getToastPosition())
                .hideDelay(2000)
        );
    };

});