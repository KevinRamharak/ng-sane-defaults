(function () {
    angular
        .module('ng-sane-defaults', [])
        .config(['$compileProvider', configure]);
    function configure($compileProvider) {
        $compileProvider.component = patchRegisterComponent($compileProvider.component);
    }
    function patchRegisterComponent(registerComponent) {
        return component;
        /**
         *
         * @param nameOrDict name or Dictionary of component names and their options
         * @param options options for the component if the first parameter is the name
         */
        function component(nameOrDict, options) {
            var _a;
            // make sure the function signature is correct, if not pass it trough to the original function to handle errors
            if (typeof nameOrDict === 'string' && typeof options !== 'object')
                return registerComponent.call(this, nameOrDict, options);
            if (typeof nameOrDict !== 'string' &&
                typeof nameOrDict !== 'object')
                return registerComponent.call(this, nameOrDict, options);
            // create the dictionary call signature as it is easier to work with
            var components = typeof nameOrDict === 'string'
                ? (_a = {}, _a[nameOrDict] = options, _a) : nameOrDict;
            var _loop_1 = function (key) {
                var options_1 = components[key];
                // check if it has a controller function
                if (typeof options_1.controller !== 'function')
                    return "continue";
                // check if it has a `static $defaults` property, use `getOwnPropertyNames` to check for a getter function without invoking it
                if (Object.getOwnPropertyNames(options_1.controller).indexOf('$defaults') === -1)
                    return "continue";
                // get the original `$onInit` function or undefined if there was none
                var onInit = options_1.controller.prototype.$onInit;
                // patch the `$onInit` function
                options_1.controller.prototype.$onInit = function $onInit() {
                    var defaults = options_1.controller.$defaults;
                    if (typeof defaults === 'object') {
                        for (var prop in defaults) {
                            if (this[prop] == null) {
                                this[prop] = defaults[prop];
                            }
                        }
                    }
                    // call the lifecycle hook if it existed
                    return typeof onInit === 'function'
                        ? onInit.call(this)
                        : void 0;
                };
            };
            for (var key in components) {
                _loop_1(key);
            }
            return registerComponent.call(this, components);
        }
    }
})();
