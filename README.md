# ng-sane-defaults
AngularJS extension that provides a sane way to define component defaults

## Description
This module was written to solve the problem of not having a nice non-biolerplatey way of providing default values for components. Another problem it attempts to solve is to prevent the default value not applying if a value was provided trough bindings but the value is `undefined` or `null`.

The module works by using a static property on the component controller called `$defaults`. Getter functions are also supported to provide dynamic defaults for each component instance.

> NOTE: You cannot set static variables on a class in ES6 syntax. Either use a superset which allowes it (Typescript, ESNext), use a getter or set it on the class itself like `class A {}; A.staticVar = 2;`. Or don't use ES6 classes (and lose your sanity).

This module was created with dynamic getters in mind. Because it is a function you could do anything in the function body (for example call an API). I havent found a use case for it, but sure do mention it if you do.

## Example
```js 
// ESNext / Typescript syntax
angular.module('yourApp', ['ng-sane-defaults'])
  .component('yourComponent', {
    template: `<p>{{ $ctrl.text }}</p>`,
    bindings: {
      text: '<'
    },
    controller: class yourComponentController{
      static $defaults = {
        text: 'Some Default Text'
      }
    }
  });
```

```js
// ES5 syntax
(function () {
  function yourComponentController() {}
  
  yourComponentController.$defaults = {
    text: 'Some Default Text'
  }
  
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
  
  angular.module('yourApp', ['ng-sane-defaults']).component('yourComponentController', {
    template: `<p>{{ $ctrl.text }}</p>`,
    bindings: {
      text: '<'
    },
    controller: yourComponentController
  });
})();
```
The following HTML should work for any of the examples
```html
<your-component-controller />
<!-- still works for bound undefined values -->
<your-component-controller text="undefined" />
<!-- and null -->
<your-component-controller text="null" />
```

## How it works
It currently works by [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) the angular core `registerComponent` function on the `$compileProvider` factory function. It overides (or creates) the `$onInit` function to check if any given keys in the `$defaults` object are `undefined` or `null` on the controller instance and sets the value if they are.

## Todo's
- [ ] Support directive controllers (which would also support components by default)
- [ ] Use the angularjs `decorator` and `delegate` API
- [ ] Automate the publish and build process
- [ ] allow for configuration to not test for `null` values
