
describe('Sea Test Suite', function () {
    'use strict';

    beforeEach(module('sea'));

    describe('SeaModelManager', function () {

        var SeaModelManager;
        var SeaModel;

        beforeEach(inject(function ($injector) {
            SeaModelManager = $injector.get('SeaModelManager');
            SeaModel = Sea.Model;
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

            it('should set endpointPrefix and endpoint method into default config', function () {
                var config = SeaModelManager.config();

                expect(config.endpointPrefix).to.equal("");
                expect(config.endpoint).to.be.instanceof(Function);
                expect(config.endpoint("MyModule")).to.equal("/myModule/:id");
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