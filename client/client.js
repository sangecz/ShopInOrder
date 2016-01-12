/**
 * Created by sange on 17/12/15.
 */

'use strict';

var app = angular.module("sio", [
    'ngResource',
    'ngRoute',
    'ui.sortable',
    'ngMaterial',
    'ngCookies',
    'ngAnimate'
    ])
    .factory('UserService', [function() {
        return {
            isLogged: false,
            token: ''
        };
    }])
    .service('sharedProperties', function () {
        var property = null;

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
    })
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
                controller: 'EditListController'
            })
            .when('/layout', {
                templateUrl: 'layout/layout.html',
                controller: 'LayoutController'
            })
            .when('/layout/edit', {
                templateUrl: 'layout/edit.layout.html',
                controller: 'LayoutController'
            })
            .when('/item/edit', {
                templateUrl: 'item/edit.item.html',
                controller: 'EditItemController'
            })
            .when('/login', {
                templateUrl: 'auth/login.html',
                controller: 'AuthController'
            })
            .when('/register', {
                templateUrl: 'auth/register.html',
                controller: 'AuthController'
            })
            .otherwise({
                redirectTo: '/'
            });

        //$locationProvider.html5Mode(true);
        //$httpProvider.interceptors.push('authInterceptor');
    })
    .run( function($rootScope, UserService, $location, $cookies, $window, $route) {
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if ( $cookies.get('token') === undefined ) {
                // no logged user, we should be going to #login
                if ( next.templateUrl == "/login.html" ) {
                    // already going to #login, no redirect needed
                } else {
                    // not going to #login, we should redirect now
                    $location.path( "/login" );
                }
            }
            //$rootScope.slide = '';
            ////event button to move backward
            $rootScope.back = function() {
                //$rootScope.slide = 'slide-right';
                $window.history.back();
            };

            $rootScope.logout = function(){
                $cookies.remove('token');
                $cookies.remove('userId');
                $location.path('/');
            };

            $rootScope.projectURL = myConfig.projectURL;
            $rootScope.texts = myTexts;
            ////event button item list to move forward
            //$rootScope.next = function() {
            //    $rootScope.slide = 'slide-left';
            //};
        });
    });
