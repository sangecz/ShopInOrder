/**
 * Created by sange on 17/12/15.
 */


app.controller("ItemController", function ItemController($scope, $location) {
    $scope.items = ["ItemOne", "TItemwo", "ItemThree"];
    $scope.crossedItems = [];
    $scope.newList = '';
    $scope.texts = myTexts;

    $scope.sortableOptions = {
        update: function(e, ui) {
        },
        axis: 'y'
    };

    $scope.openList = function() {
        console.log("openList");
        $location.path('../item');
    };

    $scope.addList = function() {

        var newList = {
            title: $scope.newList.trim(),
            completed: false
        };
        //
        //if (!newList.title) {
        //    return;
        //}

        console.log("addList: " + newList.title);

        $scope.items.push(newList.title);
    };

    $scope.deleteAll = function() {
        console.log("deleteAll");
        $scope.crossedItems = [];
    };

    $scope.editList = function() {
        console.log("editList");
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