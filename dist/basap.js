(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import angular from 'angular';

if (!angular) angular = window.angular;

/**
 * Represents Area module containing its components.
 * @class
 */

var Area = function () {

    /**
     * Area constructor.
     * @contructor
     * @param name - the area name.
     * @param [deps] - module dependencies.
     * @param [options] - area options.
     */

    function Area(name, deps, options) {
        _classCallCheck(this, Area);

        if (!angular.isArray(deps) && angular.isObject(deps)) {
            options = deps;
            deps = undefined;
        }

        // allow passing deps in options.
        if (options.dependencies) {
            deps = options.dependencies;
            delete options.dependencies;
        }

        // store original options
        // this simple provides a way
        // to pass any option the user
        // may wish and access by
        // app.$area.current.options[ /* YOUR_OPTION */ ]
        this.options = angular.copy(options || {});

        /* Public properties
        ***********************************/

        // the area name
        this.name = name;

        // enables baseCtrl titles
        // to display a name other than
        // the area name.
        this.title = undefined;

        // the namespace for the area.
        this.ns = undefined;

        // area module dependencies.
        this.dependencies = deps || [];

        // area base by default is set to
        // the area name. areaBase
        // prefixes routeBase, templateBase
        // and componentBase if defined
        // set to false to ignore.
        this.areaBase = undefined;

        // prefix routes with this string.
        this.routeBase = undefined;

        // prefix template and component paths.
        this.viewBase = undefined;

        // prefix template url with this string.
        this.templateBase = undefined;

        // base path for components.
        this.componentBase = undefined;

        // expression name used when
        // defining route controllers with
        // controller as syntax.
        // this is only used for ngRoute
        // & uiRouter where the route
        // options contain a key called
        // "component". results in an
        // auto generated controller
        // ex: { controller:
        // 'SomeController as ctrl' }
        this.controllerAs = undefined;

        // Basap needs to know what controller
        // suffix to use when wiring up
        // component controllers.
        this.controllerSuffix = undefined;

        // This method if defined enables
        // you to define how controller
        // names are generated when a component
        // is being componentized. when called
        // two params are injected, the first
        // being the component name, the second
        // being the complete route config.
        // You MUST return a string to be
        // used for the controller name.
        //
        // By default
        // controller names are generated based
        // on the "component" property name.
        // these names are always capitalized.
        // if a component is specified as
        // component: 'some/component' and
        // the controller suffix is 'ctrl' it
        // will become and look to use a controller
        // named 'SomeComponentCtrl'.
        this.onControllerName = undefined;

        // when creating a component
        // this callback can be defined
        // so that you can alter the
        // componetized options for
        // defining the component.
        // the callback injects
        // the config object, and the
        // area configuration. expects
        // and object to be returned
        // containing the config object.
        // basically this method does
        // the heavy liften then lets
        // you tweak controller names
        // paths and urls.
        this.onComponetize = undefined;

        // disable the area.
        this.inactive = false;

        // The areas security access levels.
        // The property is attached to each route
        // in the area. it is used for filtering
        // and preventing access to routes based on
        // access level.
        this.acl = undefined;

        // do not allow "name" to be
        // passed within options.
        delete options.name;

        // extend w/ options.
        if (options) angular.extend(this, options);

        // check if template/componentBase
        // have values if not inherit from
        // viewBase.
        if (!this.templateBase) this.templateBase = this.viewBase;

        if (!this.componentBase) this.componentBase = this.viewBase;

        // ensure the display name.
        this.title = this.title !== undefined ? this.title : this.name;

        // check if areaBase is enabled.
        if (this.areaBase !== false) {
            // if areaBase is string use
            // it otherwise set to area name.
            if (!angular.isString(this.areaBase)) this.areaBase = '/' + this.name;
        }

        /* Components
        ***********************************/

        // wrapper function for calling
        // this.component by a type.
        function componentWrapper(type) {
            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                args.unshift(type);
                this.component.apply(this, args);
            };
        }

        // add helper methods.
        this.controller = componentWrapper('controller');
        this.factory = componentWrapper('factory');
        this.service = componentWrapper('service');
        this.directive = componentWrapper('directive');
        this.filter = componentWrapper('filter');
        this.constant = componentWrapper('constant');
        this.value = componentWrapper('value');
        this.decorator = componentWrapper('decorator');

        /* Private properties
        ***********************************/

        Object.defineProperties(this, {

            // track area initialization
            _initialized: {
                value: false,
                writable: true
            },

            // collection of route configs.
            _routes: {
                value: [],
                writable: true
            },

            // ngNewRouter component, controller
            // and template mapping for components.
            _mappings: {
                value: [],
                writable: true
            },

            // collection of component configs.
            _components: {
                value: [],
                writable: true
            },

            // contains list of controllers,
            // for comparing to required.
            _controllers: {
                value: [],
                writable: true
            }
        });

        return this;
    }

    /**
     * Iterate object setting base paths.
     * @param base - the base path to prefix routes.
     * @param key - the property to update or array of property strings.
     * @param obj - the route configuration object
     */


    _createClass(Area, [{
        key: 'setBase',
        value: function setBase(base, key, obj) {

            var self = this;

            // allows passing two strs
            // the base path and the route path.
            if (arguments.length === 2) {
                obj = key;
                key = base;
                base = undefined;
            }

            // checks if val is in array.
            function contains(arr, val) {
                return arr.indexOf(val) !== -1;
            }

            // joins two strings.
            // Todo: test make sure works in all scenarios.
            function join(b, p) {
                var result = void 0;
                b = b || '';
                // ensure . or / as first char.
                if (b && !/^(\.|\/)/.test(p)) p = '/' + p;
                // remove last char if backslash.
                if (/\/$/.test(p) && p.length > 1) p = p.slice(0, -1);
                // ensure no double backslashes
                result = b + p;
                result = result.replace(/\\/g, '/');
                return result;
            }

            // iterate object's properties and
            // nested properties.
            function iterateConfig(o) {
                for (var prop in o) {
                    if (o.hasOwnProperty(prop)) {
                        if (angular.isObject(o[prop]) && !angular.isArray(0[prop])) {
                            iterateConfig(o[prop]);
                        } else {
                            if (contains(key, prop)) {
                                // check if path starts with mount path
                                // if true and is view path check if
                                // should be static, saves some aggrevation.
                                if (self.mount && self.mount.length) {
                                    var mount = self.mount;
                                    if (mount.charAt(0) === '/') mount = mount.replace(/^\//, '');
                                    var regexp = new RegExp('(/' + mount + '|' + mount + ')');
                                    if (prop === 'templateUrl' && regexp.test(o[prop])) {
                                        o.staticView = true;
                                    }
                                }
                                // don't join static routes or views.
                                if (!o.staticView && !o.staticRoute) o[prop] = join(base, o[prop]);

                                if (o[prop] !== '/') o[prop] = o[prop].replace(/\/$/, '');
                            }
                        }
                    }
                }
                return o;
            }

            // if object is string (uiRouter)
            // then join with base.
            if (angular.isString(obj)) {
                return join(base, obj);
            }

            // if typeof object iterate
            // and return the result.
            else {
                    if (!angular.isArray(key)) key = [key];
                    return iterateConfig(obj);
                }
        }

        /**
         * Enables mapping of template &
         * name within components.
         * NOTE: valid only for ngNewRouter
         * @see https://angular.github.io/router/$componentLoaderProvider
         * @param type - the type of component loader to run.
         * @param mapping - the mapping function to be called.
         */

    }, {
        key: 'setMapping',
        value: function setMapping(type, mapping) {

            if (this.routerName !== 'ngNewRouter') throw new Error('Method setMapping is not implemented for ' + this.routerName);

            var map = {
                controller: 'setCtrlNameMapping',
                template: 'setTemplateMapping',
                component: 'setComponentFromCtrlMapping'
            };

            // if not in map try reverse
            // lookup by values.
            if (!map[type]) {
                var values = Object.keys(map).map(function (k) {
                    return map[k];
                });
                type = this.basap.contains(values, type, false);
                if (!type) throw new Error('Failed to set mapping of type ' + type + ', the type is invalid.');
            } else {
                type = map[type];
            }

            this._mappings.push([type, mapping]);
        }

        /**
         * Updates base paths after area has been created.
         * This is useful when you want to set options in
         * basap and you want changes to be reflected in
         * @returns {Area}
         */

    }, {
        key: 'reBase',
        value: function reBase() {

            var baseKeys = ['routerName', 'routerConfig', 'access', 'inherit', 'componentBase', 'onComponetize', 'routeBase', 'templateBase', 'controllerSuffix', 'controllerAs', 'areaKey', 'aclKey', 'onControllerName', 'mount'],
                area = this,
                basap = this.basap;

            baseKeys.forEach(function (k) {

                // if not a base type
                // and area's key has no
                // value, simply update
                // from app options property.
                if (!basap.contains(['routeBase', 'templateBase', 'componentBase'], k)) {
                    if (area[k] === undefined) area[k] = basap[k];
                }
                // if key is a base type
                // check for prepends and
                // overrides.
                else {
                        // prepend base paths to area paths.
                        var tmpBase = area[k] !== undefined ? area[k] : '';

                        // if tmpBase is false
                        // set to empty string and return.
                        if (tmpBase === false) {
                            area[k] = '';
                            return;
                        }

                        // routes usually need to be
                        // as defined if basap and
                        // area routeBase both undefined
                        // set to empty string and return.
                        if (k === 'routeBase' && basap[k] === undefined && area[k] === undefined) {
                            area[k] = '';
                            return;
                        }

                        // set area base.
                        if (area.areaBase) tmpBase = area.areaBase + '/' + tmpBase;

                        // ensure first char is backslash.
                        if (tmpBase.charAt(0) !== '/') tmpBase = '/' + tmpBase;

                        // if no tmpBase but base options
                        // contain value of same base
                        // type allow it to populate
                        // the base path.
                        if (!tmpBase || !tmpBase.length && basap[k] && basap[k].length) tmpBase = basap[k];

                        // check for mount point.
                        // routeBase should NOT be
                        // prepended with mount point.
                        if (k !== 'routeBase') tmpBase = (basap.mount || '') + '/' + tmpBase;

                        // ensure no double backslashes.
                        tmpBase = tmpBase.replace(/\/\//g, '/');

                        // remove trailing slash.
                        tmpBase = tmpBase.replace(/\/$/, '');

                        // finally update the base type
                        // with the tmpBase value.
                        area[k] = tmpBase || '';
                    }
            });

            return this;
        }

        /**
         * Normalizes controller names to prevent
         * casing issues or invalid suffix when
         * using component feature.
         * @param name
         * @returns {string}
         */

    }, {
        key: 'normalizeCtrlName',
        value: function normalizeCtrlName(name) {

            var key = name,
                suffix = this.controllerSuffix;

            // if string starts with "/" remove.
            if (/^\//.test(key)) key = key.slice(1);

            // check for user normalize func.
            if (angular.isFunction(this.onControllerName)) {
                key = this.onControllerName(key);
            } else {

                // make sure suffix is cap.
                suffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

                // split key
                key = key.split('/');
                key = key.map(function (k) {
                    return k.charAt(0).toUpperCase() + k.slice(1);
                });
                key = key.join('');

                if (!suffix) return key;

                // attempt to normalize controller
                // name to prevent mis-namiing &
                // casing issues. when used with
                // components.
                var normExp = new RegExp('(Controller|Ctrl|Con|Ctrls|' + this.controllerSuffix + ')$', 'gi');
                key = key.replace(normExp, '');

                // combine key & suffix.
                key = '' + key + suffix;
            }

            return key;
        }

        /**
         * Registers Angular component by type.
         * Register multiple by passing object of
         * components as second param.
         * @param type - controller, directive, factory,
         * service, filter, constant, value or decorator.
         * @param name - the name of the component.
         * @param component - the component itself.
         * @returns {Area}
         */

    }, {
        key: 'component',
        value: function component(type, name, _component) {

            var self = this;

            if (!type) return this;

            function addComponent(t, c) {
                // iterate components add to collection.
                Object.keys(c).forEach(function (k) {
                    var key = k;
                    // componentize key if type controller
                    //if(t === 'controller' && self.componentBase){
                    if (t === 'controller') {
                        key = self.normalizeCtrlName(key);
                        self._controllers.push(k);
                    }
                    self._components.push([t, key, c[k]]);
                });
            }

            // ensure module is loaded
            if (!this.module && !this.module.config) throw new Error('Failed to register component ' + name + ', the module is not loaded.');

            // if only one argument assume
            // object containing collection
            // of component types.
            if (arguments.length === 1) {

                if (!angular.isObject(type) && !angular.isArray(type)) throw new Error('Failed to load component collection of type ' + (typeof type === 'undefined' ? 'undefined' : _typeof(type)) + '.');

                Object.keys(type).forEach(function (k) {
                    addComponent(k, type[k]);
                });
            } else {

                // lower and strip plural.
                type = type.toLowerCase();
                if (type === 'factories') type = 'factory';
                type = type.replace(/s$/, '');

                // allow component object as
                // second argument.
                if (angular.isObject(name) && !angular.isArray(name)) {
                    _component = name;
                    name = undefined;
                }

                // normalize single component to object.
                if (angular.isString(name)) {
                    var orig = _component;
                    _component = {};
                    _component[name] = orig;
                }
                addComponent(type, _component);
            }

            return this;
        }

        /**
         * Simply calls component.
         * @returns {Area}
         */

    }, {
        key: 'components',
        value: function components() {
            return this.component.apply(this, arguments);
        }

        /**
         * Add route to routes collection. Accepts path/state &
         * options object or object containing keys representing
         * states/paths whose values contain route configuration
         * objects. You may also pass an array of objects in this
         * case the Array containing configuration objects must
         * have a property named "path" for ngRoute/ngRouterNew and a
         * property named "state" for ui.router.
         *
         * NOTE: when using routeBase which is set to true by
         * default you should set your main or root route
         * to "root:true" in the route config. This tells Basap
         * NOT to prefix this route with a base. To disable
         * set routeBase to false. You may also set root:true
         * on the area config to apply to all routes in the area.
         *
         * [ngRoute]
         * ex: Single Route
         * area.when('/route/path', { // options });
         *
         * ex: Object of Routes.
         * area.when({
         *    '/home': { templateUrl: '/home.html' },
         *
         *    NOTE: since "contacts" here is not a path Basap will
         *    look to the "path" key in the options as show below.
         *    contacts: { path: '/contact', templateUrl: '/contact.html' },
         *
         *    '/about: { templateUrl: '/about.html' }
         * });
         *
         * ex: Array of Objects
         * area.when([
         *      { path: '/home', templateUrl: '/path/to/template' },
         *      { path: '/about', templateUrl: '/path/to/template' }
         * ]);
         *
         * [ui.router]
         * ex: Single Route
         * area.when('state_name', { // options });
         *
         * ex: Object of Routes.
         * area.when({
         *    home: { url: '/home', templateUrl: '/home.html' },
         *
         *    NOTE: since "state" is specified the property key
         *    of "users" is overriden in this cause using the singular
         *    "user" instead of the default "users".
         *    users: { state: 'user', url: '/user', templateUrl: '/user.html' },
         *
         *    about: { url: '/about', templateUrl: '/about.html' }
         * });
         *
         * ex: Array of Objects
         * area.when([
         *      { state: 'home', url: '/home', templateUrl: '/path/to/template' },
         *      { state: 'about', url: '/about', templateUrl: '/path/to/template' }
         * ]);
         *
         * [ngRouterNew]
         * ex: Single Route
         * area.when('/route/path', { // options });
         *
         * ex: Object of Routes.
         * area.when({
         *      home: { path: '/home', component: 'public' },
         *      about: { path: '/about', component: 'public' }
         * ]);
         *
         * ex: Array of Objects
         * area.when([
         *      { path: '/home', component: 'public' },
         *      { path: '/about', component: 'public' }
         * ]);
         *
         * @param path - the path or state for the route.
         * @param options - the route configuration object.
         * @returns {Area}
         */

    }, {
        key: 'when',
        value: function when(path, options) {

            var self = this,
                routerName = this.routerName,
                key;

            // get the path or overridden path.
            function getPath(key, route) {
                if (routerName === 'ngRoute' || routerName === 'ngNewRouter') {
                    route.path = route.path || key;
                    key = route.path || key;
                    key = self.setBase(self.routeBase, key);
                }

                if (routerName === 'uiRouter' && route.state !== undefined) {
                    route.url = route.url || route.path;
                    route.path = route.url;
                    key = route.state || key;
                    delete route.state;
                }
                return key;
            }

            // when router is ngRoute or uiRouter
            // if options contains "component"
            // componentize the configuration
            // options for the route.
            function generateComponent(base, opts) {

                var templateUrl = void 0;

                templateUrl = opts.component;

                // set the genrated templateUrl
                // and the generated controller.
                if (templateUrl) {

                    // if string starts with "/" remove.
                    if (/^\//.test(templateUrl)) templateUrl = templateUrl.slice(1);

                    var name = templateUrl.split('/').pop();

                    opts.templateUrl = templateUrl + '/' + name + '.html';

                    // if controller exists
                    // assume user defined.
                    if (!opts.controller) {

                        opts.controllerName = self.normalizeCtrlName(templateUrl);

                        opts.controller = opts.controllerName;

                        if (self.controllerAs !== false && opts.controllerAs !== false) opts.controller = opts.controller + ' as ' + self.controllerAs;
                    }

                    if (self.basap.lowerPaths !== false) opts.templateUrl = opts.templateUrl.toLowerCase();

                    // check for user componetized callback.
                    if (self.onComponetize) {
                        // create clone in case undefined is returned.
                        var clone = angular.copy(opts);
                        opts = self.onComponetize.call(opts, self);
                        if (!opts) opts = clone;
                    }

                    opts = self.setBase(base, ['templateUrl'], opts);
                }

                return opts;
            }

            // iterate the views or children object
            // generating the templateUrls and controllers
            function iterateUiComponents(base, obj) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (prop === 'children') {
                            obj[prop].forEach(function (c, i) {
                                obj[prop][i] = iterateUiComponents(base, c);
                            });
                        }
                        if (angular.isObject(obj[prop])) {
                            iterateUiComponents(base, obj[prop]);
                        }
                    }
                }

                if (obj.component) {
                    obj = generateComponent(base, obj);
                }
                if (obj.templateUrl && !obj.component) {
                    obj = self.setBase(self.templateBase, ['templateUrl'], obj);
                }

                return obj;
            }

            // normalize paths where base
            // path or template has been
            // provided as prefix.
            function normalizeOptions(opts) {

                opts = self.setBase(self.routeBase, ['url'], opts);

                if (routerName !== 'ngNewRouter') {
                    // componentize uiRouter and ngRoute.
                    if (!self.basap.contains(Object.keys(opts), ['views', 'children', 'component'])) {
                        if (!opts.staticView) opts = self.setBase(self.templateBase, ['templateUrl'], opts);
                    } else {
                        if (!angular.isString(self.componentBase)) throw new Error('To use components with ' + routerName + ' componentBase must be string/empty string.');
                        if (routerName === 'ngRoute') {
                            opts = generateComponent(self.componentBase, opts);
                        } else {
                            opts = iterateUiComponents(self.componentBase, opts);
                        }
                    }
                }

                return opts;
            }

            // normalizes array which is used
            // to apply when calling provider or $router.config.
            function normalizeRouteArray(key, options) {
                if (routerName === 'ngNewRouter') {
                    options.path = key;
                    return [options];
                } else {
                    return [key, options];
                }
            }

            // iterate an object of
            // route configurations.
            if (angular.isObject(path) && !angular.isArray(path)) {
                Object.keys(path).forEach(function (r) {
                    var route = path[r];
                    key = getPath(r, route);
                    if (self.basap.lowerPaths !== false) key = key.toLowerCase();
                    if (r !== 'otherwise' && !angular.isFunction(route)) {
                        route[self.areaKey] = self.name;
                        route[self.aclKey] = route[self.aclKey] || self.acl;
                        self._routes.push(normalizeRouteArray(key, normalizeOptions(route)));
                    } else {
                        self._routes.push(['otherwise', route]);
                    }
                });
            }

            // iterate array of route configurations.
            else if (angular.isArray(path)) {
                    path.forEach(function (route) {
                        key = getPath(null, route);
                        if (key) {
                            route[self.areaKey] = self.name;
                            route[self.aclKey] = route[self.aclKey] || self.acl;
                            if (self.basap.lowerPaths !== false) key = key.toLowerCase();
                            self._routes.push(normalizeRouteArray(key, normalizeOptions(route)));
                        }
                    });
                }

                // process single route w/ options.
                else {
                        var isValid = angular.isString(options) || angular.isObject(options);
                        if (arguments.length !== 2 || !isValid) {
                            throw new Error('Route ' + path + ' could not be registered, the configuration invalid.');
                        } else {

                            // if options is string
                            // assume redirect.
                            if (angular.isString(options)) {
                                options = { redirectTo: options };
                            }

                            if (angular.isObject(options)) {
                                key = getPath(path, options);
                                options[self.areaKey] = self.name;
                                options[self.aclKey] = self.acl;
                                options[self.aclKey] = options[self.aclKey] || self.acl;
                                if (self.basap.lowerPaths !== false) key = key.toLowerCase();
                                self._routes.push(normalizeRouteArray(key, normalizeOptions(options)));
                            }
                        }
                    }

            return this;
        }

        /**
         * Add otherwise to routes collection.
         * if path starts with "." or object
         * contains "static:true" the path
         * is considered static and is not
         * relative to the area within it
         * resides. The full path will be
         * used.
         * @param path - path, object or function.
         * @returns {Area}
         */

    }, {
        key: 'otherwise',
        value: function otherwise(path) {
            if (angular.isString(path) && !/^\./.test(path)) {
                path = this.setBase(this.routeBase, path);
                path = path.replace(/^\./, '');
            }
            if (angular.isObject(path) && path.redirectTo && !/^\./.test(path.redirectTo) && !path.static) {
                path.redirectTo = this.setBase(this.routeBase, path.redirectTo);
                path.redirectTo = path.redirectTo.replace(/^\./, '');
            }
            this._routes.push(['otherwise', path]);
            return this;
        }

        /**
         * Adds custom configure function to module.
         * this is merely a convenience wrapper
         * @param [fn] - the function to exec or array containing dependencies.
         * @returns {Area}
         */

    }, {
        key: 'config',
        value: function config(fn) {
            if (fn) this.module.config.apply(this, arguments);
            return this;
        }

        /**
         * Adds custom run function to module.
         * this is merely a convenience wrapper.
         * @param [fn] - the function to exec or array including dependencies.
         * @returns {Area}
         */

    }, {
        key: 'run',
        value: function run(fn) {
            if (fn) this.module.run.apply(this, arguments);
            return this;
        }

        /**
         * Initialize the area.
         * @returns {Area}
         */

    }, {
        key: 'init',
        value: function init() {

            // prevent duplicate initializations.
            if (this._initialized) throw new Error(this.ns + ' attempted to init but has already been initialized.');

            var self = this,
                _module = this.module;

            function DummyCtrl() {}

            function normalizeComponentCtrls(obj, providers) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (prop === 'children') {
                            obj[prop].forEach(function (c, i) {
                                obj[prop][i] = normalizeComponentCtrls(c, providers);
                            });
                        }
                        if (angular.isObject(obj[prop])) {
                            normalizeComponentCtrls(obj[prop], providers);
                        }
                    }
                }
                // Add dummy controlller when
                // defined controller not found.
                if (obj.component) {
                    if (!self.basap.contains(self._controllers, obj.controllerName)) providers.controller(obj.controllerName, DummyCtrl);
                }
                return obj;
            }

            // expose provider register methods.
            function config($injector) {

                // get all providers from app instance.
                var providers = self.basap.providers($injector);

                // set any mappings that are required.
                if (self.routerName === 'ngNewRouter') {
                    self._mappings.forEach(function (m) {
                        var type = m.shift();
                        providers.loader[type].apply(null, m);
                    });
                }

                // register components.
                self._components.forEach(function (k) {
                    var type = k[0];
                    if (angular.isString(type) && providers[type]) {
                        k.shift();
                        providers[type].apply(null, k);
                    } else {
                        throw new Error('Component type ' + type + ' invalid configuration or not supported.');
                    }
                });

                // if ngRoute or uiRouter use injector
                // to get route/otherwise providers
                // then inject routes.
                if (self.routerName === 'ngRoute' || self.routerName === 'uiRouter') {
                    self._routes.forEach(function (r) {
                        var key = r[0],
                            opts = r[1],
                            reqCtrl = void 0;
                        if (key === 'otherwise') {
                            // strip first element.
                            r.shift();
                            providers.otherwise[self.routerConfig.otherwiseMethod].apply(providers.otherwise, r);
                        } else {
                            // if component, check for
                            // valid controller if not exists
                            // inject noop dummy controller.
                            if (opts) {
                                if (opts.component) {
                                    //self.normalizeCtrlName(opts.component);
                                    if (!self.basap.contains(self._controllers, opts.controllerName)) providers.controller(opts.controllerName, DummyCtrl);
                                }
                                // interate for nested ui-router
                                // controller components.
                                else {
                                        normalizeComponentCtrls(opts, providers);
                                    }
                            }

                            if (self.routerName === 'uiRouter' && opts && opts.redirectTo) providers.otherwise.when.call(providers.otherwise, opts.url, opts.redirectTo);else providers.route[self.routerConfig.whenMethod].apply(providers.route, r);
                        }
                    });
                }
            }
            config.$inject = ['$injector'];

            // add configuration block.
            _module.config(config);

            // set initialized to true
            // prevent duplicate inits.
            this._initialized = true;
            return this;
        }
    }]);

    return Area;
}();

exports.default = Area;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //import Logger from './logger';


var _area = require('./area');

var _area2 = _interopRequireDefault(_area);

var _configs = require('./configs');

var _configs2 = _interopRequireDefault(_configs);

var _baseCtrl = require('./baseCtrl');

var _baseCtrl2 = _interopRequireDefault(_baseCtrl);

var _routeCtrl = require('./routeCtrl');

var _routeCtrl2 = _interopRequireDefault(_routeCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (!angular) angular = window.angular;

/**
 * Angular application.
 * @class
 */

var Base = function () {

    /**
     * Base constructor.
     * @constructor
     * @param ns - the app namespace
     * @param [deps] - the main module dependencies.
     * @param [options] - area default options.
     * @returns {Base}
     */

    function Base(ns, deps, options) {
        _classCallCheck(this, Base);

        // normalize route module name.
        function normalizeRouter(m) {
            if (m.indexOf('.') !== -1) {
                m = m.split('.');
                if (angular.isArray(m)) return m[0] + m[1].charAt(0).toUpperCase() + m[1].slice(1);
                return m + m.charAt(0).toUpperCase() + m.slice(1);
            }
            return m;
        }

        // lookup verify supported router.
        // TODO: need to change this so can't be found other than by initial array of deps.
        function lookupRouter(arr) {
            arr = arr || [];
            var filtered = arr.filter(function (a) {
                return (/^(ngRoute|ngNewRouter|ui\.router)$/.test(a)
                );
            });
            if (filtered.length > 1) throw new Error('Only one router can be initialized\n            attempted to initialize with ' + filtered.join(', '));
            if (!filtered || !filtered.length) throw new Error('Attempted to initialize using router module of undefined. ' + 'Supported Modules: ngRoute, ngNewRouter, ui.router');
            return normalizeRouter(filtered[0]);
        }

        if (!angular.isString(ns)) {
            if (angular.isObject(ns) && !angular.isArray(ns)) {
                options = ns;
                deps = undefined;
                ns = undefined;
            }
            if (angular.isArray(ns)) {
                options = deps;
                deps = ns;
                ns = undefined;
            }
        }

        // allow options as second arg.
        if (!angular.isArray(deps) && angular.isObject(deps)) {
            options = deps;
            deps = undefined;
        }

        options = options || {};

        // allow dependencies in options
        if (options.dependencies) {
            deps = options.dependencies;
            delete options.dependencies;
        }

        // define root namespace for app.
        this.ns = ns || 'app';

        // an alternate name used in page
        // title. in some cases you may wish
        // to use an abbreviated ns which would
        // not good for display this property
        // allows for displaying a more readable
        // title.
        this.name = undefined;

        // main module dependencies.
        this.dependencies = deps || [];

        // create module
        this.module = angular.module(this.ns, this.dependencies);

        // the element to bootstrap
        this.element = document;

        // app areas.
        this.areas = {};

        // enable/disable html5 mode.
        this.html5Mode = undefined;

        // globally prefixes all base
        // paths. used when entire directory
        // is within a sub dir from the
        // web servers's root path.
        // NOTE: unlike mounting a router
        // this only mounts the template
        // and component paths NOT your
        // routes.
        this.mount = '';

        // globally prepends route paths.
        this.routeBase = undefined;

        // globally prepends view and
        // component paths.
        this.viewBase = '';

        // globally prepends view paths.
        this.templateBase = '';

        // global path for components.
        this.componentBase = '';

        // lower route paths.
        // undefined or true paths
        // are lowered.
        this.lowerPaths = undefined;

        // the expression name used for
        // "controller" property in routes.
        // when componetizing routes for
        // ngRoute/uiRoute ONLY the controller is
        // added to the options as
        // follows: SomeController as ctrl.
        // where ctrl is the property defined
        // below.
        this.controllerAs = 'ctrl';

        // Basap needs to know what controller
        // suffix to use when wiring up
        // component controllers.
        this.controllerSuffix = undefined;

        // This method if defined enables
        // you to define how controller
        // names are generated when a component
        // is being componentized. when called
        // two params are injected, the first
        // being the component name, the second
        // being the complete route config.
        // You MUST return a string to be
        // used for the controller name.
        //
        // By default
        // controller names are generated based
        // on the "component" property name.
        // these names are always capitalized.
        // if a component is specified as
        // component: 'some/component' and
        // the controller suffix is 'ctrl' it
        // will become and look to use a controller
        // named 'SomeComponentCtrl'.
        this.onControllerName = undefined;

        // when creating a component
        // this callback can be defined
        // so that you can alter the
        // componetized options for
        // defining the component.
        // the callback injects
        // the config object, and the
        // area configuration. expects
        // and object to be returned
        // containing the config object.
        // basically this method does
        // the heavy liften then lets
        // you tweak controller names
        // paths and urls.
        this.onComponetize = undefined;

        // when not false instance
        // add $app to window.
        this.globalize = true;

        // if you wish to change the name of the
        // global you can do so here.
        // NOTE: this will not change the name
        // of the Angualar factory that is
        // exposed this will still be "$basap"
        this.globalizeAs = '$basap';

        // global based controller.
        this.BaseCtrl = _baseCtrl2.default;

        // extends BaseCtrl with
        // custom methods/properties.
        this.baseExtend = undefined;

        // the element the base controller
        // should be bound to, must be
        // unique html tag or id.
        this.baseElement = 'html';

        // the element to bind the RouteCtrl to
        // only used with ngNewRouter, must be
        // unique html tag or id.
        this.routerElement = 'body';

        // Default logger configuration.
        // Http requests are made via a
        // simple API. The object accepts
        // the following properties.
        //var logger = {
        //    globalize       undefined,        // when NOT false logger is added to window as $log.
        //    console:        undefined,        // when NOT false messages are logged to the console.
        //    remote:         false,            // when true logs are posted to server, otherwise only console.
        //    level:          'error',          // current log level supports 'error', 'warn', 'info', 'debug'.
        //    method:         'POST',           // method to use to post to server.
        //    path:           '/api/log/client' // the endpoint on the server.
        //    headers:        {}                // ex: contentType (IMPORTANT keys must be in camelcase).
        //    async:          true              // default for XMLHttpRequests is true for asynchronous.
        //    username:       undefined         // username to be use with credentials.
        //    password:       undefined         // same as above.
        //};

        // whether or not to enabled
        // logger can either be set to
        // true, false a config object
        // or a function that provides
        // context to basap.
        // if true the default config
        // is used.
        // essentially this is merely a
        // wrapper to the browser's console
        // its usefulness is in sending
        // the log payload to the server
        // in a convenient way.
        //this.logger = undefined;

        // the key name added to $rootScope.
        this.areaKey = '$area';

        // The property name used when
        // attaching security lists to area routes.
        this.aclKey = 'acl';

        // extend options.
        angular.extend(this, options);

        // ensure we have a name for display.
        this.name = this.name || this.ns;

        // check if template/componentBase
        // have values if not inherit from
        // viewBase.
        if (!this.templateBase) this.templateBase = this.viewBase;

        if (!this.componentBase) this.componentBase = this.viewBase;

        // check if logger is enabled.
        // if(this.logger !== false)
        //     this.logger = this.logger || true;
        //
        // // create logger instance.
        // this.log = new Logger(this.logger, this.module);

        // globalize logger if enabled.
        if (this.log.options.globalize !== false) window.$log = this.log;

        // if globalized add to window
        // prefixed by $ (default: $app)
        if (this.globalize) window[this.globalizeAs] = this; //`${this.ns}`;

        // add base controller attr if defined.
        if (this.BaseCtrl) {
            var elem = this.query(this.baseElement);
            if (elem) elem.setAttribute('ng-controller', 'BaseCtrl as ' + this.ns);
        }

        // lookup the router
        this.routerName = lookupRouter(this.dependencies);

        // show ngNewRouter warning.
        if (this.routerName === 'ngNewRouter') {
            if (console && console.warn) {
                console.warn(this.routerName + ' is supported only as preview, should not be used in' + 'production. until more stable.');
            }
        }

        // if ngNewRouter add controller
        // expression to routerElement.
        if (this.routerName === 'ngNewRouter' && this.routerElement) {
            var _elem = this.query(this.routerElement);
            if (_elem) _elem.setAttribute('ng-controller', 'RouteCtrl as router');
        }

        // get router config.
        this.routerConfig = angular.extend(_configs2.default[this.routerName], this.routerConfig);

        // ensure controllerSuffix
        this.controllerSuffix = this.controllerSuffix || 'Ctrl';

        // private properties.
        Object.defineProperties(this, {
            _menu: {
                value: undefined,
                writable: true
            }
        });

        return this;
    }

    /**
     * Enables setting options after initializing basap.
     * This method however has no concept of timing.
     * For example you may wish to set a base path.
     * You must do this prior to calling app.when()
     * or the setting will have no effect. This likewise
     * applies to components and so on.
     * @param {String} key - the key anme to be updated.
     * @param {*} [value] - the value to be set.
     * @returns {Base}
     */


    _createClass(Base, [{
        key: 'set',
        value: function set(key, value) {
            if (angular.isObject(key)) angular.extend(this, key);else this[key] = value !== undefined ? value : this[key];
            return this;
        }

        /**
         * Simple check if value is
         * a boolean object.
         * @param val
         * @returns {boolean}
         */

    }, {
        key: 'isBoolean',
        value: function isBoolean(val) {
            return val === true || val === false;
        }

        /**
         * Try catch get provider.
         * make errors clear.
         * @param injector - instance of $injector.
         * @param provider - string value representing
         * @returns {function|boolean}
         */

    }, {
        key: 'tryInject',
        value: function tryInject(injector, provider) {
            try {
                return injector.get(provider);
            } catch (ex) {
                ex.message = 'Failed to inject ' + provider + ': ' + ex.message;
                throw ex;
            }
        }

        /**
         * Checks if value is containted in an Array.
         * @param arr - the array to parse.
         * @param values - an or Array or single value.
         * @param bool - if true (default) returns boolean otherwise value.
         * @returns {boolean|*}
         */

    }, {
        key: 'contains',
        value: function contains(arr, values, bool) {
            var self = this;
            bool = bool === undefined ? true : bool;
            if (!(values instanceof Array)) {
                var idx = arr.indexOf(values);
                if (bool) return idx !== -1;
                return arr[idx];
            } else {
                var _ret = function () {
                    var result = void 0;
                    values.forEach(function (v) {
                        if (!result) {
                            result = self.contains(arr, v, bool);
                        }
                    });
                    return {
                        v: result
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
        }

        /**
         * Helper using document.querySelector
         * @param elem - element to find.
         * @param all - weather to use selectorAll
         * @returns {*}
         */

    }, {
        key: 'query',
        value: function query(elem, all) {
            var selector = all ? 'querySelectorAll' : 'querySelector';
            return document[selector](elem);
        }

        /**
         * Async helper for looping arrays
         * this function is NOT a promise.
         * @param arr - the array to loop.
         * @param fn - the fn to call for each iteration.
         * @param pre - a fn to preprocess params injected into fn.
         * @param done - callback upon completion of iteration.
         */

    }, {
        key: 'async',
        value: function async(arr, fn, pre, done) {
            var i = 0,
                delay = 0;
            done = done || function () {};
            if (typeof pre !== 'function') {
                delay = pre;
                pre = undefined;
            }
            return setTimeout(function iter() {
                var params = void 0;
                if (i === arr.length) return done();
                // injects item, index.
                params = [arr[i], i++];
                // if pre call to get params.
                if (typeof pre === 'function') params = pre.apply(arr, params);
                // if not array convert apply to fn.
                if (!(params instanceof Array)) params = [params];
                fn.apply(arr, params);
                setTimeout(iter, delay);
            }, 0);
        }

        /**
         * Returns collection of routes
         * by area name or all.
         * if mapped returns url/path
         * with configuration object.
         * @param [area] - the area you wish to retrieve routes for.
         * @returns {Array}
         */

    }, {
        key: 'routes',
        value: function routes(area) {

            var self = this,
                routes = [];

            Object.keys(this.areas).forEach(function (a) {
                var _routes = self.areas[a]._routes;
                if (!area || a === area) routes = routes.concat(_routes);
            });

            // flatten routes.
            if (this.routerName === 'ngNewRouter') {
                routes = [].concat.apply([], routes);
            } else {
                // convert to array of objects.
                angular.forEach(routes, function (r, i) {
                    routes[i] = r[1];
                });
            }

            return routes;
        }

        /**
         * Returns list of providers for app.
         * @param injector
         * @returns {{}}
         */

    }, {
        key: 'providers',
        value: function providers(injector) {

            if (!injector) return;

            var providers = {
                location: this.tryInject(injector, '$locationProvider'),
                controller: this.tryInject(injector, '$controllerProvider').register,
                factory: this.tryInject(injector, '$provide').factory,
                service: this.tryInject(injector, '$provide').service,
                directive: this.tryInject(injector, '$compileProvider').directive,
                filter: this.tryInject(injector, '$filterProvider').register,
                value: this.tryInject(injector, '$provide').value,
                constant: this.tryInject(injector, '$provide').constant,
                decorator: this.tryInject(injector, '$provide').decorator
            };

            if (this.routerName === 'ngRoute' || this.routerName === 'uiRouter') {
                providers.route = this.tryInject(injector, this.routerConfig.provider);
                providers.otherwise = this.tryInject(injector, this.routerConfig.otherwiseProvider);
            } else {
                providers.loader = this.tryInject(injector, '$componentLoaderProvider');
            }

            return providers;
        }

        /**
         * Register's an area with app.
         * @param name - the name of the Area.
         * @param deps - area dependencies.
         * @param options - object of options.
         * @returns {Base}
         */

    }, {
        key: 'area',
        value: function area(name, deps, options) {

            var self = this,
                area;

            // if only area name provided get area.
            if (angular.isString(name) && arguments.length === 1) {
                if (!this.areas[name]) throw new Error('The area ' + name + ' could not be found.');
                return this.areas[name];
            }

            // allow namespace and
            // options only as params.
            if (arguments.length === 2 && angular.isObject(deps) && !angular.isArray(deps)) {
                options = deps;
                deps = undefined;
            }

            var regex = new RegExp('^(app|' + this.ns + ')', 'i');
            if (angular.isString(name)) name = name.replace(regex, '');

            options = options || {};

            // check for duplicates.
            if (this.areas[name]) throw new Error('Failed to register area ' + name + ' duplicate detected.');

            // create area instance.
            area = new _area2.default(name, options);

            // get area namespace.
            area.ns = area.ns || this.ns + '.' + name;

            // add the area as a dependency.
            // only if not deactivated.
            // area is created but will not
            // be loaded.
            if (!area.inactive) this.dependencies.push(area.ns);

            // create the module.
            area.module = angular.module(area.ns, area.dependencies);

            // expose app instance to area.
            area.basap = this;

            // set base paths.
            area.reBase();

            // get area routes or all routes.
            area.getRoutes = function getRoutes(all) {
                var area = all ? area.name : undefined;
                return self.routes(area);
            };

            // add the area to the collection.
            this.areas[area.name] = area;

            // return the area.
            return area;
        }

        /**
         * Gets & filters routes for menu.
         * If no filter is provided returns all
         * routes which contain a truthy "menu" property.
         * when a string is passed menu must match the string,
         * if an array is passed will match any value in the
         * array.
         *
         * The "menu" property may also be comma separated string,
         * when true the string is converted to an array amd then
         * matched against this enables a single route to have multiple
         * menus.
         *
         * ex: app.menu('public') where app is the namespace of your app.
         * the above would return all routes where "menu" equals 'public'.
         *
         * @param [filter] - filters routes with "menu" property accepts undefined, string or function.
         * @returns {array}
         */

    }, {
        key: 'menu',
        value: function menu(filter) {
            var _filter;
            // filter function.
            function filterRoutes(route) {

                if (!route) return;

                // if menu convert to object if string.
                if (route.menu && angular.isString(route.menu)) route.menu = { name: route.menu };

                route.menu = route.menu || {};

                // ensure valid route name.
                // title -  is used as the header title in page.
                // label - the name displayed as the link text in your menu.

                route.menu.label = route.menu.label || route.title || route.name;
                // check for ui-router state name
                if (/\./g.test(route.menu.label)) {
                    // split and pop last key in state name.
                    var tmp = route.menu.label.split('.');
                    route.menu.label = tmp.pop();
                }

                // if filter is undefined
                // return all where menu is truthy.
                if (filter === undefined) return route.menu;

                // ensure route.menu is defined.
                if (Object.keys(route.menu).length) {
                    // if string split to array
                    // after trimming whitespace.
                    if (angular.isString(route.menu.name)) {
                        var _ret2 = function () {
                            var found = false,
                                menu = void 0;
                            menu = route.menu.name.replace(/\s/g, '');
                            menu = menu.split(',');
                            menu.forEach(function (m) {
                                if (!found) found = m === filter;
                            });
                            return {
                                v: found
                            };
                        }();

                        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
                    }
                    return filter === route.menu.name;
                }
                return false;
            }
            _filter = filterRoutes;
            if (angular.isFunction(filter)) _filter = filter;
            // filter routes where "menu" property is present.
            this._menu = this.routes().filter(_filter);
            return this._menu;
        }

        /**
         * Adds custom configure function to module.
         * this is merely a convenience wrapper
         * @param [fn] - the function to exec or array containing dependencies.
         * @returns {Area}
         */

    }, {
        key: 'config',
        value: function config(fn) {
            if (fn) this.module.config.apply(this, arguments);
            return this;
        }

        /**
         * Adds custom run function to module.
         * this is merely a convenience wrapper.
         * @param [fn] - the function to exec or array including dependencies.
         * @returns {Base}
         */

    }, {
        key: 'run',
        value: function run(fn) {
            if (fn) this.module.run.apply(this, arguments);
            return this;
        }

        /**
         * Boostraps Angular app.
         * @param element - the element to bootstrap app.
         */

    }, {
        key: 'bootstrap',
        value: function bootstrap(element) {

            var self = this,
                _module = this.module;

            // check override of bound element.
            element = element || this.element;

            // main module config.
            function config($injector) {

                var providers = self.providers($injector);
                var mode = self.html5Mode !== undefined ? self.html5Mode : true;

                // set html5Mode.
                providers.location.html5Mode(mode);
            }
            config.$inject = ['$injector'];

            // add main router controller.
            // you can add nested routers
            // the below is simply the base router.
            if (self.routerName === 'ngNewRouter') {
                _module.controller('RouteCtrl', _routeCtrl2.default);
            }

            // expose basap as factory
            function BasapFact() {

                var _instance = self;

                // need to extend w/methods.
                _instance.routes = self.routes.bind(self);
                _instance.tryInject = self.tryInject.bind(self);
                _instance.contains = self.contains.bind(self);
                _instance.query = self.query.bind(self);
                _instance.providers = self.providers.bind(self);
                _instance.async = self.async.bind(self);
                _instance.menu = self.menu.bind(self);
                _instance.log = self.log;

                return _instance;
            }
            BasapFact.$inject = [];
            _module.factory('$basap', BasapFact);

            // expose base controller.
            if (this.BaseCtrl) _module.controller('BaseCtrl', this.BaseCtrl);

            var promise = new Promise(function (resolve) {
                var areaKeys = Object.keys(self.areas);
                function fn(item) {
                    var area = self.areas[item];
                    if (area) area.init();
                }
                self.async(areaKeys, fn, null, resolve);
            });

            promise.then(function () {
                // exec config block.
                _module.config(config);

                // bootstrap to element.
                angular.element(document).ready(function () {
                    angular.bootstrap(element, [self.ns]);
                });
            });
        }
    }]);

    return Base;
}();

// Singleton instance of Base.


Base.instance = undefined;

/**
 * Gets singleton instance of Base.
 * @param [ns] - the app namespace
 * @param [deps] - the main module dependencies.
 * @param [options] - base default options.
 * @private
 * @returns {Base}
 */
function getInstance(ns, deps, options) {

    if (!Base.instance) {
        Base.instance = new Base(ns, deps, options);
        Base.constructor = null;
    }

    return Base.instance;
}

if (window) window.basap = getInstance;

exports.default = getInstance;

},{"./area":1,"./baseCtrl":3,"./configs":4,"./routeCtrl":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base controller class.
 * @class
 */

var BaseCtrl = function () {
    function BaseCtrl($rootScope, $basap, $injector, $timeout) {
        _classCallCheck(this, BaseCtrl);

        var extend = {};

        this.$timeout = $timeout;

        /* Extend Controller
        ************************************************/
        if ($basap.baseExtend) extend = $basap.baseExtend;
        delete $basap.baseExtend;
        angular.extend(this, $basap, extend);

        /* Properties
        ************************************************/

        // expose rootScope
        this.$rootScope = $rootScope;

        // if uiRouter get state.
        if (this.routerName === 'uiRouter') {
            this.$state = this.tryInject($injector, '$state');
        }

        // initialize the base controller.
        this.init();
    }

    /**
     * TODO: need to redo this method looks ugly could improve table until have time.
     * Initialize routing event listeners.
     * for detecting areas and defining
     * page titles.
     */


    _createClass(BaseCtrl, [{
        key: 'init',
        value: function init() {
            var _this = this;

            var self = this,
                config = this.routerConfig;

            var $timeout = this.$timeout;

            // angular 2.x router does not
            // expose start, change, error
            // broadcast events.
            if (this.routerName !== 'ngNewRouter') {
                (function () {

                    var cur = 2,
                        next = 1,
                        areaKey = _this.areaKey,
                        $rootScope = _this.$rootScope,
                        stRteKey = 'State',
                        curArea = void 0,
                        nextArea = void 0,
                        curRoute = void 0,
                        nextRoute = void 0,
                        origAreas = void 0;

                    // params for current route
                    // in 3 pos withing arguments.
                    if (_this.routerName === 'uiRouter') cur = 3;else stRteKey = 'Route';

                    // listen for route start events
                    // add active area to $rootScope.
                    _this.$rootScope.$on(config.startEvent, function () {

                        // race issue, use try/catch
                        // in interim to prevent err.
                        try {

                            // get the area.
                            self[areaKey] = self[areaKey] || {};

                            // get current and next areas.
                            curArea = arguments[cur] ? arguments[cur] : undefined;
                            nextArea = arguments[next] ? arguments[next] : undefined;

                            // if no curArea initial
                            // page load set to home area.
                            if (!curArea) curArea = nextArea;

                            // set current and next route data.
                            if (curArea.$$route) {
                                curRoute = curArea.$$route;
                                nextRoute = nextArea.$$route;
                            } else {
                                curRoute = curArea;
                                nextRoute = nextArea;
                                if (self.$state) {
                                    if (curRoute && curRoute.regexp) delete curRoute.regexp;
                                    nextRoute.regexp = self.$state.$current.url.regexp;
                                }
                            }

                            // handle route titles.
                            curRoute.title = curRoute.title || curRoute.name;
                            nextRoute.title = nextRoute.title || nextRoute.name;

                            if (/\./g.test(curRoute.title)) {
                                var tmp = curRoute.title.split('.');
                                curRoute.title = tmp.pop();
                            }

                            if (/\./g.test(nextRoute.title)) {
                                var _tmp = nextRoute.title.split('.');
                                nextRoute.title = _tmp.pop();
                            }

                            if (curRoute.title) curRoute.title = curRoute.title.charAt(0).toUpperCase() + curRoute.title.slice(1);
                            if (nextRoute.title) nextRoute.title = nextRoute.title.charAt(0).toUpperCase() + nextRoute.title.slice(1);

                            // lookup the areas.
                            curArea = self.areas[curArea[areaKey]];
                            nextArea = self.areas[nextArea[areaKey]];

                            // set previous and current.
                            self[areaKey].previous = curArea || {};
                            self[areaKey].current = nextArea;

                            // extend with route config info.
                            self[areaKey].previous.route = curRoute;
                            self[areaKey].current.route = nextRoute;

                            // set area title if enabled.
                            if (nextArea && nextArea.title) {
                                // check if the route has a title
                                // otherwise use area title.
                                var title = nextRoute.title || nextArea.title;
                                var titleElem = document.querySelector('title');
                                if (title) {
                                    // convert to title case.
                                    title = title.replace(/\w\S*/g, function (txt) {
                                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                    });
                                    title = self.name + ' ' + title;
                                    titleElem.innerText = title;
                                }
                            }

                            // store prev, cur in var
                            // if route fails reset
                            // clear on route success.
                            origAreas = {
                                previous: curArea,
                                current: nextArea
                            };

                            // set the active state/route.
                            $rootScope['prev' + stRteKey] = self['prev' + stRteKey] = curRoute;
                            $rootScope['active' + stRteKey] = self['active' + stRteKey] = nextRoute;
                        } catch (e) {}
                    });

                    // listen for route error events
                    _this.$rootScope.$on(config.successEvent, function () {

                        if (self.$state) {
                            var to = arguments.length <= 1 ? undefined : arguments[1];
                            if (to.params && to.params.invoke) self.$state.go(to.params.invoke);
                        }

                        $timeout(function () {
                            origAreas = undefined;
                            curRoute = undefined;
                            nextRoute = undefined;
                        });
                    });

                    // listen for route error events
                    _this.$rootScope.$on(config.errorEvent, function () {
                        // set back to original areas
                        self[areaKey] = origAreas;
                        $rootScope['active' + stRteKey] = self['active' + stRteKey] = curRoute;
                    });
                })();
            }

            // there are currently no broadcast
            // events for new 2.x router favor
            // litening to events within router
            // controller
            else {
                    // placeholder.
                }
        }
    }]);

    return BaseCtrl;
}();

BaseCtrl.$inject = ['$rootScope', '$basap', '$injector', '$timeout'];

exports.default = BaseCtrl;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

/* Router method, events & providers
*****************************************/

var configs = {

    ngRoute: {
        provider: '$routeProvider',
        otherwiseProvider: '$routeProvider',
        whenMethod: 'when',
        otherwiseMethod: 'otherwise',
        startEvent: '$routeChangeStart',
        successEvent: '$routeChangeSuccess',
        errorEvent: '$routeChangeError'
    },

    uiRouter: {
        provider: '$stateProvider',
        otherwiseProvider: '$urlRouterProvider',
        whenMethod: 'state',
        otherwiseMethod: 'otherwise',
        startEvent: '$stateChangeStart',
        successEvent: '$stateChangeSuccess',
        errorEvent: '$stateChangeError'
    },

    ngNewRouter: {
        // NOTE: you can test ngNewRouter however
        // the 2.x Router backport to 1.4 is not
        // stable as of May 1, 2015.
        // basic operations are in fact functional
        // to test and use as a sandbox.
        // the configuration requires not configuration.
    }

};

exports.default = configs;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Route controller class.
 * used only for ngNewRotuer.
 * NOTE: Future not implemented.
 * @class
 */

var RouteCtrl = function RouteCtrl($rootScope, $location, $basap, $router) {
    _classCallCheck(this, RouteCtrl);

    // add routes.
    $router.config.apply($router, $basap.routes());

    $rootScope.$watch(function () {
        return $location.path();
    }, function (newVal, oldVal) {
        // do something on path change.
    });
};

RouteCtrl.$inject = ['$rootScope', '$location', '$basap', '$router'];

exports.default = RouteCtrl;

},{}]},{},[2]);
