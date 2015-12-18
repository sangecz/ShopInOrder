/**
 * Created by sange on 17/12/15.
 */

'use strict';

var app = angular.module("sio", [
    'ngResource',
    'ngRoute',
    'ui.sortable'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'list/list.html',
                controller: 'ListController'
            })
            .when('/list', {
                templateUrl: 'list/list.html',
                controller: 'ListController'
            })
            .when('/list/edit', {
                templateUrl: 'list/edit.list.html',
                controller: 'ListController'
            })
            .when('/item', {
                templateUrl: 'item/item.html',
                controller: 'ItemController'
            })
            .when('/item/edit', {
                templateUrl: 'item/edit.item.html',
                controller: 'ItemController'
            })
            .when('/category', {
                templateUrl: 'category/category.html',
                controller: 'CategoryController'
            })
            .when('/layout', {
                templateUrl: 'layout/category.html',
                controller: 'LayoutController'
            })
            .when('/layout/edit', {
                templateUrl: 'layout/edit.layout.html',
                controller: 'LayoutController'
            })
            .otherwise({
                redirectTo: '/'
            });

        //$locationProvider.html5Mode(true);
        //$httpProvider.interceptors.push('authInterceptor');
    });