/**
 * @author: Callebe Gomes
 * */

(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('angular'));
    } else if(typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else {
        root.SeaORM = factory(root.angular);
    }
} (this, function (angular) {
    "use strict";

    var uncapitalize = function () {
        return this.charAt(0).toLowerCase() + this.slice(1);
    };

    var addProperty = function (obj, name) {
        Object.defineProperty(obj, name, {
            get: function () {
                return obj.get(name);
            },
            set: function (value) {
                obj.set(name, value);
            },
            enumerable: true,
            configurable: false
        });
    };

    /**
     * Sea Model Class
     * */
    var SeaModel = (function () {

        var SeaModel = function () {

        };

        return SeaModel;
    });


    /**
     * Sea Model Manager
     * */
    var SeaModelManager = function () {
        var self = this;
        var config = {};
        var defaultConfig = {
            endpointPrefix: '',
            endpoint: function (name) {
                return '/' + uncapitalize.apply(name) + '/:id';
            }
        };

        var fullConfig = function (_config) {
            _config = _config || {};
            return angular.extend({}, defaultConfig, config, _config);
        };

        this.config = function (_config) {
            if (_config) {
                angular.extend(config, _config);
                return self;
            }

            return fullConfig();
        };

        this.$get = [function () {
            return self;
        }];
    };

    var module = angular.module('sea', []);

    module.provider('SeaModelManager', SeaModelManager);

    return module;
}));