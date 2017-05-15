
(function (root, factory) {
    'use strict';
    /* istanbul ignore next  */
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./sea'), require('angular'));
    /* istanbul ignore if  */
    } else if(typeof define === 'function' && define.amd) {
        define(['./sea', 'angular'], factory);
    } else {
        root.SeaAngularModule = factory(root.Sea, root.angular);
    }
} (this, function (Sea, angular) {
    "use strict";

    var module = angular.module('sea', []);

    module.provider('SeaModelManager', Sea.ModelManager);

    module.value('BelongsTo', Sea.BelongsTo);
    module.value('HasMany', Sea.HasMany);

    return module;
}));