/**
 * @author: Callebe Gomes
 * */


String.prototype.uncapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

var SeaORM = (function (angular) {
    "use strict";
    var Models = {},
    
    addProperty = function (obj, name) {
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
    },
        
    SeaModel = (function () {
        var _private = {},
        object_id = 1;
    
        var SeaModel = function (declaration, resource, data) {
            var self = this;
            
            Object.defineProperty(self, '_id', { value: object_id++, writable: false, enumerable: false, configurable: false });
            Object.defineProperty(self, '_resource', { value: resource, writable: false, enumerable: false, configurable: false });
            
            _private[this._id] = {
                fields: angular.extend({ id:0 }, declaration.fields),
                resourceObject: null
            };
            
            Object.defineProperty(self, 'isNew', {
                get: function () { return _private[self._id].fields.id == 0; }, enumerable: false, configurable: false
            });

            Object.defineProperty(self, 'isLoaded', {
                get: function () { return _private[self._id].fields.id != 0 && _private[self._id].resourceObject !== null; }, enumerable: false, configurable: false
            });
            
            if(typeof data === 'object'){
                self.setFields(data);
            } else if(typeof data !== 'function' && data) {
                self.set('id', data);
            }
            
            for (var field in _private[this._id].fields) {
                while(typeof _private[this._id].fields[field] == 'function'){
                    _private[this._id].fields[field] = _private[this._id].fields[field](this);
                    if (typeof data === 'object' && data[field]) {
                        self.set(field, data[field]);
                    }
                }
                addProperty(this, field);
            }
        };

        SeaModel.prototype.getId = function () {
            return _private[this._id].fields['id'];
        };

        SeaModel.prototype.setId = function (id) {
            _private[this._id].fields['id'] = id
            if(this.isLoaded) _private[this._id].resourceObject['id'] = id;
        };
        
        SeaModel.prototype.toJS = function () {
            var js = {};
            for(var field in _private[this._id].fields) {
                if (_private[this._id].fields[field] != null && _private[this._id].fields[field] instanceof Relational) {
                    js[field] = _private[this._id].fields[field].toJS();
                } else {
                    js[field] = _private[this._id].fields[field];
                }
            }
            return js;
        };
        
        SeaModel.prototype.toJSON = function () {
            return JSON.stringify(this.toJS());
        };
        
        SeaModel.prototype.get = function (field, success_cb, error_cb) {
            if (field === 'id') {
                return this.getId();
            }

            if (typeof field === 'string' && field in _private[this._id].fields) {
                if (_private[this._id].fields[field] != null && _private[this._id].fields[field] instanceof Relational) {
                    return _private[this._id].fields[field].get(success_cb, error_cb);
                }
                return _private[this._id].fields[field];
            }
            return angular.copy(_private[this._id].fields);
        };
        
        SeaModel.prototype.set = function (field, value) {
            if (field === 'id') {
                this.setId(value);
            }

            if(typeof field === 'string' && field in _private[this._id].fields) {
                if (_private[this._id].fields[field] != null && _private[this._id].fields[field] instanceof Relational) {
                    _private[this._id].fields[field].set(value);
                    if(this.isLoaded) _private[this._id].resourceObject[field] = _private[this._id].fields[field].toJS();
                } else if (typeof _private[this._id].fields[field] !== 'function') {
                    _private[this._id].fields[field] = value;
                    if(this.isLoaded) _private[this._id].resourceObject[field] = value;
                }
            } else if (typeof field === 'object') {
                this.setFields(field);
            }
        };

        SeaModel.prototype.setFields = function (obj) {
            if(typeof obj === 'object') {
                for(var field in obj) {
                    this.set(field, obj[field]);
                }
            }
        };
        
        SeaModel.prototype.load = function (success_cb, error_cb) {
            var self = this;
            _private[this._id].resourceObject = this._resource.get( { id: this.id }, function (value, responseHeaders) {
                self.set(value);

                if(typeof success_cb === 'function'){
                    success_cb(self, responseHeaders);
                }
            }, function (httpResponse) {
                if(typeof error_cb === 'function') {
                    error_cb(httpResponse);
                }
            });
        };
        
        SeaModel.prototype.save = function (success_cb, error_cb) {
            var self = this;
            if(!this.isLoaded) {
                var js = this.toJS();
                if(this.isNew){
                    delete js.id;
                }
                _private[this._id].resourceObject = new this._resource(js);
            }

            var _success_cb = function (value, responseHeaders) {
                self.set(_private[self._id].resourceObject);

                if(typeof success_cb === 'function') {
                    success_cb(self, responseHeaders);
                }
            },
            _error_cb = function (httpResponse) {
                if(typeof error_cb === 'function') {
                    error_cb(httpResponse);
                }
            };

            if(this.isNew) {
                _private[this._id].resourceObject.$create(_success_cb, _error_cb);
            } else {
                _private[this._id].resourceObject.$update(_success_cb, _error_cb);
            }

            return self;
        };
        
        SeaModel.prototype.remove = function (success_cb, error_cb) {
            var self = this;
            if(!this.isNew) {
                if(!this.isLoaded){
                    _private[this._id].resourceObject = new this._resource(this.toJS());
                }

                _private[this._id].resourceObject.$remove(function (value, responseHeaders) {
                    if(typeof success_cb === 'function') {
                        success_cb(self, responseHeaders);
                    }
                }, function (httpResponse) {
                    if(typeof error_cb === 'function') {
                        error_cb(httpResponse);
                    }
                });
            }
        };

        return SeaModel;
    }()),
        
    Relational = (function () {
        var Relational = function (model, instance) {
            this.object = null;
            this.model = model;
            this.instance = instance;
        }

        /**
         * All Relational objects shal have the get, set and toJS methods
         **/
        Relational.prototype.get = function (success_cb, error_cb) { }
        Relational.prototype.set = function (v) { };
        Relational.prototype.toJS = function () { };
        
        return Relational
    }()),
    
    BelongsTo = (function () {
        var BelongsTo = function (model, instance) {
            Relational.call(this, model, instance);
        };

        BelongsTo.prototype = Object.create(Relational.prototype);
        BelongsTo.prototype.constructor = BelongsTo;
        
        BelongsTo.prototype.toJS = function () {
            Relational.prototype.toJS.call(this);

            if(!this.object) return null;
            return this.object.id;
        };
        
        BelongsTo.prototype.get = function (success_cb, error_cb) {
            Relational.prototype.get.call(this, success_cb, error_cb);

            if(this.object && !this.object.isNew && !this.object.isLoaded) {
                this.object.load(success_cb, error_cb);
            } else {
                if (typeof success_cb === 'function') success_cb(this.object);
            }
            return this.object;
        };

        BelongsTo.prototype.set = function (value) {
            Relational.prototype.set.call(this, value);

            if (value === null || value instanceof this.model) {
                this.object = value;
            } else if (typeof value !== 'functoin' && value && (this.object == null || this.object.id != value)) {
                this.object = new this.model({id: value});
            }
        };
        
        return BelongsTo;
    }()),
    
    HasMany = (function () {
        var HasMany = function (model, instance, related_field) {
            Relational.call(this, model, instance);
            this.related_field = related_field;
            this.isLoaded = false;
            this.loading_success_cb = [];
            this.loading_error_cb = [];
        };

        HasMany.prototype = Object.create(Relational.prototype);
        HasMany.prototype.constructor = HasMany;

        HasMany.prototype.execute_success_cb = function (value, responseHeaders) {
            for(var i = 0; i < this.loading_success_cb.length; i++) {
                this.loading_success_cb[i](value, responseHeaders);
            }
            this.loading_success_cb = [];
            this.loading_error_cb = [];
        };
        HasMany.prototype.execute_error_cb = function (httpResponse) {
            for(var i = 0; i < this.loading_error_cb.length; i++) {
                this.loading_error_cb[i](httpResponse);
            }
            this.loading_success_cb = [];
            this.loading_error_cb = [];
        };
        HasMany.prototype.register_callbacks = function (success_cb, error_cb) {
            if(typeof success_cb === 'function') {
                this.loading_success_cb.push(success_cb);
            }
            if(typeof error_cb === 'function') {
                this.loading_error_cb.push(error_cb);
            }
        };
        
        HasMany.prototype.toJS = function () {
            Relational.prototype.toJS.call(this);

            if(!this.object) return null;
            var ids = [];
            for(var i = 0; i < this.object.length; i++) {
                ids.push(this.object[i].id);
            }
            return ids;
        };

        HasMany.prototype.has_object = function (id) {
            if(!this.object) return false;

            for(var i = 0; i < this.object.length; i++) {
                if(this.object[i].id == id) return true;
            }

            return false;
        };
        
        HasMany.prototype.get = function (success_cb, error_cb) {
            Relational.prototype.get.call(this, success_cb, error_cb);

            var self = this;
            if(!self.object) {
                var params = {};
                params[self.related_field] = self.instance.id;
                self.object = self.model.query(params, function (value, responseHeaders) {
                    self.isLoaded = true;
                    self.execute_success_cb(value, responseHeaders)
                }, function (httpResponse) {
                    self.execute_error_cb(httpResponse);
                });
            }
            
            self.register_callbacks(success_cb, error_cb);

            if(self.isLoaded) {
                self.execute_success_cb(self.object);
            }
            
            return self.object;
        };

        HasMany.prototype.set = function (value) {
            Relational.prototype.set.call(this, value);

            if (value instanceof this.model) {
                if(!this.object) {
                    this.object = [];
                    this.isLoaded = true;
                }
                if (!this.has_object(value.id)) {
                    this.object.push(value);
                }

            } else if (value instanceof Array) {
                var new_object = [];
                var added = {};
                this.object = new_object;
                for(var i = 0; i < value.length; i++) {
                    if(value[i] instanceof this.model && !added[value[i].id]) {
                        new_object.push(value[i]);
                        added[value[i].id] = true;
                    }
                }
                this.isLoaded = true;

            } else if (value === null) {
                this.object = null;
                this.isLoaded = false;
            } else if (typeof value !== 'function' && value) {
                if(!this.object) {
                    this.object = [];
                    this.isLoaded = true;
                }
                if (!this.has_object(value)) {
                    this.object.push(new this.model({id: value}));
                }

            }
        };
        
        return HasMany;
    }()),

    SeaORM = function SeaORM($resource, config) {
        var self = this,
        defaultConfig = {
            endpointPrefix: '',
            endpoint: function (name) {
                return '/' + name.uncapitalize() + '/:id/';
            },
            methods: {
                'get': {method: 'GET'},
                'create': {method: 'POST'},
                'update': {method: 'PUT'},
                'query': {method: 'GET', isArray: true},
                'remove': {method: 'DELETE'},
                'delete': {method: 'DELETE'}
            }
        };

        this.config = function (config) {
            if(typeof config !== 'object') return defaultConfig;
            angular.extend(defaultConfig, config);
            return self;
        };

        this.prefixedEndpoint = function (config, declaration) {
            if(typeof config !== 'object') {
                throw 'config should be an object';
            }
            if(typeof declaration !== 'object') {
                throw 'declaration should be an object';
            }

            var prefix = config.endpointPrefix || '',
                endpoint = declaration.endpoint || '';

            if(!endpoint) {
                if (typeof config.endpoint === 'function') {
                    endpoint = config.endpoint(declaration.name);
                } else if(typeof config.endpoint === 'string') {
                    endpoint = config.endpoint;
                }
            }

            return prefix + endpoint;
        };

        this.newModel = function (declaration, config) {
            if(typeof declaration !== 'object') {
                throw 'declaration should be an object';
            }
            if(typeof declaration.name !== 'string') {
                throw 'declaration should define a string name attribute';
            }

            if (typeof config !== 'object') {
                config = {};
            }

            config = angular.extend({}, defaultConfig, config);
            
            var endpoint = self.prefixedEndpoint(config, declaration),
            modelResource = $resource(endpoint, {id: '@id'}, config.methods);

            var NewModel = function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(declaration, modelResource);
                SeaModel.apply(this, args);
            };
            
            NewModel.prototype = Object.create(SeaModel.prototype);
            NewModel.prototype.constructor = NewModel;
            
            Object.defineProperty(NewModel.prototype, '_endpoint', { value: endpoint, writable: false, enumerable: false, configurable: false });
            Object.defineProperty(NewModel.prototype, '_modelName', { value: declaration.name, writable: false, enumerable: false, configurable: false });

            for(var m in declaration.methods) {
                if(typeof declaration.methods[m] === 'function') {
                    NewModel.prototype[m] = declaration.methods[m];
                }
            }
            
            NewModel.query = function (params, success_cb, error_cb) {
                if(typeof params === 'function') {
                    error_cb = success_cb;
                    success_cb = params;
                    params = {};
                }
                var result = [],
                obj = null,
                resources = modelResource.query(params, function (value, responseHeaders) {
                    for(var i = 0; i < resources.length; i++) {
                        obj = new NewModel(resources[i]);
                        result.push(obj);
                    }
                    if(typeof success_cb == 'function'){
                        success_cb(result, responseHeaders);
                    }
                }, function (httpResponse) {
                    if(typeof error_cb == 'function' ) {
                        error_cb(httpResponse);
                    }
                });

                return result;
            };
            
            NewModel.get = function (id, success_cb, error_cb) {
                if(!id) {
                    throw 'id argument is required';
                }

                var instance = new NewModel({id: id});
                instance.load(success_cb, error_cb);
                return instance;
            };
            
            Models[declaration.name] = NewModel;
            
            return NewModel;
        };
        
        this.belongsTo = function (model) {
            if (model === undefined
                || model === null
                || !(model.prototype instanceof SeaModel) && (typeof model !== 'string' )) {
                throw 'Invalid model parameter. It should be a string or Sea Model!';
            }

            return function (instance) {
                if(typeof model === "string")
                    return new BelongsTo(Models[model], instance);
                return new BelongsTo(model, instance);
            };
        };
        
        this.hasMany = function (model, related_field) {
            if (model === undefined
                || model === null
                || !(model.prototype instanceof SeaModel) && (typeof model !== 'string' )) {
                throw 'Invalid model parameter. It should be a string or Sea Model!';
            }

            if (typeof related_field !== 'string') {
                throw 'Invalid related_field parameter. It should be a string!';
            }

            return function (instance) {
                if(typeof model === "string")
                    return new HasMany(Models[model], instance, related_field);
                return new HasMany(model, instance, related_field);
            };
        };

        this.config(config);
    };

    
    angular.module('seaModel', ['ngResource'])
    .provider('$seaModel', function seaModelProvider() {
        var config = {};
        this.config = function (userConfig) {
            angular.extend(config, userConfig);
        };
        this.$get = ['$resource', function seaModelFactory($resource) {
            return new SeaORM($resource, config); 
        }];
    });

    return SeaORM;
}) (angular);
