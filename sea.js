/**
 * @author: Callebe Gomes
 * */

if(!String.prototype.uncapitalize){
	String.prototype.uncapitalize = function () {
		return this.charAt(0).toLowerCase() + this.slice(1);
	};
}

var SeaORM = (function (angular) {
	"use strict";
	var Models = {},
	
	prefixedURL = function (settings, declaration){
		var prefix = settings.urlPrefix,
			url = '';
		if(declaration.url){
			url = declaration.url;
		} else {
			url = typeof settings.url === 'function' ? settings.url(declaration.name): settings.url;
		}
		return prefix + url;
	},
	
	addProperty = function (obj, name) {
        if (typeof obj[name] === 'undefined') {
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
        }
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
			
			Object.defineProperty(self, 'modelName', { value: declaration.name, writable: false, enumerable: false, configurable: false });
			
			for (var field in _private[this._id].fields) {
				while(typeof _private[this._id].fields[field] == 'function'){
					_private[this._id].fields[field] = _private[this._id].fields[field](this);
				}
				addProperty(this, field);
			}
			
			for (var method in declaration.methods) {
				if(typeof declaration.methods[method] === 'function') {
					this.constructor.prototype[method] = declaration.methods[method];
				}
			}
			
			if(typeof data === 'object'){
				self.setFields(data);
			} else if(typeof data === 'number' && parseInt(data)) {
				self.set('id', parseInt(data));
			}
		};
		
		SeaModel.prototype.toJS = function () {
			var js = {};
			for(var field in _private[this._id].fields) {
				if (_private[this._id].fields[field] != null && typeof _private[this._id].fields[field] === "object") {
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
			if (typeof field === 'string' && _private[this._id].fields[field] !== undefined) {
				if (_private[this._id].fields[field] != null && typeof _private[this._id].fields[field] === "object") {
					return _private[this._id].fields[field].get(success_cb, error_cb);
				}
				return _private[this._id].fields[field];
			}
			return angular.copy(_private[this._id].fields);
		};
		
		SeaModel.prototype.set = function (field, value) {
			if(typeof field === 'string' && _private[this._id].fields[field] !== undefined) {
				if (_private[this._id].fields[field] != null && typeof _private[this._id].fields[field] === "object") {
					_private[this._id].fields[field].set(value);
					if(this.isLoaded) _private[this._id].resourceObject[field] = _private[this._id].fields[field].toJS();
				} else {
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
		
		Relational.prototype.get = function (success_cb, error_cb) { }
		Relational.prototype.set = function (v) { };
		Relational.prototype.toJS = function () { };
		
		return Relational
	}()),
	
	BelongsTo = (function () {
		var BelongsTo = function (model, instance) {
			Relational.call(this, model, instance);
		};
		
		BelongsTo.prototype.toJS = function () {
			if(!this.object) return null;
			return this.object.id;
		};
		
		BelongsTo.prototype.get = function (success_cb, error_cb) {
			if(this.object && !this.object.isNew && !this.object.isLoaded) {
				this.object.load(success_cb, error_cb);
			} else {
				if (typeof success_cb === 'function') success_cb(this.object);
			}
			return this.object;
		};

		BelongsTo.prototype.set = function (value) {
			if (value != null && typeof value == 'number') {
				value = parseInt(value);
				if(!isNaN(value) && (this.object == null || this.object.id != value)) {
					this.object = new this.model({id: value});
				}
			} else if (value == null || value instanceof this.model) {
				this.object = value;
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
			this.loading_error_cb = [];
			this.loading_error_cb = [];
		};
		HasMany.prototype.register_callbacks = function (success_cb, error_cb) {
			if(typeof success_cb === 'function') {
				this.loading_success_cb.push(success_cb);
			}
			if(typeof success_cb === 'function') {
				this.loading_error_cb.push(error_cb);
			}
		};
		
		HasMany.prototype.toJS = function () {
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
			var self = this;
			if(!self.object) {
				var params = {};
				params[self.related_field] = self.instance.id;
				self.object = self.model.query(params, function (value, responseHeaders) {
					self.isLoaded = true;
					self.execute_success_cb(value, responseHeaders)
				}, function (httpResponse) {
					self.execute_errors_cb(httpResponse);
				});
			}
			
			self.register_callbacks(success_cb, error_cb);

			if(self.isLoaded) {
				self.execute_success_cb(self.object);
			}
			
			return self.object;
		};

		HasMany.prototype.set = function (value) {
			if (typeof value === 'number') {
				if(!this.object) {
					this.object = [];
					this.isLoaded = true;
				}
				if (!this.has_object(value)) {
					this.object.push(new this.model({id: value}));
				}

			} else if (value instanceof this.model) {
				if (!this.has_object(value.id)) {
					this.object.push(value);
				}

			} else if (value instanceof Array) {
				var new_object = [];
				for(var i = 0; i < value.length; i++) {
					if(value[i] instanceof this.model && !this.has_object(value[i].id)) {
						new_object.push(value[i]);
					}
				}
				this.object = new_object;
				this.isLoaded = true;

			} else if (value == null) {
				this.object = null;
				this.isLoaded = false;

			}
		};
		
		return HasMany;
	}()),

	SeaORM = function SeaORM($resource, settings) {
		var self = this,
		defaultSettings = {
			urlPrefix: '',
			url: function (name) {
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

		this.settings = function (settings) {
			if(typeof settings !== 'object') return defaultSettings;
			angular.extend(defaultSettings, settings);
			return self;
		};

		this.newModel = function (declaration, settings) {
			if(settings) {
				settings = angular.extend({}, defaultSettings, settings);
			} else {
				settings = defaultSettings;
			}
			
			var url = prefixedURL(settings, declaration),
			modelResource = $resource(url, {id: '@id'}, settings.methods);

			var NewModel = function () {
				var args = Array.prototype.slice.call(arguments);
				args.unshift(declaration, modelResource);
				SeaModel.apply(this, args);
			};
			
			angular.extend(NewModel.prototype, SeaModel.prototype);
			
			Object.defineProperty(NewModel.prototype, '_url', { value: url, writable: false, enumerable: false, configurable: false });
			
			NewModel.query = function (params, successCB, erroCB) {
				if(typeof params === 'function') {
					erroCB = successCB;
					successCB = params;
					params = {};
				}
				var result = [],
				obj = null,
				resources = modelResource.query(params, function (value, responseHeaders) {
					for(var i = 0; i < resources.length; i++) {
						obj = new NewModel(resources[i]);
						result.push(obj);
					}
					if(typeof successCB == 'function'){
						successCB(result, responseHeaders);
					}
				}, function (httpResponse) {
					if(typeof erroCB == 'function' ) {
						erroCB(httpResponse);
					}
				});

				return result;
			};
			
			NewModel.get = function (id, successCB, erroCB) {
				var instance = new NewModel({id: id});
				instance.load(successCB, erroCB);
				return instance;
			};
			
			Models[declaration.name] = NewModel;
			
			return NewModel;
		};
		
		this.belongsTo = function (model) {
			return function (instance) {
				if(typeof model === "string")
					return new BelongsTo(Models[model], instance);
				return new BelongsTo(model, instance);
			};
		};
		
		this.hasMany = function (model, related_field) {
			return function (instance) {
				if(typeof model === "string")
					return new HasMany(Models[model], instance, related_field);
				return new HasMany(model, instance, related_field);
			};
		};

		if (typeof settings === 'object') this.settings(settings);
	};

	if(angular) {
		angular.module('seaModel', ['ngResource'])
		.provider('$seaModel', function seaModelProvider() {
			var settings = {};
			this.settings = function (defSettings) {
				angular.extend(settings, defSettings);
			};
			this.$get = ['$resource', function seaModelFactory($resource) {
				return new SeaORM($resource, settings); 
			}];
		});
	}

	return SeaORM;
}(angular));
