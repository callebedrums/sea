
describe('Sea Test Suite', function () {
    'use strict';

    beforeEach(module('sea'));

    describe('SeaModelManager', function () {

        var SeaModelManager;

        beforeEach(inject(function ($injector) {
            SeaModelManager = $injector.get('SeaModelManager');
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
            });
        });


    });
});