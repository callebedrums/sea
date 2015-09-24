
describe("String test suite", function () {

    it('should define the uncapitalize method', function () {
        assert.isDefined(String.prototype.uncapitalize, 'uncapitalize method is not defined');
        assert.isFunction(String.prototype.uncapitalize, 'uncapitalize is not a function');
    });

    it('should return the uncapitalized string', function () {
        expect(('Callebe').uncapitalize()).to.equal('callebe');
        expect(('callebe').uncapitalize()).to.equal('callebe');
    })
});

describe('Sea test suite', function () {

    beforeEach(module('seaModel'));

    describe('SeaModelProvider', function () {
        var $seaModelProvider;

        beforeEach(module(function (_$seaModelProvider_) {
            $seaModelProvider = _$seaModelProvider_;
        }));

        beforeEach(inject());

        it('should define settings method', function () {
            assert.isDefined($seaModelProvider.settings, 'settings method is not defined');
            assert.isFunction($seaModelProvider.settings, 'settings is not a function');
        });

        it('should call angular.extend', function () {
            var spy = sinon.spy(angular, 'extend'),
                config = { attr: 'value' };

            $seaModelProvider.settings(config);
            expect(spy.calledOnce).to.be.true;

            angular.extend.restore();
        });

    });

    describe('SeaModel', function () {

        var $seaModel,
            spy;

        beforeEach(inject(function (_$seaModel_) {
            $seaModel = _$seaModel_;
        }));

        beforeEach(function () {
            spy = sinon.spy(angular, 'extend');
        });

        afterEach(function () {
            angular.extend.restore();
        });

        it('should define settings method', function () {
            assert.isDefined($seaModel.settings, 'settings method is not defined');
            assert.isFunction($seaModel.settings, 'settings is not a function');
        });

        it('should call angular.extend and return self', function () {
            var returned = $seaModel.settings({});
            expect(spy.calledOnce).to.be.true;
            expect(returned).to.equal($seaModel);
        });

        it('should return the settings', function () {
            var returned = $seaModel.settings();
            expect(spy.called).to.be.false;
            expect(returned).to.not.equal($seaModel);
            expect(returned).to.be.an('object');
        });
    });
});