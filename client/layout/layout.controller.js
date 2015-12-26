
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

    // layouts
    self.getLayouts = function(){
        $http.get(myConfig.MY_API + '/layout').then(function(data) {
            $scope.items = data.data;
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

    $scope.data = {};
    $scope.data.toggleProp = false;

    $scope.crossedItems = [];
    $scope.newItem = '';
    $scope.texts = myTexts;

    $scope.sortableOptions = {
        update: function(e, ui) {
            self.layoutNeedSync = true;
        },
        axis: 'y'
    };

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
            created: new Date()
        };
        //
        if (!newItem.name) {
            return;
        }

        $scope.items.push(newItem);
        $scope.newItem = '';

        self.layoutNeedSync = true;
    };

    $scope.deleteAll = function() {
        $scope.crossedItems = [];
        self.layoutNeedSync = true;
    };

    $scope.editItem = function(item) {
        // edit start
        $scope.edittedItem = item;
        $scope.edittedItem.name = item.name;
        $scope.edittedItem.desc = item.desc;
        $scope.edittedItem.location = item.location;

        // ad category 'uncategorized' if missing
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
        var layout = {
            id: sharedProperties.getProperty().item.id,
            name: $scope.edittedItem.name,
            desc: $scope.edittedItem.desc != undefined ? $scope.edittedItem.desc : '',
            location: $scope.edittedItem.location != undefined ? $scope.edittedItem.location : '',
            categories: $scope.addedCategories
        };

        $http({
            url: myConfig.MY_API + '/layout/' + layout.id,
            method: 'PUT',
            data: {
                item: layout
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function () {
            myToast.showToast(myTexts.msg.succSave, $mdToast);
            self.layoutNeedSync = true;
            $scope.back();
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    $scope.crossItem = function(item){
        item.crossed = true;
        self.removeFromArray(item, $scope.items);
        $scope.crossedItems.push(item);
        self.layoutNeedSync = true;
    };

    $scope.uncrossItem = function(item){
        item.crossed = false;
        self.removeFromArray(item, $scope.crossedItems);
        $scope.items.push(item);
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
        console.log(JSON.stringify(item));
        if(item.id != 0) {
            self.removeFromArray(item, $scope.addedCategories);
            self.categoryNeedSync = true;
        } else {
            myToast.showToast(myTexts.msg.notRemovable, $mdToast);
        }
    };
    //--------------- NAVIGATION

    //$scope.back = function (){
    //    $location.path('/layout');
    //    $scope.edittedItem = {};
    //};

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