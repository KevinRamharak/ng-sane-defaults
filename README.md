# ng-sane-defaults

AngularJS extension that provides a sane way to define component defaults

## Description

This module was written to provide:

-   a non-boiler plate way to define defaults for components
-   assign the default value if a binding was provided but the binding resolves to `undefined` or `null`

If you want to disable the null check you can use the following pattern:

```js
// with a config section
angular.module('app', ['ng-sane-defaults']).config([
    'defaultsConfigProvider',
    function(provider) {
        provider.$get().checkNull = false;
    }
]);
// or a run section
angular.module('app', ['ng-sane-defaults']).run([
    'defaultsConfig',
    function(config) {
        config.checkNull = false;
    }
]);
```

The module uses the static property `$defaults` to retrieve its default values for a component. Getter functions are also supported to provide dynamic defaults for each component instance.

This module was created with dynamic getters in mind. Because a getter is a function you could do anything in the function body (for example call an API). I havent found a use case for it, but sure do mention it if you do.

## Example

```ts
// ESNext / Typescript syntax
angular.module('yourApp', ['ng-sane-defaults']).component('yourComponent', {
    template: `<p>{{ $ctrl.text }}</p>`,
    bindings: {
        text: '<'
    },
    controller: class yourComponentController {
        static $defaults = {
            text: 'Some Default Text'
        };
    }
});
```

```js
// ES5 syntax
(function() {
    function yourComponentController() {}

    yourComponentController.$defaults = {
        text: 'Some Default Text'
    };

    angular.module('yourApp', ['ng-sane-defaults']).component('yourComponent', {
        template: `<p>{{ $ctrl.text }}</p>`,
        bindings: {
            text: '<'
        },
        controller: yourComponentController
    });
})();
```

```js
// getter example
(function() {
    let i = 0; // will get incremented on every new component

    class yourComponentController {
        static get $defaults() {
            return {
                text: `Some Dynamic ${i++} text`
            };
        }
    }

    angular
        .module('yourApp', ['ng-sane-defaults'])
        .component('yourComponentController', {
            template: `<p>{{ $ctrl.text }}</p>`,
            bindings: {
                text: '<'
            },
            controller: yourComponentController
        });
})();
```

The following HTML should work for any of the examples, check out `playground.html` to see it in action

```html
<your-component-controller />
<!-- still works for bound undefined values -->
<your-component-controller text="undefined" />
<!-- and null (can be turned of with `config.checkNull = false` -->
<your-component-controller text="null" />
```

## How it works

It currently works by [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) the angular core `registerComponent` function on the `$compileProvider` factory function. It extends (or creates) the `$onInit` function to check if the controller has `undefined` or `null` values if its key is present in the `$defaults` object.
If you have defined your own `$onInit` lifecycle hook it will be invoked after the `$defaults` values are set.
