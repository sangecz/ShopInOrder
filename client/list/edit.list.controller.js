app.controller("EditListController", function ListController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.texts = myTexts;
    self.listNeedSync = false;
    $scope.edittedList = {};
    $scope.edittedList.name = "";

    self.checkProperties = function() {
        if(sharedProperties.getProperty() != null && sharedProperties.getProperty().list !== undefined){
            $scope.edittedList = sharedProperties.getProperty().list;
            $scope.subtitle = $scope.edittedList.name;
        } else {
            $location.path('/list');
        }
    };
    self.checkProperties();

    // layouts
    $scope.layouts = [];
    self.getLayouts = function(){
        $http.get(myConfig.MY_API + '/layout').then(function(data) {
            $scope.layouts = data.data;
            if($scope.edittedList !== undefined) {
                self.getCategories();
            }
        });
    };
    self.getLayouts();

    $scope.saveItem = function(item) {
        if(!(typeof $scope.edittedList.name === 'string')) {
            myToast.showToast(myTexts.msg.emptyName, $mdToast);
            return;
        }

        var list = $scope.edittedList;

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
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };


    $scope.crossedItemsNum = 0;
    $scope.crossedItems = [];
    self.items = [
        {name: 'ew', categoryId: 0, crossed: false},
        {name: 'esv', categoryId: 6, crossed: false},
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
            $scope.categorizeItems($scope.edittedList.layoutId);
        });
    };


    $scope.newItem = {};
    $scope.newItem.name = '';
    $scope.newItem.categoryId = 0;
    $scope.texts = myTexts;
    self.itemNeedSync = false;

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

    $scope.categorizeItems = function (layoutId) {
        console.log(layoutId);
        $scope.itemsOrganized = [];
        for(var k = 0; k < $scope.layouts.length; k++) {
            if ($scope.layouts[k].id == layoutId) {
                var categories = JSON.parse('[' + $scope.layouts[k].categories + ']');

                for(var c = 0; c < categories.length; c++){
                    var catId = categories[c];
                    for(var cat = 0; cat < $scope.categories.length; cat++){
                        if(catId == $scope.categories[cat].id){
                            var o = $scope.categories[cat];
                            o.arr = [];
                            $scope.itemsOrganized.push(o);
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
                if(!objectPropInArray($scope.itemsOrganized, 'id', remaining[i].id)){
                    var o = remaining[i];
                    o.arr = [];
                    $scope.itemsOrganized.push(o);
                }
            }
        }
        addRemainingCategories($scope.categories);

        // fills items into categorized array

        for(var j = 0; j < self.items.length; j++){
            for(var k = 0; k < $scope.itemsOrganized.length; k++){
                if(self.items[j].categoryId == $scope.itemsOrganized[k].id){
                    $scope.itemsOrganized[k].arr.push(self.items[j]);
                }
            }
        }
        //$scope.itemsOrganized = $scope.itemsOrganized;

        console.log("ORGANIZED: " + JSON.stringify($scope.itemsOrganized));
    };

});