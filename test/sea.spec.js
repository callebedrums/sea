
describe("String test suite", function () {

    it('should define the uncapitalize method', function () {
        assert.isDefined(String.prototype.uncapitalize, 'String.prototype.uncapitalize method is not defined');
        assert.isFunction(String.prototype.uncapitalize, 'String.prototype.uncapitalize is not a function');
    });

    it('should return the uncapitalized string', function () {
        expect(('Callebe').uncapitalize()).to.equal('callebe');
        expect(('callebe').uncapitalize()).to.equal('callebe');
    })
});

describe('Sea Test Suite', function () {

    beforeEach(module('seaModel'));

    describe('SeaModelProvider', function () {
        var $seaModelProvider;

        beforeEach(module(function (_$seaModelProvider_) {
            $seaModelProvider = _$seaModelProvider_;
        }));

        beforeEach(inject());

        it('should define config method', function () {
            assert.isDefined($seaModelProvider.config, '$seaModelProvider.config method is not defined');
            assert.isFunction($seaModelProvider.config, '$seaModelProvider.config is not a function');
        });

        it('should call angular.extend', function () {
            var spy = sinon.spy(angular, 'extend'),
                config = { attr: 'value' };

            $seaModelProvider.config(config);
            expect(spy.calledOnce).to.be.true;

            angular.extend.restore();
        });

    });

    describe('SeaModel', function () {

        var $seaModel;

        beforeEach(inject(function (_$seaModel_) {
            $seaModel = _$seaModel_;
        }));

        /************************
         * $seaModel.config tests
         ************************/
        describe('config method', function () {
            var spy;

            beforeEach(function () {
                spy = sinon.spy(angular, 'extend');
            });

            afterEach(function () {
                angular.extend.restore();
            });

            it('should define config method', function () {
                assert.isDefined($seaModel.config, '$seaModel.config method is not defined');
                assert.isFunction($seaModel.config, '$seaModel.config is not a function');
            });

            it('should call angular.extend and return self', function () {
                var returned = $seaModel.config({});
                expect(spy.calledOnce).to.be.true;
                expect(returned).to.equal($seaModel);
            });

            it('should return the config', function () {
                var returned = $seaModel.config();
                expect(spy.called).to.be.false;
                expect(returned).to.not.equal($seaModel);
                expect(returned).to.be.an('object');
            });

            it('should define the endpoint, endpointPrefix and method attributes in the defaultConfig', function () {
                var config = $seaModel.config();
                assert.isDefined(config.endpoint, 'defaultConfig.endpoint is not defined');
                assert.isFunction(config.endpoint, 'defaultConfig.endpoint is not a function');

                assert.isDefined(config.endpointPrefix, 'defaultConfig.endpointPrefix is not defined');
                expect(config.endpointPrefix, '');

                assert.isDefined(config.methods, 'defaultConfig.methods is not defined');
                expect(config.methods).to.eql({
                    'get': {method: 'GET'},
                    'create': {method: 'POST'},
                    'update': {method: 'PUT'},
                    'query': {method: 'GET', isArray: true},
                    'remove': {method: 'DELETE'},
                    'delete': {method: 'DELETE'}
                });
            });

            it('should return the endpoint', function () {
                var config = $seaModel.config();
                expect(config.endpoint('MyModel')).to.equal('/myModel/:id/');
            });
        });
        

        /**********************************
         * $seaModel.prefixedEndpoint tests
         **********************************/
        describe('prefixedEndpoint method', function () {
            it('should define the prefixedEndpoint method', function () {
               assert.isDefined($seaModel.prefixedEndpoint, '$seaModel.prefixedEndpoint method is not defined');
               assert.isFunction($seaModel.prefixedEndpoint, '$seaModel.prefixedEndpoint is not a function');
            });

            it('should throw an error if the prefixedEndpoint method does not receive a valid config and declaration parameters', function () {
                assert.throws(function () {
                    $seaModel.prefixedEndpoint();
                }, 'config should be an object');

                assert.throws(function () {
                    $seaModel.prefixedEndpoint({});
                }, 'declaration should be an object');

                assert.doesNotThrow(function () {
                    $seaModel.prefixedEndpoint({}, {});
                }, 'declaration should be an object');
            });

            it('should return the prefixed endpoint for the model declaration', function () {
                expect($seaModel.prefixedEndpoint({}, {})).to.equal('');

                expect($seaModel.prefixedEndpoint({ endpointPrefix: 'api' }, {})).to.equal('api');

                expect($seaModel.prefixedEndpoint({ endpointPrefix: 'api' }, { endpoint: '/endpoint'})).to.equal('api/endpoint');

                var declaration = {
                    name: 'MyModel'
                };
                var config = $seaModel.config();
                var spy = sinon.spy(config, 'endpoint');
                spy.withArgs('MyModel');

                expect($seaModel.prefixedEndpoint(config, declaration)).to.equal('/myModel/:id/');
                expect(spy.withArgs('MyModel').calledOnce);

                config.endpointPrefix = 'api';

                expect($seaModel.prefixedEndpoint(config, declaration)).to.equal('api/myModel/:id/');
                expect(spy.withArgs('MyModel').calledTwice);

                config.endpoint.restore();

                expect($seaModel.prefixedEndpoint({ endpointPrefix: 'api', endpoint: '/endpoint' }, {})).to.equal('api/endpoint');

            });
        });

        /**************************
         * $seaModel.newModel tests
         **************************/
        describe('newModel method', function () {
            var declaration;
            var mock;

            beforeEach(function () {
                declaration = {
                    name: 'MyModel'
                };

                mock = sinon.mock($seaModel);
            });

            afterEach(function () {
                mock.restore();
            });

            it('should define the newModel method', function () {
                assert.isDefined($seaModel.newModel, '$seaModel.newModel method is not defined');
                assert.isFunction($seaModel.newModel, '$seaModel.newModel is not a function');
            });

            it('should throw an error if the newModel method does not receive a valid declaration parameter', function () {
                assert.throws(function () {
                    $seaModel.newModel();
                }, 'declaration should be an object');
                assert.throws(function () {
                    $seaModel.newModel({});
                }, 'declaration should define a string name attribute');
                assert.doesNotThrow(function () {
                    $seaModel.newModel({ name:'' });
                }, 'declaration should define a string name attribute');
            });

            it('should return a new Model Class', function () {
                var MyModel = $seaModel.newModel(declaration, {});

                assert.isDefined(MyModel, 'MyModel is not defined');
                assert.isFunction(MyModel, 'MyModel is not a function');
            });

            it('should define an _endpoint prototype attribute', function () {
                mock.expects('prefixedEndpoint').returns('/endpoint/:id/');

                var MyModel = $seaModel.newModel(declaration);

                mock.verify();

                expect(MyModel.prototype._endpoint).to.equal('/endpoint/:id/');
            });

            it('should define an _modelName prototype attribute', function () {
                var MyModel = $seaModel.newModel(declaration);
                expect(MyModel.prototype._modelName).to.equal('MyModel');
            });

            it('should define the methods defined in the declaration parameter', function () {
                declaration.methods = {
                    m1: function () {},
                    m2: function () {},
                    m3: ''
                };
                var MyModel = $seaModel.newModel(declaration);
                assert.isDefined(MyModel.prototype.m1, 'm1 is not defined');
                assert.isFunction(MyModel.prototype.m1, 'm1 is not a function');

                assert.isDefined(MyModel.prototype.m2, 'm2 is not defined');
                assert.isFunction(MyModel.prototype.m2, 'm2 is not a function');

                assert.isUndefined(MyModel.prototype.m3, 'm3 is defined');
            });

            it('should define the Class methods', function () {
                var MyModel = $seaModel.newModel(declaration);

                assert.isDefined(MyModel.query, 'query is not defined');
                assert.isFunction(MyModel.query, 'query is not a function');

                assert.isDefined(MyModel.get, 'get is not defined');
                assert.isFunction(MyModel.get, 'get is not a function');
            });

            /**************************
             * NewModel.get tests
             **************************/
            describe('get method', function () {
                var MyModel;

                beforeEach(function () {
                    MyModel = $seaModel.newModel(declaration);
                });

                it('should throw an error when get method is called without the id parameter', function () {
                    assert.throws(function () {
                        MyModel.get();
                    }, 'id argument is required');
                });

                it('should return a MyModel instance', function () {
                    var protoMock = sinon.mock(MyModel.prototype);
                    protoMock.expects('load');

                    var instance = MyModel.get(1);
                    expect(instance).to.be.an.instanceof(MyModel);

                    protoMock.verify();
                    protoMock.restore();
                });
            });

            /**************************
             * NewModel.query tests
             **************************/
            describe('query method', function () {
                var MyModel;
                var $httpBackend;

                var verifyBackendCall = function () {
                    $httpBackend.flush();
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                };

                beforeEach(inject(function (_$httpBackend_) {
                    $httpBackend = _$httpBackend_;
                    MyModel = $seaModel.newModel(declaration);
                }));

                it('should return an empty array, and fill it after the request', function () {
                    $httpBackend.expect('GET', '/myModel').respond(200, [{id:1},{id:2}]);

                    var result = MyModel.query();

                    expect(result).to.eql([]);

                    verifyBackendCall();

                    expect(result.length).to.equal(2);
                });

                it('should pass the parameters as query string', function () {
                    $httpBackend.expect('GET', '/myModel?param=value').respond(200, [{id:1},{id:2}]);

                    var result = MyModel.query({param:'value'});

                    verifyBackendCall();
                });

                it('should call success callback when presented', function () {
                    $httpBackend.expect('GET', '/myModel').respond(200, [{id:1},{id:2}]);
                    var callback = sinon.spy();
                    var result = MyModel.query(callback);

                    verifyBackendCall();

                    expect(callback.calledWith(result)).to.be.true;
                });

                it('should call error callback when presented', function () {                    
                    $httpBackend.expect('GET', '/myModel').respond(500);

                    var result = MyModel.query();

                    verifyBackendCall();

                    $httpBackend.expect('GET', '/myModel').respond(500);

                    var callback = sinon.spy();
                    result = MyModel.query(function () {}, callback);

                    verifyBackendCall();

                    expect(callback.calledOnce).to.be.true;
                });
            });


            /**************************
             * NewModel.query tests
             **************************/
            describe('NewModel instance', function () {
                
            });
        });

        /**************************
         * $seaModel.belongsTo tests
         **************************/
        describe('belongsTo method', function () {
        	var TestModel = null;
            
            beforeEach(function () {
            	TestModel = $seaModel.newModel({ name:'Test' });
            });

            it('should throws an exception if belongsTo method does not receive a valid model parameter', function () {
            	expect($seaModel.belongsTo).to.throw('Invalid model parameter. It should be a string or Sea Model!');
            	expect(function () {
            		$seaModel.belongsTo({});
            	}).to.throw('Invalid model parameter. It should be a string or Sea Model!');
            	expect(function () {
            		$seaModel.belongsTo('Test');
            	}).to.not.throw();
            	expect(function () {
            		$seaModel.belongsTo(TestModel);
            	}).to.not.throw();
            });

            it('should return a function', function () {
            	expect($seaModel.belongsTo('Test')).to.be.instanceof(Function);
            });

            it('should return an Object', function () {
            	expect($seaModel.belongsTo('Test')({})).to.be.instanceof(Object);
            	expect($seaModel.belongsTo(TestModel)({})).to.be.instanceof(Object);
            });

            it('should define object, model and instance attributes', function () {
            	var instance = {};
            	var belongsToObj = $seaModel.belongsTo('Test')(instance);

            	expect(belongsToObj.instance).to.be.defined;
            	expect(belongsToObj.instance).to.equal(instance);

            	expect(belongsToObj.model).to.be.defined;
            	expect(belongsToObj.model).to.equal(TestModel);

            	expect(belongsToObj.object).to.be.defined;
            	expect(belongsToObj.object).to.be.null;
            });

            it('should return object.id', function () {
            	var belongsToObj = $seaModel.belongsTo('Test')({});

            	expect(belongsToObj.toJS()).to.be.null;
            	belongsToObj.object = { id: 123 };
            	expect(belongsToObj.toJS()).to.equal(123);
            });

            it('should call object.load if it is not loaded', function () {
            	var belongsToObj = $seaModel.belongsTo('Test')({});
            	var scb = function () {};
            	var ecb = function () {};
            	var obj = {
            		isNew: false,
            		isLoaded: false,
            		load: sinon.spy()
            	};

            	belongsToObj.object = obj;

            	expect(belongsToObj.get(scb, ecb)).to.equal(obj);
            	expect(obj.load.calledWith(scb, ecb)).to.be.true;
            });

            it('should call success_cb if object is already loaded', function () {
            	var belongsToObj = $seaModel.belongsTo('Test')({});
            	var scb = sinon.spy();
            	var obj = {
            		isNew: true,
            		isLoaded: true,
            		load: sinon.spy()
            	};
            	belongsToObj.object = obj;

            	expect(belongsToObj.get()).to.equal(obj);
            	expect(belongsToObj.get(scb)).to.equal(obj);
            	expect(scb.calledWith(obj)).to.be.true;
            });

            it('should set the object value to null', function () {
            	var belongsToObj = $seaModel.belongsTo('Test')({});
            	var obj = {};
            	belongsToObj.object = obj;

            	belongsToObj.set('1');
            	expect(belongsToObj.object).to.equal(obj);

            	belongsToObj.set(null);
            	expect(belongsToObj.object).to.be.null;
            });

            it('should set the object value to Test instance', function () {
            	var belongsToObj = $seaModel.belongsTo('Test')({});
            	var test = new TestModel();

            	belongsToObj.set(test);
            	expect(belongsToObj.object).to.equal(test);
            });

            it('should set the object to Test instance when receive an id', function () {
            	var belongsToObj = $seaModel.belongsTo('Test')({});
            	var test = new TestModel({ id: 1 });
            	belongsToObj.object = test;

            	belongsToObj.set(1);
            	expect(belongsToObj.object).to.equal(test);
            	expect(belongsToObj.object.id).to.equal(1);

            	belongsToObj.set(2);
            	expect(belongsToObj.object).to.not.equal(test);
            	expect(belongsToObj.object.id).to.equal(2);
            });
        });

        /**************************
         * $seaModel.hasMany tests
         **************************/
        describe('hasMany method', function () {
            var TestModel = null;
            
            beforeEach(function () {
            	TestModel = $seaModel.newModel({ name:'Test' });
            });

            it('should throws an exception if hasMany method does not receive a valid model parameter', function () {
            	expect($seaModel.hasMany).to.throw('Invalid model parameter. It should be a string or Sea Model!');
            	expect(function () {
            		$seaModel.hasMany({});
            	}).to.throw('Invalid model parameter. It should be a string or Sea Model!');
            	expect(function () {
            		$seaModel.hasMany('Test', '');
            	}).to.not.throw();
            	expect(function () {
            		$seaModel.hasMany(TestModel, '');
            	}).to.not.throw();
            });

            it('should throws an exception if hasMany method does not receive a valid related_field parameters', function () {
            	expect(function () {
            		$seaModel.hasMany('Test');
            	}).to.throw('Invalid related_field parameter. It should be a string!');
            	expect(function () {
            		$seaModel.hasMany('Test', 'related_field');
            	}).to.not.throw();
            });

            it('should return a function', function () {
            	expect($seaModel.hasMany('Test', 'related_field')).to.be.instanceof(Function);
            });

            it('should return an Object', function () {
            	expect($seaModel.hasMany('Test', 'related_field')({})).to.be.instanceof(Object);
            	expect($seaModel.hasMany(TestModel, 'related_field')({})).to.be.instanceof(Object);
            });
        });

    });
});