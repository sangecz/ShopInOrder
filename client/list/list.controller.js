
app.controller("ListController", function ListController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.title = myTexts.list.title;
    $scope.crossedItems = [];
    $scope.newItem = '';
    $scope.texts = myTexts;
    self.listNeedSync = false;

    // lists
    $scope.items = [];
    self.getLists = function(){
        $http.get(myConfig.MY_API + '/list').then(function(data) {
            $scope.items = data.data;
            console.log(JSON.stringify($scope.items));
        });
    };
    self.getLists();

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