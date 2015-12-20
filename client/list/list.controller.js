
app.service('sharedProperties', function () {
    var property = null;

    return {
        getProperty: function () {
            return property;
        },
        setProperty: function(value) {
            property = value;
        }
    };
}).controller("ListController", function ListController($scope, $location, sharedProperties) {
    $scope.items = [
        {name: "One", count: 4},
        {name: "Two", count: 33},
        {name: "Three", count: 67}
    ];
    $scope.crossedItems = [];
    $scope.newList = '';
    $scope.texts = myTexts;
    $scope.edittedItem = sharedProperties.getProperty() != null ? sharedProperties.getProperty()  : {};

    var self = this;

    $scope.sortableOptions = {
        update: function(e, ui) {
        },
        axis: 'y'
    };

    $scope.openList = function() {
        console.log("openList");
        $location.path('/item');
    };

    $scope.addList = function() {

        var newList = {
            name: $scope.newList.trim(),
            completed: false,
            created: new Date(),
            count: 0
        };
        //
        if (!newList.name) {
            return;
        }

        console.log("addList: " + newList.name);

        $scope.items.push(newList);
        $scope.newList = '';
    };

    $scope.deleteAll = function() {
        console.log("deleteAll");
        $scope.crossedItems = [];
    };

    $scope.editList = function(list) {
        // edit start
        $scope.edittedItem = list;
        $scope.edittedItem.name = list.name;
        $scope.edittedItem.desc = list.desc;
        $scope.edittedItem.layout = list.layout;
        sharedProperties.setProperty(list);
        $location.path('/list/edit');
    };

    $scope.save = function(item) {
        // edit body
        // TODO

        console.log($scope.edittedItem.name);
        console.log($scope.edittedItem.desc);
        console.log($scope.edittedItem.layout);

        // edit end
        $location.path('/list');
        $scope.edittedItem = {};
    };

    $scope.crossList = function(list){
        console.log("cross");
        //list.crossed = true;

        self.removeFromArray(list, $scope.items);

        $scope.crossedItems.push(list);
    };

    $scope.uncrossList = function(list){
        console.log("uncross");
        //list.crossed = false;

        self.removeFromArray(list, $scope.crossedItems);
        $scope.items.push(list);
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };
});