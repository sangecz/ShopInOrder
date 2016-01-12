app.controller("EditListController", function ListController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    self.listNeedSync = false;
    $scope.edittedList = {};
    $scope.edittedList.name = "";
    $scope.crossedItemsNum = 0;
    $scope.crossedItems = [];
    self.items = [];
    $scope.newItem = {};
    $scope.newItem.name = '';
    $scope.newItem.category = 0;
    self.itemNeedSync = false;

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
        $http({
            url: myConfig.MY_API + '/layout',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            for(var i = 0; i < res.data.results.length; i++){
                var r = res.data.results[i];
                $scope.layouts.push(r);
            }
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };
    self.getLayouts();

    $scope.saveList = function() {
        if(!(typeof $scope.edittedList.name === 'string')) {
            myToast.showToast(myTexts.msg.emptyName, $mdToast);
            return;
        }
        var list = $scope.edittedList;
        list.layout_id = {
            objectId: list.layout_id.objectId,
            '__type': "Pointer",
            className: "layouts"
        };

        self.updateList(list);
    };

    self.updateList = function(list) {
        $http({
            url: myConfig.MY_API + '/list/' + list.objectId,
            method: 'PUT',
            data: list,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            myToast.showToast(myTexts.msg.succSave, $mdToast);
            $scope.back();
        }, function (res) {
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };


    self.getItems = function(){
        $http({
            url: myConfig.MY_API + '/itemForList/' + $scope.edittedList.objectId,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            var cnt = 0;
            for(var i = 0; i < res.data.results.length; i++){
                var r = res.data.results[i];
                if(r.crossed){
                    cnt++;
                    $scope.crossedItems.push(r);
                }
                self.items.push(r);
            }
            $scope.crossedItemsNum = cnt;
            self.getCategories();
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };
    self.getItems();
    $scope.itemsOrganized = [];
    $scope.categories = [];
    // categories
    self.getCategories = function(){
        $http.get(myConfig.MY_API + '/category').then(function(data) {
            $scope.categories = data.data;
            $scope.categorizeItems($scope.edittedList.layout_id);
        });
    };

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.name.trim(),
            desc: "",
            category: $scope.newItem.category,
            crossed: false,
            position: self.items.length,
            ACL: {},
            list_id: {
                '__type': "Pointer",
                className: "lists",
                objectId: $scope.edittedList.objectId
            }
        };
        var userId = $cookies.get('userId');
        newItem.ACL[userId] = {
            read: true,
            write: true
        };

        if (!newItem.name) {
            return;
        }

        $scope.newItem.name = '';
        $scope.newItem.category = 0;

        self.itemNeedSync = true;
        self.addNewItem(newItem);
    };

    self.addNewItem = function (newItem) {
        $http({
            url: myConfig.MY_API + '/item',
            method: 'POST',
            data: newItem,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            // add generated objectId from server to the newItem
            self.items[self.items.length - 1].objectId = res.data.objectId;
            newItem.objectId = res.data.objectId;

            for(var c = 0; c < $scope.itemsOrganized.length; c++){
                if(newItem.category == $scope.itemsOrganized[c].id){
                    $scope.itemsOrganized[c].arr.push(newItem);
                    break;
                }
            }
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    $scope.deleteAll = function() {
        self.deleteCrossed();
    };

    self.deleteCrossed = function() {
        console.log(JSON.stringify($scope.crossedItems));
        $http({
            url: myConfig.MY_API + '/itemDeleteCrossed',
            method: 'DELETE',
            data: $scope.crossedItems,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function () {
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
                self.removeFromArray(item, $scope.itemsOrganized[item.category].arr);
            }
            $scope.crossedItemsNum = 0;

            self.itemNeedSync = true;
        }, function (res) {
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    $scope.editItem = function(item) {
        sharedProperties.setProperty({item: item, list: $scope.edittedList});
        $location.path('/item/edit');
    };

    $scope.crossItem = function(item){
        item.crossed = true;
        //self.removeFromArray(item, $scope.items);
        $scope.crossedItems.push(item);
        $scope.crossedItemsNum++;
        self.itemNeedSync = true;
        self.updateItem(item);
    };

    $scope.uncrossItem = function(item){
        item.crossed = false;
        self.removeFromArray(item, $scope.crossedItems);
        //$scope.items.push(item);
        $scope.crossedItemsNum--;
        self.itemNeedSync = true;
        self.updateItem(item);
    };

    self.updateItem = function(item) {
        //console.log(JSON.stringify(item));
        $http({
            url: myConfig.MY_API + '/item/' + item.objectId,
            method: 'PUT',
            data: item,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            console.log(JSON.stringify(res.data));
        }, function (res) {
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
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

    $scope.categorizeItems = function (layout_id) {
        $scope.itemsOrganized = [];
        for(var k = 0; k < $scope.layouts.length; k++) {
            if ($scope.layouts[k].objectId == layout_id) {
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
                if(self.items[j].category == $scope.itemsOrganized[k].id){
                    $scope.itemsOrganized[k].arr.push(self.items[j]);
                }
            }
        }
        //$scope.itemsOrganized = $scope.itemsOrganized;

        //console.log("ORGANIZED: " + JSON.stringify($scope.itemsOrganized));
    };



});