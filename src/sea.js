/**
 * @author: Callebe Gomes
 * */

(function (root, factory) {
    'use strict';
    /* istanbul ignore if  */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    /* istanbul ignore if  */
    } else if(typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.Sea = factory();
    }
} (this, function () {
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
        /** self referency to be used internaly */
        var self = this;

        /** $http - the XMLHttpRequest service like angular service */
        var $http;

        /** $q - the promise service like angular service */
        var $q;

        /** holds the user default config */
        var config = {};

        /** holds the global default config */
        var defaultConfig = {
            endpointPrefix: '',
            endpoint: function (name) {
                return '/' + uncapitalize.apply(name) + '/:id';
            },
            actions: {
                'get': { method: 'GET' },
                'create': { method: 'POST' },
                'update': { method: 'PUT' },
                'query': { method: 'GET', isArray: true },
                'remove': { method: 'DELETE' },
                'delete': { method: 'DELETE' }
                /** extra actions */
                // 'action-name': { method: 'METHOD', isArray: boolean, sufix: 'SUFIX|optional'}
            }
        };

        var fullConfig = function (_config) {
            _config = _config || {};
            return angular.extend({}, defaultConfig, config, _config);
        };

        /**
         * Setter and Getter for the user default config.
         *
         * When a setter, it sets the user default config.
         * When a getter, it returns the merged config between
         * user default config and global default config.
         * The user config has precedence over global config.
         *
         * @param config {Object} - optional. Setter when provided. Getter when not provided
         *
         * @returns Object - it self when a setter. config when a getter
         *
         * SeaNodelManager.config([config]);
         * */
        this.config = function (_config) {
            if (_config) {
                angular.extend(config, _config);
                return self;
            }

            return fullConfig();
        };

        /**
         * create a new Model
         *
         * @param config {Object} - the new model configuration and definition
         *
         * @returns Class - returns the new model class
         * */
        this.newModel = function (config) {
            if(typeof config !== 'object') {
                throw 'config should be an object';
            }
            if(typeof config.name !== 'string') {
                throw 'config should define a string name attribute';
            }
        };

        this.$get = ['$http', '$q', function (_$http, _$q) {
            return self;
        }];
    };

    return {
        ModelManager: SeaModelManager,
        Model: SeaModel
    };
}));