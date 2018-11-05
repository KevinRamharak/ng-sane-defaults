(function() {
    type Dict<T = any> = { [key: number]: T; [key: string]: T };

    angular
        .module('ng-sane-defaults', [])
        .config(['$compileProvider', configure]);

    function configure($compileProvider: angular.ICompileProvider) {
        $compileProvider.component = patchRegisterComponent(
            $compileProvider.component
        );
    }

    function patchRegisterComponent(
        registerComponent: angular.ICompileProvider['component']
    ) {
        return component;
        /**
         *
         * @param nameOrDict name or Dictionary of component names and their options
         * @param options options for the component if the first parameter is the name
         */
        function component(
            this: angular.ICompileProvider,
            nameOrDict: string | Dict<angular.IComponentOptions>,
            options?: angular.IComponentOptions
        ) {
            // make sure the function signature is correct, if not pass it trough to the original function to handle errors
            if (typeof nameOrDict === 'string' && typeof options !== 'object')
                return registerComponent.call(this, nameOrDict, options as any);
            if (
                typeof nameOrDict !== 'string' &&
                typeof nameOrDict !== 'object'
            )
                return registerComponent.call(this, nameOrDict, options as any);

            // create the dictionary call signature as it is easier to work with
            const components: Dict<angular.IComponentOptions> =
                typeof nameOrDict === 'string'
                    ? { [nameOrDict]: options! }
                    : nameOrDict;

            for (const key in components) {
                const options = components[key];

                // check if it has a controller function
                if (typeof options.controller !== 'function') continue;

                // check if it has a `static $defaults` property, use `getOwnPropertyNames` to check for a getter function without invoking it
                if (
                    Object.getOwnPropertyNames(options.controller).indexOf(
                        '$defaults'
                    ) === -1
                )
                    continue;

                // get the original `$onInit` function or undefined if there was none
                const onInit: Function | undefined =
                    options.controller.prototype.$onInit;

                // patch the `$onInit` function
                options.controller.prototype.$onInit = function $onInit() {
                    const defaults = (options.controller as Dict).$defaults;

                    if (typeof defaults === 'object') {
                        for (const prop in defaults) {
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
            }

            return registerComponent.call(this, components);
        }
    }
})();
