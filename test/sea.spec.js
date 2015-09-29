
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

            it('should throw an error if the newModel method does not receive an valid declaration parameter', function () {
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
        });
    });
});