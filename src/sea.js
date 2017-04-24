/**
 * @author: Callebe Gomes
 * */

 /* istanbul ignore else  */
if (typeof Object.assign != 'function') {
    /* istanbul ignore next  */
    Object.assign = function(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

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

        var _private = {};
        var object_id = 0;

        var SeaModel = function (data) {
            data = data || {};

            var self = this;

            Object.defineProperty(self, '$id', { value: ++object_id, writable: false, enumerable: false, configurable: false });
            Object.defineProperty(self, '$promise', { value: undefined, writable: true, enumerable: false, configurable: false });
            Object.defineProperty(self, '$calling', { value: false, writable: true, enumerable: false, configurable: false });

            _private[self.$id] = Object.assign({}, self.$config.properties);

            if (typeof data !== 'object') {
                _private[self.$id][self.$config.identifier] = data;
            } else {
                Object.assign(_private[self.$id], data);
            }

            if (_private[self.$id][self.$config.identifier] === undefined) {
                _private[self.$id][self.$config.identifier] = 0;
            }

            for (var prop in _private[self.$id]) {
                addProperty(self, prop);
            }
        };

        SeaModel.prototype.getId = function () {
            return _private[this.$id][this.$config.identifier];
        };

        SeaModel.prototype.setId = function (value) {
            _private[this.$id][this.$config.identifier] = value;
        };

        SeaModel.prototype.get = function (prop) {
            return _private[this.$id][prop];
        };

        SeaModel.prototype.set = function (prop, value) {
            if (prop && prop in _private[this.$id]) {
                _private[this.$id][prop] = value;
            }
        };

        return SeaModel;
    }) ();


    /**
     * Sea Model Manager
     * */
    var SeaModelManager = function () {
        /** self referency to be used internaly */
        var self = this;

        /** holds the models definitions */
        var Models = {
            length: 0
        };

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
            identifier: 'id',
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
            return Object.assign({}, defaultConfig, config, _config);
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
                Object.assign(config, _config);
                return self;
            }

            return fullConfig();
        };

        /**
         *
         * */
        this.getModels = function (model) {
            return Object.assign({}, Models);
        };

        /**
         * create a new Model
         *
         * @param config {Object} - the new model configuration and definition
         *
         * @returns Class - returns the new model class
         * */
        this.newModel = function (config) {
            if (typeof config !== 'object') {
                throw 'config should be an object';
            }
            if (typeof config.name !== 'string') {
                throw 'config should define a string name attribute';
            }
            if (Models[config.name]) {
                throw 'redefining model is not allowed. ' + config.name + ' is already defined';
            }

            var NewModel = function () {
                var args = Array.prototype.slice.call(arguments);
                SeaModel.apply(this, args);
            };

            // inheriting static methods
            Object.assign(NewModel, SeaModel);

            // inheriting prototype methods
            NewModel.prototype = Object.create(SeaModel.prototype);
            NewModel.prototype.constructor = NewModel;

            // adding $config attribute
            NewModel.prototype.$config = NewModel.$config = fullConfig(config);

            Models[config.name] = NewModel;
            Models.length++;

            return NewModel;
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