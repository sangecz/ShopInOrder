
app.controller("ListController", function ListController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.title = myTexts.list.title;
    $scope.subtitle = myTexts.list.edit;
    self.itemOrderChanged = false;

    // lists
    $scope.items = [];
    self.getLists = function(){
        $http.get(myConfig.MY_API + '/list').then(function(data) {
            $scope.items = data.data;
            myCache.save('lists', $scope.items, $cookies);
        });
    };
    self.getLists();

    // layouts
    $scope.layouts = [];
    self.getLayouts = function(){
        $http.get(myConfig.MY_API + '/layout').then(function(data) {
            $scope.layouts = data.data;
            myCache.save('layouts', $scope.layouts, $cookies);
        });
    };
    self.getLayouts();

    $scope.crossedItems = [];
    $scope.newItem = '';
    $scope.texts = myTexts;
    $scope.edittedItem = sharedProperties.getProperty() != null ? sharedProperties.getProperty().item : $location.path('/list');
    $scope.edittedItem.layoutId = parseInt($scope.edittedItem.layoutId) == 'number' ? parseInt($scope.edittedItem.layoutId) : "";

    $scope.sortableOptions = {
        update: function(e, ui) {
            self.itemOrderChanged = true;
        },
        axis: 'y'
    };

    $scope.openItem = function(item) {
        $location.path('/item');
    };

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.trim(),
            completed: false,
            created: new Date(),
            count: 0
        };
        //
        if (!newItem.name) {
            return;
        }

        $scope.items.push(newItem);
        $scope.newItem = '';

        self.itemOrderChanged = true;
    };

    $scope.deleteAll = function() {
        $scope.crossedItems = [];
    };

    $scope.editItem = function(item) {
        sharedProperties.setProperty({item: item});
        $location.path('/list/edit');
    };

    $scope.saveItem = function(item) {
        if(!(typeof $scope.edittedItem.name === 'string')) {
            self.showToast(myTexts.msg.emptyName);
            return;
        }

        var list = $scope.edittedItem;

        $http({
            url: myConfig.MY_API + '/list/' + list.id,
            method: 'PUT',
            data: {
                item: list
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function () {
            self.showToast(myTexts.msg.succSave);
            $scope.back();
        }, function(res){
            self.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err);
        });
    };

    $scope.crossItem = function(item){
        //item.crossed = true;

        self.removeFromArray(item, $scope.items);

        $scope.crossedItems.push(item);
    };

    $scope.uncrossItem = function(item){
        //item.crossed = false;

        self.removeFromArray(item, $scope.crossedItems);
        $scope.items.push(item);
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };

    //--------------- NAVIGATION

    //$scope.back = function (){
    //    $location.path('/list');
    //    $scope.edittedItem = {};
    //};

    $scope.showLists = function(){
        $location.path('/list');
    };

    $scope.showLayouts = function(){
        $location.path('/layout');
    };

    $scope.sync = function(){
        self.getLists();
        self.getLayouts();
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