
describe('Sea Test Suite', function () {
    'use strict';

    beforeEach(module('sea'));

    describe('SeaResource', function () {

        var $rootScope;
        var $httpBackend;
        var $http;
        var $q;
        var SeaModelManager;
        var SeaModel;
        var SeaResource;
        var resource;
        var resourceMock;

        var flushAndVerifyBackend = function () {
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        };

        beforeEach(inject(function ($injector) {
            $rootScope      = $injector.get('$rootScope');
            $httpBackend    = $injector.get('$httpBackend');
            $http           = $injector.get('$http');
            $q              = $injector.get('$q');
            SeaModelManager = $injector.get('SeaModelManager');
            SeaResource     = Sea.Resource;
        }));

        beforeEach(function () {
            resource = new SeaResource({
                name: "myModel",
                endpointPrefix: 'api',
                endpoint: function (name) {
                    return '/' + name + '/<id>';
                },
                actions: {
                    'get': { method: 'GET' },
                    'create': { method: 'POST' },
                    'update': { method: 'PUT' },
                    'query': { method: 'GET', isArray: true },
                    'remove': { method: 'DELETE' },
                    'delete': { method: 'DELETE' },
                    'special': { method: 'PUT', sufix: 'special' }
                }
            });

            resourceMock = sinon.mock(resource);
        });

        afterEach(function () {
            resourceMock.restore();
        });

        it('should define a method for each action', function () {
            expect(resource.get).to.be.instanceof(Function);
            expect(resource.create).to.be.instanceof(Function);
            expect(resource.update).to.be.instanceof(Function);
            expect(resource.query).to.be.instanceof(Function);
            expect(resource.remove).to.be.instanceof(Function);
            expect(resource.delete).to.be.instanceof(Function);
        });

        describe('getURL method', function () {
            it('should define the getURL method', function () {
                expect(resource.getURL).to.be.instanceof(Function);
            });

            it('should return the URL replacing the parameters', function () {
                var endpoint = resource.$config.endpoint;
                resource.$config.endpoint = "/myModel/test";
                expect(resource.getURL()).to.equal('api/myModel/test');

                resource.$config.endpoint = undefined;
                expect(resource.getURL()).to.equal('api');

                resource.$config.endpoint = endpoint;
                expect(resource.getURL()).to.equal('api/myModel');

                var data = { id: '123' };
                expect(resource.getURL(data)).to.equal('api/myModel/123');

                expect(resource.getURL(data, '/suf')).to.equal('api/myModel/123/suf');

                data = { id: '123' };
                resource.$config.endpoint = '/my-model/<id>/<p1>/<p2>';
                resource.$config.endpointPrefix = 'http://domain.com/api';
                expect(resource.getURL(data)).to.equal('http://domain.com/api/my-model/123');
            });
        });

        describe('request method', function () {
            it('should define the request method', function () {
                expect(resource.request).to.be.instanceof(Function);
            });

            it('should get the URL', function () {
                resourceMock.expects('getURL').returns('test');

                resource.request('GET');

                resourceMock.verify();
            });

            it('should submit a GET request having data as query parameters', function () {
                resourceMock.expects('getURL').returns('test/1');

                var response = { a: 123 };

                $httpBackend.expectGET('test/1?aaa=123').respond(200, response);

                resource.request('GET', null, { aaa: 123 });

                flushAndVerifyBackend();
            });

            it('should submit a PUT and return a promise', function () {
                $httpBackend.expectPUT('api/myModel/1', { id: 1, aaa: "test" }).respond(200);

                var spy = sinon.spy();
                var promise = resource.request('PUT', { id: 1, aaa: "test" });

                expect(promise).to.be.not.undefined;
                promise.then(spy);

                flushAndVerifyBackend();

                expect(spy.calledOnce).to.be.true;
            });

            it('should cache the call while it is proggress', function () {
                $httpBackend.expectPUT('api/myModel/1', { id: 1, aaa: "test" }).respond(200);

                var spy = sinon.spy();
                var promise1 = resource.request('PUT', { id: 1, aaa: "test" });
                var promise2 = resource.request('PUT', { id: 1, aaa: "test" });

                promise1.then(spy);
                promise2.then(spy);

                expect(promise1).to.equal(promise2);

                flushAndVerifyBackend();

                expect(spy.calledTwice).to.be.true;

                $httpBackend.expectPUT('api/myModel/1', { id: 1, aaa: "test" }).respond(200);
                var promise3 = resource.request('PUT', { id: 1, aaa: "test" });

                expect(promise3).to.not.equal(promise1);
                promise3.then(spy);

                flushAndVerifyBackend();

                expect(spy.calledThrice).to.be.true;
            });
        });

        describe('action methods', function () {
            it('get method should call request method', function () {
                var promise = {};
                resourceMock.expects('request').withArgs('GET', sinon.match({ id: 1 }), sinon.match({ param: '123' })).returns(promise);

                expect(resource.get({ id: 1 }, { param: '123' })).to.equal(promise);

                resourceMock.verify();
            });

            it('query method should call request and ignore data argument', function () {
                var promise = {};
                resourceMock.expects('request').withArgs('GET', null, sinon.match({ param: '123' })).returns(promise);
                expect(resource.query({ param: '123' })).to.equal(promise);

                resourceMock.verify();
            });
        });

    });

    describe('SeaModelManager', function () {

        var SeaModelManager;
        var SeaModel;
        var SeaResource;
        var $rootScope;
        var $q;

        beforeEach(inject(function ($injector) {
            SeaModelManager = $injector.get('SeaModelManager');
            SeaModel = Sea.Model;
            SeaResource = Sea.Resource;
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
        }));

        describe('config method', function () {
            it('should define config method', function () {
                expect(SeaModelManager.config).to.be.instanceof(Function);
            });

            it('should set and get config', function () {
                var config = { attr: 'value' };

                expect(SeaModelManager.config().attr).to.be.undefined;
                SeaModelManager.config(config);
                expect(SeaModelManager.config().attr).to.equal('value');
            });

            it('should set identifier, endpointPrefix and endpoint method into default config', function () {
                var config = SeaModelManager.config();

                expect(config.identifier).to.equal("id");
                expect(config.endpointPrefix).to.equal("");
                expect(config.endpoint).to.be.instanceof(Function);
                expect(config.endpoint("MyModule")).to.equal("/myModule/<id>");
            });
        });

        describe('newModel method', function () {
            it('should define newModel method', function () {
                expect(SeaModelManager.newModel).to.be.instanceof(Function);
            });

            it('should throw an exception if config is invalid', function () {
                expect(function () {
                    SeaModelManager.newModel();
                }).to.throw("config should be an object");
                
                expect(function () {
                    SeaModelManager.newModel({});
                }).to.throw("config should define a string name attribute");

                SeaModelManager.newModel({ name: "MyModel" });
                
                expect(function () {
                    SeaModelManager.newModel({ name: "MyModel" });
                }).to.throw("redefining model is not allowed. MyModel is already defined");
            });

            it('should return a class that inherits from SeaModel', function () {
                var MyModel = SeaModelManager.newModel({
                    name: 'MyModel'
                });

                expect(MyModel).to.be.instanceof(Function);

                var obj = new MyModel();

                expect(obj).to.be.instanceof(MyModel);
                expect(obj).to.be.instanceof(SeaModel);
            });

            it('should have a $config attribute', function () {
                var MyModel = SeaModelManager.newModel({
                    name: 'MyModel'
                });

                expect(MyModel.$config).to.not.be.undefined;
                expect(MyModel.$config.name).to.equal('MyModel');

                var obj = new MyModel();

                expect(obj.$config).to.not.be.undefined;
                expect(MyModel.$config.name).to.equal('MyModel');
            });

            it('should have a $resource attribute', function () {
                var MyModel = SeaModelManager.newModel({
                    name: 'MyModel'
                });

                expect(MyModel.$resource).to.not.be.undefined;
                expect(MyModel.$resource).to.be.instanceof(SeaResource);

                var obj = new MyModel();
                expect(obj.$resource).to.not.be.undefined;
                expect(obj.$resource).to.be.instanceof(SeaResource);
            });

            describe('newModel instance', function () {
                var MyModel;
                var obj;
                var resourceMock;

                beforeEach(function () {
                    MyModel = SeaModelManager.newModel({
                        name: "MyModel",
                        properties: {
                            'name': "",
                            'num': 0
                        }
                    });

                    obj = new MyModel();

                    resourceMock = sinon.mock(obj.$resource);
                });

                afterEach(function () {
                    resourceMock.restore();
                });
                
                it('should implement getId and setId methods', function () {
                    var MyModel = SeaModelManager.newModel({
                        name: "MyModel2",
                        properties: {
                            'name': "",
                            'attr': null
                        }
                    });

                    var obj = new MyModel();

                    expect(obj.getId()).to.equal(0);
                    obj.setId(1);
                    expect(obj.getId()).to.equal(1);
                });

                it('should consider identifier property', function () {
                   var MyModel = SeaModelManager.newModel({
                        name: "MyModel3",
                        properties: {
                            '_id': "",
                            'name': "",
                            'attr': null
                        },
                        identifier: "_id"
                    });

                    var obj = new MyModel();

                    expect(obj.getId()).to.equal("");
                    obj.setId("abc");
                    expect(obj.getId()).to.equal("abc"); 
                });

                it('should define $isNew attribute', function () {
                    var obj = new MyModel();
                    expect(obj.$isNew).to.be.true;

                    obj.id = 1;
                    expect(obj.$isNew).to.be.false;
                });

                it('should get and set properties', function () {
                    expect(obj.get('name')).to.equal("");
                    obj.set('name', 'Callebe');
                    expect(obj.get('name')).to.equal('Callebe');

                    expect(obj.get('num')).to.equal(0);
                    obj.set('num', 10);
                    expect(obj.get('num')).to.equal(10);

                    expect(obj.get('unknow')).to.be.undefined;
                    obj.set('unknow', 123);
                    expect(obj.get('unknow')).to.be.undefined;
                });

                it('should expose each attribute as object attribute', function () {
                    expect(obj.get('name')).to.equal("");
                    expect(obj.name).to.equal("");
                    obj.name = "Callebe";
                    expect(obj.get('name')).to.equal("Callebe");
                    expect(obj.name).to.equal("Callebe");

                    expect(obj.get('num')).to.equal(0);
                    expect(obj.num).to.equal(0);
                    obj.num = 123;
                    expect(obj.get('num')).to.equal(123);
                    expect(obj.num).to.equal(123);

                    expect(obj.get('unknow')).to.be.undefined;
                    expect(obj.unknow).to.be.undefined;
                    obj.unknow = 123;
                    expect(obj.get('unknow')).to.be.undefined;
                    expect(obj.unknow).to.equal(123);
                });

                it('should populate properties in constructor', function () {
                    obj = new MyModel({
                        id: 10,
                        name: "Callebe",
                        // any function will be executed and its return will be assined to the propperty
                        num: function (instance) {
                            return instance.id + 10;
                        },
                        // it will execute all returned function untill get a non function return
                        other: function (instance) {
                            var a = instance.id + 10;
                            return function (i) {
                                return "other dinamically field: " + a;
                            }
                        }
                    });

                    expect(obj.getId()).to.equal(10);
                    expect(obj.get('id')).to.equal(10);
                    expect(obj.get('name')).to.equal("Callebe");
                    expect(obj.get('num')).to.equal(20);
                    expect(obj.get('other')).to.equal("other dinamically field: 20");

                    obj = new MyModel(20);

                    expect(obj.getId()).to.equal(20);
                });

                it('should return a JavaScript Object (toJS)', function () {
                    obj = new MyModel({
                        id: 1,
                        name: "Callebe"
                    });

                    expect(obj.toJS()).to.eql({
                        id: 1,
                        name: "Callebe",
                        num: 0
                    });
                });

                describe('load method', function () {
                    it('should implement a load method', function () {
                        expect(obj.load).to.be.instanceof(Function);
                    });

                    it('should call get method from SeaResource', function () {
                        var deferred = $q.defer();
                        resourceMock.expects('get').withArgs(sinon.match({ id: 1 })).returns(deferred.promise);

                        obj.id = 1;
                        obj.load();

                        resourceMock.verify();
                    });

                    it('should return a promise and set $calling to true when load method is called', function () {
                        var deferred = $q.defer();
                        var spy = sinon.spy($rootScope, '$broadcast');
                        resourceMock.expects('get').returns(deferred.promise);

                        obj.id = 1;
                        var promise = obj.load();

                        expect(promise).to.not.be.undefined;
                        expect(promise.then).to.be.instanceof(Function);
                        expect(promise.catch).to.be.instanceof(Function);
                        expect(promise.finally).to.be.instanceof(Function);

                        expect(obj.$promise).to.equal(promise);
                        expect(obj.$calling).to.be.true;

                        expect(spy.withArgs('SeaModel.MyModel.load-started', obj).calledOnce).to.be.true;
                    });

                    it('should resolve promise when get loaded', function () {
                        var deferred = $q.defer();
                        var eventSpy = sinon.spy($rootScope, '$broadcast');
                        var spy = sinon.spy();
                        resourceMock.expects('get').returns(deferred.promise);

                        obj.id = 1;
                        obj.load().then(spy);

                        var response = {
                            data: {
                                id: 1,
                                name: "Callebe",
                                num: 10
                            }
                        };

                        deferred.resolve(response);

                        $rootScope.$apply();
                        $rootScope.$apply();

                        expect(spy.withArgs(obj).calledOnce).to.be.true;
                        expect(obj.$calling).to.be.false;
                        expect(eventSpy.withArgs('SeaModel.MyModel.load-success', obj).calledOnce).to.be.true;

                        expect(obj.name).to.equal("Callebe");
                        expect(obj.num).to.equal(10);
                    });

                    it('should reject promise when loading fails', function () {
                        var deferred = $q.defer();
                        var eventSpy = sinon.spy($rootScope, '$broadcast');
                        var spy = sinon.spy();
                        resourceMock.expects('get').returns(deferred.promise);

                        obj.id = 1;
                        obj.load().catch(spy);

                        deferred.reject({});

                        $rootScope.$apply();
                        $rootScope.$apply();

                        expect(spy.withArgs(obj).calledOnce).to.be.true;
                        expect(obj.$calling).to.be.false;
                        expect(eventSpy.withArgs('SeaModel.MyModel.load-error', obj).calledOnce).to.be.true;
                    });
                });

                describe('save method', function () {
                    it('should implement a save method', function () {
                        expect(obj.save).to.be.instanceof(Function);
                    });

                    it('should call create method from SeaResource when there is no identifier', function () {
                        var deferred = $q.defer();
                        resourceMock.expects('create').withArgs(sinon.match({
                            name: "Callebe",
                            num: 29
                        })).returns(deferred.promise);

                        obj.id = 0;
                        obj.name = "Callebe";
                        obj.num = 29

                        obj.save();

                        resourceMock.verify();
                    });

                    it('should call update method from SeaResource when there is identifier', function () {
                        var deferred = $q.defer();
                        resourceMock.expects('update').withArgs(sinon.match({
                            id: 1,
                            name: "Callebe",
                            num: 29
                        })).returns(deferred.promise);

                        obj.id = 1;
                        obj.name = "Callebe";
                        obj.num = 29

                        obj.save();

                        resourceMock.verify();
                    });

                    it('should return a promise and set $calling to true when save method is called', function () {
                        var deferred = $q.defer();
                        var spy = sinon.spy($rootScope, '$broadcast');
                        resourceMock.expects('update').returns(deferred.promise);

                        obj.id = 1;
                        var promise = obj.save();

                        expect(promise).to.not.be.undefined;
                        expect(promise.then).to.be.instanceof(Function);
                        expect(promise.catch).to.be.instanceof(Function);
                        expect(promise.finally).to.be.instanceof(Function);

                        expect(obj.$promise).to.equal(promise);
                        expect(obj.$calling).to.be.true;

                        expect(spy.withArgs('SeaModel.MyModel.save-started', obj).calledOnce).to.be.true;
                    });

                    it('should resolve promise when save data', function () {
                        var deferred = $q.defer();
                        var eventSpy = sinon.spy($rootScope, '$broadcast');
                        var spy = sinon.spy();
                        resourceMock.expects('update').returns(deferred.promise);

                        obj.id = 1;
                        obj.name = "Callebe";
                        obj.num = 10
                        obj.save().then(spy);

                        var response = {
                            data: {
                                id: 1,
                                name: "Callebe",
                                num: 11
                            }
                        };

                        deferred.resolve(response);

                        $rootScope.$apply();
                        $rootScope.$apply();

                        expect(spy.withArgs(obj).calledOnce).to.be.true;
                        expect(obj.$calling).to.be.false;
                        expect(eventSpy.withArgs('SeaModel.MyModel.save-success', obj).calledOnce).to.be.true;

                        expect(obj.name).to.equal("Callebe");
                        expect(obj.num).to.equal(11);
                    });

                    it('should reject promise when saving fails', function () {
                        var deferred = $q.defer();
                        var eventSpy = sinon.spy($rootScope, '$broadcast');
                        var spy = sinon.spy();
                        resourceMock.expects('update').returns(deferred.promise);

                        obj.id = 1;
                        obj.name = "Callebe";
                        obj.num = 10
                        obj.save().catch(spy);

                        deferred.reject({});

                        $rootScope.$apply();
                        $rootScope.$apply();

                        expect(spy.withArgs(obj).calledOnce).to.be.true;
                        expect(obj.$calling).to.be.false;
                        expect(eventSpy.withArgs('SeaModel.MyModel.save-error', obj).calledOnce).to.be.true;
                    });
                });

                describe('remove method', function () {
                    it('should implement a remove method', function () {
                        expect(obj.remove).to.be.instanceof(Function);
                    });

                    it('should call remove method from SeaResource when there is identifier', function () {
                        var deferred = $q.defer();
                        resourceMock.expects('remove').withArgs(sinon.match({
                            id: 1
                        })).returns(deferred.promise);

                        obj.id = 1;

                        obj.remove();

                        resourceMock.verify();
                    });

                    it('should return a promise and set $calling to true when remuve method is called', function () {
                        var deferred = $q.defer();
                        var spy = sinon.spy($rootScope, '$broadcast');
                        resourceMock.expects('remove').returns(deferred.promise);

                        obj.id = 1;
                        var promise = obj.remove();

                        expect(promise).to.not.be.undefined;
                        expect(promise.then).to.be.instanceof(Function);
                        expect(promise.catch).to.be.instanceof(Function);
                        expect(promise.finally).to.be.instanceof(Function);

                        expect(obj.$promise).to.equal(promise);
                        expect(obj.$calling).to.be.true;

                        expect(spy.withArgs('SeaModel.MyModel.remove-started', obj).calledOnce).to.be.true;
                    });

                    it('should resolve promise when remove is completed', function () {
                        var deferred = $q.defer();
                        var eventSpy = sinon.spy($rootScope, '$broadcast');
                        var spy = sinon.spy();
                        resourceMock.expects('remove').returns(deferred.promise);

                        obj.id = 1;
                        obj.remove().then(spy);

                        var response = {};

                        deferred.resolve(response);

                        $rootScope.$apply();
                        $rootScope.$apply();

                        expect(spy.withArgs(obj).calledOnce).to.be.true;
                        expect(obj.$calling).to.be.false;
                        expect(eventSpy.withArgs('SeaModel.MyModel.remove-success', obj).calledOnce).to.be.true;
                    });

                    it('should reject promise when removing fails', function () {
                        var deferred = $q.defer();
                        var eventSpy = sinon.spy($rootScope, '$broadcast');
                        var spy = sinon.spy();
                        resourceMock.expects('remove').returns(deferred.promise);

                        obj.id = 1;
                        obj.remove().catch(spy);

                        deferred.reject({});

                        $rootScope.$apply();
                        $rootScope.$apply();

                        expect(spy.withArgs(obj).calledOnce).to.be.true;
                        expect(obj.$calling).to.be.false;
                        expect(eventSpy.withArgs('SeaModel.MyModel.remove-error', obj).calledOnce).to.be.true;
                    });

                    it('should not call remove method from SeaResource when there is no identifier', function () {
                        var deferred = $q.defer();
                        var spy = sinon.spy(obj.$resource, 'remove');

                        obj.id = 0;
                        
                        expect(obj.remove()).to.be.undefined;
                        expect(spy.notCalled).to.be.true;
                    });
                });
            });

            describe('query method', function () {

                var MyModel;
                var resourceMock;

                beforeEach(function () {
                    MyModel = SeaModelManager.newModel({
                        name: 'MyModel'
                    });

                    resourceMock = sinon.mock(MyModel.$resource);
                });

                afterEach(function () {
                    resourceMock.restore();
                });

                it('should implement a query method', function () {
                    expect(MyModel.query).to.be.instanceof(Function);
                });

                it('should call query method from SeaResource', function () {
                    var deferred = $q.defer();
                    resourceMock.expects('query').withArgs(sinon.match({
                        param: 1
                    })).returns(deferred.promise);

                    MyModel.query({ param: 1 });

                    resourceMock.verify();
                });

                it('should return an array having a promise attribute and set $calling to true when query method is called', function () {
                    var deferred = $q.defer();
                    var spy = sinon.spy($rootScope, '$broadcast');
                    resourceMock.expects('query').returns(deferred.promise);

                    var result = MyModel.query();

                    expect(result).to.be.instanceof(Array);
                    expect(result).to.have.length(0);

                    expect(result.$promise).to.not.be.undefined;
                    expect(result.$promise.then).to.be.instanceof(Function);
                    expect(result.$promise.catch).to.be.instanceof(Function);
                    expect(result.$promise.finally).to.be.instanceof(Function);

                    expect(result.$calling).to.be.true;

                    expect(spy.withArgs('SeaModel.MyModel.query-started', result).calledOnce).to.be.true;
                });

                it('should resolve promise when query is completed', function () {
                    var deferred = $q.defer();
                    var eventSpy = sinon.spy($rootScope, '$broadcast');
                    var spy = sinon.spy();
                    resourceMock.expects('query').returns(deferred.promise);

                    var result = MyModel.query();
                    result.$promise.then(spy);

                    var response = {
                        data: [{
                            id: 1,
                            name: "Callebe",
                            num: 3
                        }]
                    };

                    deferred.resolve(response);

                    $rootScope.$apply();
                    $rootScope.$apply();

                    expect(result).to.have.length(1);
                    expect(result[0]).to.be.instanceof(MyModel);
                    expect(spy.withArgs(result).calledOnce).to.be.true;
                    expect(result.$calling).to.be.false;
                    expect(eventSpy.withArgs('SeaModel.MyModel.query-success', result).calledOnce).to.be.true;
                });

                it('should reject promise when querying fails', function () {
                    var deferred = $q.defer();
                    var eventSpy = sinon.spy($rootScope, '$broadcast');
                    var spy = sinon.spy();
                    resourceMock.expects('query').returns(deferred.promise);

                    var result = MyModel.query();
                    result.$promise.catch(spy);

                    deferred.reject({});

                    $rootScope.$apply();
                    $rootScope.$apply();

                    expect(spy.withArgs(result).calledOnce).to.be.true;
                    expect(result.$calling).to.be.false;
                    expect(eventSpy.withArgs('SeaModel.MyModel.query-error', result).calledOnce).to.be.true;
                });
            });

            describe('get method', function () {

                var MyModel;

                beforeEach(function () {
                    MyModel = SeaModelManager.newModel({
                        name: 'MyModel'
                    });
                });

                it('should implement a get method', function () {
                    expect(MyModel.get).to.be.instanceof(Function);
                });

                it('should throw an error if there is no identifier', function () {
                    expect(function () {
                        MyModel.get();
                    }).to.throw("id argument is required");
                });

                it('should return an MyModel instance', function () {
                    var mock = sinon.mock(MyModel.prototype);
                    mock.expects('load');

                    var obj = MyModel.get(1);

                    expect(obj).to.be.instanceof(MyModel);
                    expect(obj.id).to.equal(1);

                    mock.verify();
                    mock.restore();
                });
            });
        });

        describe('getModels', function () {
            beforeEach(function () {
                SeaModelManager.newModel({ name: 'Model1' });
                SeaModelManager.newModel({ name: 'Model2' });
            });

            it('should define the getmodels method', function () {
                expect(SeaModelManager.getModels).to.instanceof(Function);
            });

            it('should return an object with all defiled models', function () {
                var models = SeaModelManager.getModels();

                expect(models).to.not.be.undefined;
                expect(models['Model1']).to.not.be.undefined;
                expect(models['Model2']).to.not.be.undefined;
                expect(models.length).to.equal(2);
            });
        });

    });
});