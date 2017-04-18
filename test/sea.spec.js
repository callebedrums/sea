
describe('Sea Test Suite', function () {
    'use strict';

    beforeEach(module('sea'));

    describe('SeaModel', function () {

        var SeaModelManager;

        beforeEach(inject(function ($injector) {
            SeaModelManager = $injector.get('SeaModelManager');
        }));

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
});