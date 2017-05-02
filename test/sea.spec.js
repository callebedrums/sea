
describe('Sea Test Suite', function () {
    'use strict';

    beforeEach(module('sea'));

    describe('SeaResource', function () {

        var SeaModelManager;
        var SeaModel;
        var SeaResource;

        beforeEach(inject(function ($injector) {
            SeaModelManager = $injector.get('SeaModelManager');
            SeaResource = Sea.Resource;
        }));

        it('should define a method for each action', function () {
            var resource = new SeaResource({
                actions: {
                    'get': { method: 'GET' },
                    'create': { method: 'POST' },
                    'update': { method: 'PUT' },
                    'query': { method: 'GET' },
                    'remove': { method: 'DELETE' },
                    'delete': { method: 'DELETE' }
                }
            });

            expect(resource.get).to.be.instanceof(Function);
            expect(resource.create).to.be.instanceof(Function);
            expect(resource.update).to.be.instanceof(Function);
            expect(resource.query).to.be.instanceof(Function);
            expect(resource.remove).to.be.instanceof(Function);
            expect(resource.delete).to.be.instanceof(Function);
        });

    });

    describe('SeaModelManager', function () {

        var SeaModelManager;
        var SeaModel;
        var SeaResource;

        beforeEach(inject(function ($injector) {
            SeaModelManager = $injector.get('SeaModelManager');
            SeaModel = Sea.Model;
            SeaResource = Sea.Resource;
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

                beforeEach(function () {
                    MyModel = SeaModelManager.newModel({
                        name: "MyModel",
                        properties: {
                            'name': "",
                            'num': 0
                        }
                    });

                    obj = new MyModel();
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
                        num: 345,
                        other: "Other attr add to this instance"
                    });

                    expect(obj.getId()).to.equal(10);
                    expect(obj.get('id')).to.equal(10);
                    expect(obj.get('name')).to.equal("Callebe");
                    expect(obj.get('num')).to.equal(345);
                    expect(obj.get('other')).to.equal("Other attr add to this instance");

                    obj = new MyModel(20);

                    expect(obj.getId()).to.equal(20);
                });

                describe('load method', function () {
                    it('should implement a load method', function () {
                        expect(obj.load).to.be.instanceof(Function);
                    });

                    it('should call get method from SeaResource', function () {

                    });
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