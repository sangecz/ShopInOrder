
app.controller("LayoutController", function LayoutController($scope, $location, sharedProperties, $http, $mdToast, $cookies) {
    var self = this;

    $scope.edittedItem = sharedProperties.getProperty() != null ? sharedProperties.getProperty().item : $location.path('/layout');

    $scope.title = myTexts.layout.title;
    $scope.subtitle = myTexts.layout.edit;

    $scope.items = [];
    $scope.addedCategories = sharedProperties.getProperty() != null ? sharedProperties.getProperty().categories : [];
    self.categoryOrderChanged = false;
    self.itemOrderChanged = false;

    // layouts
    self.getLayouts = function(){
        $http.get(myConfig.MY_API + '/layout').then(function(data) {
            $scope.items = data.data;
            var x = {items: $scope.items};
        });
    };
    self.getLayouts();

    // categories
    self.getCategories = function(){
        $http.get(myConfig.MY_API + '/category').then(function(data) {
            $scope.categories = data.data;
            var x = {items: $scope.categories};
            myCache.save('categories', x, $cookies);
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
            self.itemOrderChanged = true;
        },
        axis: 'y'
    };

    $scope.sortableOptionsCategory = {
        update: function(e, ui) {
            self.categoryOrderChanged = true;
        },
        axis: 'y'
    };

    $scope.openItem = function(item) {
        $scope.editItem(item)
    };

    $scope.addItem = function() {

        var newItem = {
            name: $scope.newItem.trim(),
            completed: false,
            created: new Date(),
            count: 0
        };
        //
        if (!newItem.name) {
            return;
        }

        $scope.items.push(newItem);
        $scope.newItem = '';

        self.itemOrderChanged = true;
    };

    $scope.deleteAll = function() {
        $scope.crossedItems = [];
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
            self.showToast(myTexts.msg.emptyName);
            return;
        }
        var layout = {
            id: sharedProperties.getProperty().item.id,
            name: $scope.edittedItem.name,
            desc: $scope.edittedItem.desc != undefined ? $scope.edittedItem.desc : '',
            location: $scope.edittedItem.location != undefined ? $scope.edittedItem.location : '',
            categories: $scope.addedCategories
        };

        console.log(JSON.stringify(layout));

        $http({
            url: myConfig.MY_API + '/layout/' + layout.id,
            method: 'PUT',
            data: {
                item: layout
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function () {
            self.showToast(myTexts.msg.succSave);
            $scope.back();
        }, function(res){
            self.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err);
        });
    };

    $scope.crossItem = function(item){
        //item.crossed = true;

        self.removeFromArray(item, $scope.items);

        $scope.crossedItems.push(item);
    };

    $scope.uncrossItem = function(item){
        //item.crossed = false;

        self.removeFromArray(item, $scope.crossedItems);
        $scope.items.push(item);
    };

    self.removeFromArray = function(item, arr){
        var index = arr.indexOf(item);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    };

    $scope.addCategory = function (item) {

        if (self.hasDuplicates($scope.addedCategories.concat(item))) {
            self.showToast(myTexts.msg.alreadyInArray);
            return;
        }

        var c = {
            name: item.name,
            id: item.id
        };

        $scope.addedCategories.push(c);

        self.categoryOrderChanged = true;
    };

    $scope.deleteCategory = function(item){
        console.log(JSON.stringify(item));
        if(item.id != 0) {
            self.removeFromArray(item, $scope.addedCategories);
        } else {
            self.showToast(myTexts.msg.notRemovable);
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
    //--------------- TOAST
    var last = {
        bottom: false,
        top: true,
        left: false,
        right: true
    };
    $scope.toastPosition = angular.extend({},last);
    $scope.getToastPosition = function() {
        sanitizePosition();
        return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
    };
    function sanitizePosition() {
        var current = $scope.toastPosition;
        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;
        last = angular.extend({},current);
    }

    self.showToast = function(msg){
        $mdToast.show(
            $mdToast.simple()
                .textContent(msg)
                .position($scope.getToastPosition())
                .hideDelay(2000)
        );
    };

    self.hasDuplicates = function( A ) {
        var i, j, n;
        n=A.length;
        // to ensure the fewest possible comparisons
        for (i=0; i<n; i++) {                    // outer loop uses each item i at 0 through n
            for (j=i+1; j<n; j++) {              // inner loop only compares items j at i+1 to n
                if (A[i].id==A[j].id) return true;
            }	}
        return false;
    };


});