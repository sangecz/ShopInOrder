
app.controller("ListController", function ListController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.title = myTexts.list.title;
    $scope.crossedItems = [];
    $scope.newItem = '';
    self.listNeedSync = false;
    // lists
    $scope.items = [];

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
                self.updateListsPositions();
            }
        },
        axis: 'y'
    };


    self.getLists = function(){
        $http({
            url: myConfig.MY_API + '/list',
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
    self.getLists();

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.trim(),
            desc: '',
            count: 0,
            crossed: false,
            position: $scope.items.length,
            ACL: {},
            layout_id: null
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

        self.listNeedSync = true;

        self.addList(newItem);
    };

    $scope.deleteAll = function() {
        self.deleteCrossed();
    };

    $scope.editItem = function(item) {
        sharedProperties.setProperty({list: item});
        $location.path('/list/edit');
    };

    $scope.crossItem = function(item){
        item.crossed = true;
        self.removeFromArray(item, $scope.items);
        $scope.crossedItems.push(item);
        self.updateList(item);
        self.listNeedSync = true;
    };

    $scope.uncrossItem = function(item){
        item.crossed = false;
        self.removeFromArray(item, $scope.crossedItems);
        $scope.items.push(item);
        self.updateList(item);
        self.listNeedSync = true;
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };

    self.updateListsPositions = function(){
        // update position
        for (var i = 0; i < $scope.items.length; i++) {
            $scope.items[i].position = i;
        }

        $http({
            url: myConfig.MY_API + '/listUpdatePositions',
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

    self.updateListsPositions = function(){
        // update position
        for (var i = 0; i < $scope.items.length; i++) {
            $scope.items[i].position = i;
        }

        $http({
            url: myConfig.MY_API + '/listUpdatePositions',
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

    self.addList = function (newItem) {
        $http({
            url: myConfig.MY_API + '/list',
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
            console.log(JSON.stringify(res.data));
        }, function (res) {
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };
    self.deleteCrossed = function() {
        console.log(JSON.stringify($scope.crossedItems));
        $http({
            url: myConfig.MY_API + '/listDeleteCrossed',
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
        //self.getLists();
        //self.getLayouts();
    };
});