
app.controller("ListController", function ListController($scope, $location, $http) {
    $scope.items = [
        {name: "One", count: 4},
        {name: "Two", count: 33},
        {name: "Three", count: 67}
    ];
    $scope.crossedItems = [];
    $scope.newList = '';
    $scope.texts = myTexts;

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

    $scope.editList = function() {
        console.log("editList");
        $location.path('/list/edit');
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