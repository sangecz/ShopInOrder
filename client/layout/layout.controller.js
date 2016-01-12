
app.controller("LayoutController", function LayoutController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    self.checkPropreties = function(){
        if(sharedProperties.getProperty() != null){
            $scope.edittedItem =  sharedProperties.getProperty().item;
            $scope.addedCategories = sharedProperties.getProperty() != null ? sharedProperties.getProperty().categories : [];

        } else {
            $location.path('/layout');
        }
    };
    self.checkPropreties();

    $scope.title = myTexts.layout.title;
    $scope.subtitle = myTexts.layout.edit;

    $scope.items = [];
    self.categoryNeedSync = false;
    self.layoutNeedSync = false;
    $scope.data = {};
    $scope.data.toggleProp = false;

    $scope.crossedItems = [];
    $scope.newItem = '';

    $scope.sortableOptions = {
        stop: function(e, ui) {
            if($scope.items.length > 0) {
                var prev = $scope.items[0];
                for (var i = 0; i < $scope.items.length; i++) {
                    if($scope.items[i] > prev) {
                        prev = $scope.items[i];
                    } else {
                        self.layoutNeedSync = true;
                    }
                }
            }
            if(self.layoutNeedSync) {
                self.updateLayoutsPositions();
            }
        },
        axis: 'y'
    };

    // layouts
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
                if(r.crossed == false) {
                    $scope.items.push(r);
                } else {
                    $scope.crossedItems.push(r);
                }
            }
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };
    self.getLayouts();

    // categories
    self.getCategories = function(){
        $http.get(myConfig.MY_API + '/category').then(function(data) {
            $scope.categories = data.data;
        });
    };
    self.getCategories();

    $scope.sortableOptionsCategory = {
        update: function(e, ui) {
            self.categoryNeedSync = true;
        },
        axis: 'y'
    };

    $scope.openItem = function(item) {
        $scope.editItem(item)
    };

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.trim(),
            desc: '',
            crossed: false,
            categories: [0],
            position: $scope.items.length,
            ACL: {}
        };
        if (!newItem.name) {
            return;
        }
        var userId = $cookies.get('userId');
        newItem.ACL[userId] = {
            read: true,
            write: true
        };

        $scope.items.push(newItem);
        $scope.newItem = '';

        self.layoutNeedSync = true;

        self.addLayout(newItem);
    };

    $scope.deleteAll = function() {
        self.deleteCrossed();
    };

    $scope.editItem = function(item) {
        // edit start
        $scope.edittedItem = item;
        $scope.edittedItem.name = item.name;
        $scope.edittedItem.desc = item.desc;

        // add category 'uncategorized' if missing
        $scope.edittedItem.categories = JSON.parse("[" + item.categories + "]");
        if($scope.edittedItem.categories.length == 0) {
            $scope.edittedItem.categories.push($scope.categories[0]);
        }

        // create categories from Ids and categories got from server
        var cat = [];
        for(var i = 0; i < $scope.edittedItem.categories.length; i++){
            for(var j = 0; j < $scope.categories.length; j++){
                if($scope.edittedItem.categories[i] == parseInt($scope.categories[j].id))   {
                    cat.push($scope.categories[j]);
                }
            }
        }

        sharedProperties.setProperty({item: item, categories: cat});
        $location.path('/layout/edit');
    };



    $scope.saveItem = function() {

        if(!(typeof $scope.edittedItem.name === 'string')) {
            myToast.showToast(myTexts.msg.emptyName, $mdToast);
            return;
        }

        var categories = [];
        for(var i = 0; i < $scope.addedCategories.length; i++){
            categories.push(parseInt($scope.addedCategories[i].id));
        }
        var layout = {
            objectId: sharedProperties.getProperty().item.objectId,
            name: $scope.edittedItem.name,
            desc: $scope.edittedItem.desc != undefined ? $scope.edittedItem.desc : '',
            categories: categories
        };

        self.updateLayout(layout, true);
    };

    $scope.crossItem = function(item){
        item.crossed = true;
        self.removeFromArray(item, $scope.items);
        $scope.crossedItems.push(item);
        self.updateLayout(item, false);
        self.layoutNeedSync = true;
    };

    $scope.uncrossItem = function(item){
        item.crossed = false;
        self.removeFromArray(item, $scope.crossedItems);
        item.position = $scope.items.length;
        $scope.items.push(item);
        self.updateLayout(item, false);
        self.layoutNeedSync = true;
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };

    $scope.addCategory = function (item) {

        if (myUtils.hasDuplicates($scope.addedCategories.concat(item))) {
            myToast.showToast(myTexts.msg.alreadyInArray, $mdToast);
            return;
        }

        var c = {
            name: item.name,
            id: item.id
        };

        $scope.addedCategories.push(c);

        self.categoryNeedSync = true;
    };

    $scope.deleteCategory = function(item){
        if(item.id != 0) {
            self.removeFromArray(item, $scope.addedCategories);
            self.categoryNeedSync = true;
        } else {
            myToast.showToast(myTexts.msg.notRemovable, $mdToast);
        }
    };

    self.updateLayoutsPositions = function(){
        // update position
        for (var i = 0; i < $scope.items.length; i++) {
            $scope.items[i].position = i;
        }

        $http({
            url: myConfig.MY_API + '/layoutUpdatePositions',
            method: 'PUT',
            data: $scope.items,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            //console.log(JSON.stringify(res));
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    self.addLayout = function (newItem) {
        $http({
            url: myConfig.MY_API + '/layout',
            method: 'POST',
            data: newItem,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function (res) {
            // add generated objectId from server to the newItem
            $scope.items[$scope.items.length - 1].objectId = res.data.objectId;
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    self.updateLayout = function(layout, edit) {
        $http({
            url: myConfig.MY_API + '/layout/' + layout.objectId,
            method: 'PUT',
            data: layout,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function () {
            if(edit){
                myToast.showToast(myTexts.msg.succSave, $mdToast);
                self.layoutNeedSync = true;
                $scope.back();
            }
        }, function (res) {
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    self.deleteCrossed = function() {
        $http({
            url: myConfig.MY_API + '/layoutDeleteCrossed',
            method: 'DELETE',
            data: $scope.crossedItems,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'token': $cookies.get('token')
            }
        }).then(function () {
            $scope.crossedItems = [];
        }, function (res) {
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };
    //--------------- NAVIGATION

    $scope.showLists = function(){
        $location.path('/list');
    };

    $scope.showLayouts = function(){
        $location.path('/layout');
    };

    $scope.sync = function(){
        self.getCategories();
        self.getLayouts();
    };

});