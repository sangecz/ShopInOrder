/**
 * Created by sange on 17/12/15.
 */


app.controller("ItemController", function ItemController($scope, $location, $http, sharedProperties, $mdToast) {

    var self = this;

    self.checkProperties = function(){
        if(sharedProperties.getProperty() != null && sharedProperties.getProperty().list !== undefined){
            $scope.edittedList = sharedProperties.getProperty().list;
            $scope.subtitle = $scope.edittedList.name;
        } else {
            $location.path('/list');
        }
    };
    self.checkProperties();

    // layouts
    self.layouts = [];
    self.getLayouts = function(){
        $http.get(myConfig.MY_API + '/layout').then(function(data) {
            self.layouts = data.data;
            if($scope.edittedList !== undefined) {
                self.getCategories();
            }
        });
    };
    self.getLayouts();

    $scope.crossedItemsNum = 0;
    $scope.crossedItems = [];
    $scope.items = [
            {name: 'ew', categoryId: 0, crossed: false},
            {name: 'esv', categoryId: 0, crossed: false},
            {name: 'sdvsvsd', categoryId: 2, crossed: false},
            {name: 'ngn', categoryId: 2, crossed: false},
            {name: 'asdasdasd', categoryId: 4, crossed: false}
    ];
    $scope.itemsOrganized = [];
    $scope.categories = [];
    // categories
    self.getCategories = function(){
        $http.get(myConfig.MY_API + '/category').then(function(data) {
            $scope.categories = data.data;
            self.categorizeItems();
        });
    };


    $scope.newItem = {};
    $scope.newItem.name = '';
    $scope.newItem.categoryId = 0;
    $scope.texts = myTexts;
    self.itemNeedSync = false;

    $scope.sortableOptions = {
        update: function(e, ui) {
            self.itemNeedSync = true;
            console.log(JSON.stringify($scope.itemsOrganized));
            //console.log(JSON.stringify(ui));
        },
        axis: 'y'
    };

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.name.trim(),
            desc: "",
            categoryId: $scope.newItem.categoryId,
            crossed: false,
            created: new Date()
        };
        //
        if (!newItem.name) {
            return;
        }

        //$scope.items.push(newItem);
        for(var c = 0; c < $scope.itemsOrganized.length; c++){
            if(newItem.categoryId == $scope.itemsOrganized[c].id){
                $scope.itemsOrganized[c].arr.push(newItem);
                break;
            }
        }

        $scope.newItem.name = '';
        $scope.newItem.categoryId = 0;

        self.itemNeedSync = true;
    };

    $scope.deleteAll = function() {
        //$scope.crossedItems = [];
        var itemsToDelete = [];
        for(var i = 0; i < $scope.itemsOrganized.length; i++) {
            var cat = $scope.itemsOrganized[i];
            for(var j = 0; j < cat.arr.length; j++) {
               if(cat.arr[j].crossed == true) {
                   itemsToDelete.push(cat.arr[j]);
               }
            }
        }
        for(var k = 0; k < itemsToDelete.length; k++) {
            var item = itemsToDelete[k];
            self.removeFromArray(item, $scope.itemsOrganized[item.categoryId].arr);
        }
        $scope.crossedItemsNum = 0;

        self.itemNeedSync = true;
    };

    $scope.editItem = function(item) {
        sharedProperties.setProperty({item: item, list: $scope.edittedList});
        $location.path('/item/edit');
    };

    $scope.crossItem = function(item){
        item.crossed = true;
        //self.removeFromArray(item, $scope.items);
        //$scope.crossedItems.push(item);
        $scope.crossedItemsNum++;
        self.itemNeedSync = true;
    };

    $scope.uncrossItem = function(item){
        item.crossed = false;
        //self.removeFromArray(item, $scope.crossedItems);
        //$scope.items.push(item);
        $scope.crossedItemsNum--;
        self.itemNeedSync = true;
    };

    $scope.categoryHasChild = function(cat){
        var catMembers = cat.arr.length;
        var catNonCrossedMembers = 0;
        for(var i = 0; i < catMembers; i++){
            var item = cat.arr[i];
            if(item.crossed == false) {
                catNonCrossedMembers++;
            }
        }
        return catNonCrossedMembers != 0;
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };

    self.categorizeItems = function () {
        var catSortedByLayout = [];
        for(var k = 0; k < self.layouts.length; k++) {
            if (self.layouts[k].id == $scope.edittedList.layoutId) {
                var categories = JSON.parse('[' + self.layouts[k].categories + ']');
                for(var c = 0; c < categories.length; c++){
                    var catId = categories[c];
                    for(var cat = 0; cat < $scope.categories.length; cat++){
                        if(catId == $scope.categories[cat].id){
                            var o = $scope.categories[cat];
                            o.arr = [];
                            catSortedByLayout.push(o);
                            break;
                        }
                    }
                }
                break;
            }
        }

        function objectPropInArray(list, prop, val) {
            if (list.length > 0 ) {
                for (i in list) {
                    if (list[i][prop] === val) {
                        return true;
                    }
                }
            }
            return false;
        }
        function addRemainingCategories(remaining){
            for(var i = 0; i < remaining.length; i++){
                if(!objectPropInArray(catSortedByLayout, 'id', remaining[i].id)){
                    var o = remaining[i];
                    o.arr = [];
                    catSortedByLayout.push(o);
                }
            }
        }
        addRemainingCategories($scope.categories);

        //console.log("AAA" + JSON.stringify(catSortedByLayout));

        // fills items into categorized array
        for(var j = 0; j < $scope.items.length; j++){
            for(var k = 0; k < catSortedByLayout.length; k++){
                if($scope.items[j].categoryId == catSortedByLayout[k].id){
                    catSortedByLayout[k].arr.push($scope.items[j]);
                }
            }
        }

        $scope.itemsOrganized = catSortedByLayout;
    };

    //--------------- NAVIGATION

    $scope.saveList = function(){
        // TODO
    };

    $scope.orderByLayout = function(){
        // TODO
        console.log("orderByLayout");
    };
});