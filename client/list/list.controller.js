
app.controller("ListController", function ListController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    self.checkProperties = function() {
        if(sharedProperties.getProperty() != null && sharedProperties.getProperty().list !== undefined){
            $scope.edittedItem = sharedProperties.getProperty().list;
            $scope.edittedItem.layoutId = parseInt($scope.edittedItem.layoutId) == 'number' ? parseInt($scope.edittedItem.layoutId) : "";
        } else {
            $location.path('/list');
        }
    };
    self.checkProperties();

    $scope.title = myTexts.list.title;
    self.listNeedSync = false;

    // lists
    $scope.items = [];
    self.getLists = function(){
        $http.get(myConfig.MY_API + '/list').then(function(data) {
            $scope.items = data.data;
        });
    };
    self.getLists();

    // layouts
    $scope.layouts = [];
    self.getLayouts = function(){
        $http.get(myConfig.MY_API + '/layout').then(function(data) {
            $scope.layouts = data.data;
        });
    };
    self.getLayouts();

    $scope.crossedItems = [];
    $scope.newItem = '';
    $scope.texts = myTexts;

    $scope.sortableOptions = {
        update: function(e, ui) {
            self.listNeedSync = true;
        },
        axis: 'y'
    };

    $scope.openItem = function(item) {
        sharedProperties.setProperty({list: item});
        $location.path('/item');
    };

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.trim(),
            desc: '',
            count: 0,
            crossed: false,
            created: new Date()
        };
        //
        if (!newItem.name) {
            return;
        }

        $scope.items.push(newItem);
        $scope.newItem = '';

        self.listNeedSync = true;
    };

    $scope.deleteAll = function() {
        $scope.crossedItems = [];
        self.listNeedSync = true;
    };

    $scope.editItem = function(item) {
        sharedProperties.setProperty({list: item});
        $location.path('/list/edit');
    };

    $scope.saveItem = function(item) {
        if(!(typeof $scope.edittedItem.name === 'string')) {
            myToast.showToast(myTexts.msg.emptyName, $mdToast);
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
            myToast.showToast(myTexts.msg.succSave, $mdToast);
            self.listNeedSync = true;
            $scope.back();
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    $scope.crossItem = function(item){
        item.crossed = true;
        self.removeFromArray(item, $scope.items);
        $scope.crossedItems.push(item);
        self.listNeedSync = true;
    };

    $scope.uncrossItem = function(item){
        item.crossed = false;
        self.removeFromArray(item, $scope.crossedItems);
        $scope.items.push(item);
        self.listNeedSync = true;
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };

    //--------------- NAVIGATION

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
});