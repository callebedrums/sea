/**
 * @author: Callebe Gomes
 * */

(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('angular'), require('angular-resource'));
    } else if(typeof define === 'function' && define.amd) {
        define(['angular', 'angular-resource'], factory);
    } else {
        root.SeaORM = factory(root.angular);
    }
} (this, function (angular) {

    "use strict";

    var module = angular.module('sea-module', []);

    return module;
}));