/**
 * Created by sange on 17/12/15.
 */


app.controller("CategoryController", function CategoryController($scope, $http) {

    var self = this;
    $scope.texts = myTexts;
    $scope.category = [];

    self.getCategories = function(){

        $http.get(myConfig.MY_API + '/category').then(function(data) {
            $scope.category = data.data;
        });

    };

    self.getCategories();

});