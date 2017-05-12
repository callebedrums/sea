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

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
/* istanbul ignore if  */
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function forEach( callback, thisArg ) {

    var T, k;

    if ( this == null ) {
      throw new TypeError( "this is null or not defined" );
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ( {}.toString.call(callback) !== "[object Function]" ) {
      throw new TypeError( callback + " is not a function" );
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if ( thisArg ) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while( k < len ) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if ( Object.prototype.hasOwnProperty.call(O, k) ) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call( T, kValue, k, O );
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

(function (root, factory) {
    'use strict';
    /* istanbul ignore next  */
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

    /** $http - the XMLHttpRequest service like angular service */
    var $http;

    /** $q - the promise service like angular service */
    var $q;

    /** $rootScope - the event api that implements $broadcast method */
    var $rootScope;

    /** SeaModelManagerInstance - the singleton instance of SeaModelManager*/
    var SeaModelManagerInstance;

    var SeaResource = (function () {

        var actionMethod = function (self, config) {
            return function (data, params) {
                if (config.isArray) {
                    params = data;
                    data = null;
                }

                return self.request(config.method, data, params, config.sufix);
            };
        };

        var SeaResource = function (config) {
            this.$config = config;
            this.$cache = {};

            for (var action in config.actions) {
                 /* istanbul ignore else  */
                if (config.actions.hasOwnProperty(action)) {
                    this[action] = actionMethod(this, config.actions[action]);
                }
            }

        };

        SeaResource.prototype.getURL = function (data, sufix) {
            data = data || {};
            sufix = sufix || '';

            var config = this.$config;
            var prefix = config.endpointPrefix || '';
            var endpoint = config.endpoint || '';

            if (typeof config.endpoint === 'function') {
                endpoint = config.endpoint(config.name);
            } else if(typeof config.endpoint === 'string') {
                endpoint = config.endpoint;
            }

            for (var param in data) {
                /* istanbul ignore else  */
                if (data.hasOwnProperty(param)) {
                    endpoint = endpoint.replace('<' + param + '>', data[param]);
                }
            }

            endpoint = endpoint.replace(/\/<[\w-]+>/g, '');

            return prefix + endpoint + sufix;
        };

        SeaResource.prototype.request = function (method, data, params, sufix) {
            var self = this;
            if (self.$cache[arguments]) {
                return self.$cache[arguments];
            }

            var url = self.getURL(data, sufix);

            method = method.toUpperCase().trim();

            self.$cache[arguments] = $http({
                method: method,
                url: url,
                params: params,
                data: data
            })

            self.$cache[arguments].finally(function () {
                delete self.$cache[arguments];
            });

            return self.$cache[arguments];
        };

        return SeaResource;
    }) ();

    /**
     * Relationship interface
     * */
    var Relationship = (function () {
        var Relationship = function (instance, model) {
            this.$object = null;
            this.$isLoaded = false;

            if (instance instanceof SeaModel) {
                this.$instance = instance;
            } else {
                throw "instance is not a Seamodel";
            }

            if (SeaModelManager.instance().getModels()[model]) {
                this.$model = SeaModelManager.instance().getModels()[model];
            } else if (model && model.prototype && model.prototype instanceof SeaModel) {
                this.$model = model;
            } else {
                throw "Unknow model parameter"
            }
        }

        /**
         * All Relationship objects shal have the get, set and toJS methods
         **/
        Relationship.prototype.get = function () { 
            return this.$object;
        }

        Relationship.prototype.set = function (v) {
            this.$object = v;
        };

        Relationship.prototype.toJS = function () {
            return null;
        };

        Relationship.builder = function (model) {
            var Model = this;
            return function (instance) {
                return new Model(instance, model);
            };
        };
        
        return Relationship
    }) ();

    var BelongsTo = (function () {
        var BelongsTo = function (instance, model) {
            Relationship.call(this, instance, model);
        };
        
        Object.assign(BelongsTo, Relationship);
        BelongsTo.prototype = Object.create(Relationship.prototype);
        BelongsTo.prototype.constructor = BelongsTo;

        BelongsTo.prototype.get = function () {
            if (this.$object && !this.$object.$isNew && !this.$isLoaded) {
                this.$object.load();
                this.$isLoaded = true;
            }

            return this.$object;
        };

        BelongsTo.prototype.set = function (v) {
            if (v instanceof this.$model) {
                this.$object = v;
                this.$isLoaded = true;
            } else if (v && (!this.$object || this.$object.getId() !== v)) {
                this.$object = new this.$model();
                this.$object.setId(v);
                this.$isLoaded = false;
            }
        };

        BelongsTo.prototype.toJS = function () {
            if (this.$object) {
                return this.$object.getId();
            }

            return null;
        };
        
        return BelongsTo;
    }) ();

    var HasMany = (function () {
        var HasMany = function (instance, model, related_field) {
            Relationship.call(this, instance, model);
        };
        
        Object.assign(HasMany, Relationship);
        HasMany.prototype = Object.create(Relationship.prototype);
        HasMany.prototype.constructor = HasMany;

        HasMany.prototype.get = function () {
        };

        HasMany.prototype.set = function (v) {
        };

        HasMany.prototype.toJS = function () {
        };

        HasMany.builder = function (model, related_field) {
            var Model = this;
            return function (instance) {
                return new Model(instance, model, related_field);
            };
        };
        
        return HasMany;
    }) ();

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

            if (_private[self.$id][self.$config.identifier] === undefined) {
                _private[self.$id][self.$config.identifier] = 0;
            }

            for (var prop in _private[self.$id]) {
                while (typeof _private[self.$id][prop] === 'function') {
                    _private[self.$id][prop] = _private[self.$id][prop](this);
                }
            }

            if (typeof data !== 'object') {
                self.setId(data);
            } else {
                self.set(data);
            }

            for (var prop in _private[self.$id]) {
                addProperty(self, prop);
            }
        };

        Object.defineProperty(SeaModel.prototype, '$isNew', { get: function () { return !this.getId(); }, enumerable: false, configurable: false });

        SeaModel.prototype.toJS = function () {
            var self = this;
            var obj = {};

            for (var attr in _private[self.$id]) {
                /* istanbul ignore else  */
                if (_private[self.$id].hasOwnProperty(attr)) {
                    obj[attr] = _private[self.$id][attr];
                }

                if (obj[attr] instanceof Relationship) {
                    obj[attr] = obj[attr].toJS();
                }
            }

            return obj;
        };

        SeaModel.prototype.getId = function () {
            return _private[this.$id][this.$config.identifier];
        };

        SeaModel.prototype.setId = function (value) {
            _private[this.$id][this.$config.identifier] = value;
        };

        SeaModel.prototype.get = function (prop) {
            if (prop === this.$config.identifier) {
                return this.getId();
            }

            if (typeof prop === "string") {
                if (_private[this.$id][prop] instanceof Relationship) {
                    return _private[this.$id][prop].get();
                }
                return _private[this.$id][prop];
            }

            return this.toJS();
        };

        SeaModel.prototype.set = function (prop, value) {
            while (typeof value === "function") {
                value = value(this);
            }

            if (prop && prop in _private[this.$id]) {
                if (_private[this.$id][prop] instanceof Relationship) {
                    _private[this.$id][prop].set(value);
                } else {
                    _private[this.$id][prop] = value;
                }
            } else if (typeof prop === 'object') {
                var obj = prop;
                for (prop in obj) {
                    /* istanbul ignore else  */
                    if (obj.hasOwnProperty(prop)) {
                        this.set(prop, obj[prop]);
                    }
                }
            }
        };

        SeaModel.prototype.load = function () {
            var self = this;

            var deferred = $q.defer();

            self.$resource.get(self.toJS())
            .then(function (response) {
                self.set(response.data);
                deferred.resolve(self, response);
                $rootScope.$broadcast('SeaModel.' + self.$config.name + '.load-success', self);
            })
            .catch(function (response) {
                deferred.reject(self, response);
                $rootScope.$broadcast('SeaModel.' + self.$config.name + '.load-error', self);
            })
            .finally(function () {
                self.$calling = false;
            });

            self.$calling = true;
            $rootScope.$broadcast('SeaModel.' + self.$config.name + '.load-started', self);

            return self.$promise = deferred.promise;
        };

        SeaModel.prototype.save = function () {
            var self = this;
            var method = 'update';
            var obj = self.toJS();

            var deferred = $q.defer();

            if (self.$isNew) {
                delete obj[self.$config.identifier];
                method = 'create';
            }

            self.$resource[method](obj)
            .then(function (response) {
                self.set(response.data);
                deferred.resolve(self, response);
                $rootScope.$broadcast('SeaModel.' + self.$config.name + '.save-success', self);
            })
            .catch(function (response) {
                deferred.reject(self, response);
                $rootScope.$broadcast('SeaModel.' + self.$config.name + '.save-error', self);
            })
            .finally(function () {
                self.$calling = false;
            });

            self.$calling = true;
            $rootScope.$broadcast('SeaModel.' + self.$config.name + '.save-started', self);

            return self.$promise = deferred.promise;
        };

        SeaModel.prototype.remove = function () {
            var self = this;
            var obj = self.toJS();

            if(!self.$isNew) {
                var deferred = $q.defer();

                self.$resource.remove(obj)
                .then(function (response) {
                    deferred.resolve(self, response);
                    $rootScope.$broadcast('SeaModel.' + self.$config.name + '.remove-success', self);
                })
                .catch(function (response) {
                    deferred.reject(self, response);
                    $rootScope.$broadcast('SeaModel.' + self.$config.name + '.remove-error', self);
                })
                .finally(function () {
                    self.$calling = false;
                });

                self.$calling = true;
                $rootScope.$broadcast('SeaModel.' + self.$config.name + '.remove-started', self);

                return self.$promise = deferred.promise;
            }
        };

        SeaModel.query = function (params) {
            var Model = this;
            params = params || {};

            var deferred = $q.defer();
            var result = [];

            Model.$resource.query(params)
            .then(function (response) {
                var data = response.data || [];
                data.forEach(function (d) {
                    result.push(new Model(d));
                });
                deferred.resolve(result, response);
                $rootScope.$broadcast('SeaModel.' + Model.$config.name + '.query-success', result);
            })
            .catch(function (response) {
                deferred.reject(result, response);
                $rootScope.$broadcast('SeaModel.' + Model.$config.name + '.query-error', result);
            })
            .finally(function () {
                result.$calling = false;
            });

            result.$promise = deferred.promise;
            result.$calling = true;
            
            $rootScope.$broadcast('SeaModel.' + Model.$config.name + '.query-started', result);

            return result;
        };
        
        SeaModel.get = function (id) {
            var Model = this;

            if (!id) {
                throw 'id argument is required';
            }

            var instance = new Model();
            instance[Model.$config.identifier] = id;
            instance.load();
            return instance;
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

        /** holds the user default config */
        var config = {};

        /** holds the global default config */
        var defaultConfig = {
            endpointPrefix: '',
            endpoint: function (name) {
                return '/' + uncapitalize.apply(name) + '/<id>';
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

            // adding $resource attribute
            NewModel.prototype.$resource = NewModel.$resource = new SeaResource(NewModel.$config);

            Models[config.name] = NewModel;
            Models.length++;

            return NewModel;
        };

        this.$get = ['$rootScope', '$http', '$q', function (_$rootScope, _$http, _$q) {
            $rootScope              = _$rootScope;
            $http                   = _$http;
            $q                      = _$q;
            SeaModelManagerInstance = self;
            return self;
        }];
    };

    SeaModelManager.instance = function () {
        return SeaModelManagerInstance;
    };

    return {
        ModelManager: SeaModelManager,
        Model: SeaModel,
        Resource: SeaResource,
        Relationship: Relationship,
        BelongsTo: BelongsTo,
        HasMany: HasMany
    };
}));