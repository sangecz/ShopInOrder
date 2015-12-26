/**
 * Created by sange on 17/12/15.
 */


app.controller("EditItemController", function EditItemController($scope, $location, $http, sharedProperties, $mdToast) {

    var self = this;

    self.checkProperties = function(){
        if(sharedProperties.getProperty() != null
            && sharedProperties.getProperty().list !== undefined
            && sharedProperties.getProperty().item !== undefined) {

            $scope.edittedItem = sharedProperties.getProperty().item;
            $scope.subtitle = sharedProperties.getProperty().list.name;
            $scope.subsubtitle = sharedProperties.getProperty().item.name;
        } else {
            $location.path('/item');
        }
    };
    self.checkProperties();

    $scope.title = myTexts.item.title;

    $scope.crossedItems = [];
    $scope.items = [];
    $scope.categories = [];
    $scope.newItem = '';
    $scope.texts = myTexts;
    self.itemNeedSync = false;

    // categories
    self.getCategories = function(){
        $http.get(myConfig.MY_API + '/category').then(function(data) {
            $scope.categories = data.data;
        });
    };
    self.getCategories();

    $scope.sortableOptions = {
        update: function(e, ui) {
            self.itemNeedSync = true;
        },
        axis: 'y'
    };

    $scope.editItem = function(item) {
        sharedProperties.setProperty({item: item});
        $location.path('/item/edit');
    };

    $scope.saveItem = function() {
        if(!(typeof $scope.edittedItem.name === 'string')) {
            myToast.showToast(myTexts.msg.emptyName, $mdToast);
            return;
        }
        var item = {
            id: sharedProperties.getProperty().item.id,
            name: $scope.edittedItem.name,
            desc: $scope.edittedItem.desc != undefined ? $scope.edittedItem.desc : '',
            categoryId: $scope.edittedItem.categoryId == undefined ? 0 : $scope.edittedItem.categoryId
        };

        $http({
            url: myConfig.MY_API + '/item/' + item.id,
            method: 'PUT',
            data: {
                item: item
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function () {
            myToast.showToast(myTexts.msg.succSave, $mdToast);
            self.itemNeedSync = true;
            $scope.back();
        }, function(res){
            myToast.showToast(myTexts.msg.httpErr + ' msg: ' + res.data.err, $mdToast);
        });
    };

    //--------------- NAVIGATION
    $scope.saveItem = function() {

        if(!(typeof $scope.edittedItem.name === 'string')) {
            myToast.showToast(myTexts.msg.emptyName, $mdToast);
            return;
        }

        // TODO
        console.log('save item');
    };

});