import angular from 'angular';
import Area from './area';
import configs from './configs';
import BaseCtrl from './baseCtrl';
import RouteCtrl from './routeCtrl';

/**
 * Angular application.
 * @class
 */
class Base {

    /**
     * Base constructor.
     * @constructor
     * @param ns - the app namespace
     * @param [deps] - the main module dependencies.
     * @param [options] - area default options.
     * @returns {Base}
     */
    constructor(ns, deps, options) {

        // normalize route module name.
        function normalizeRouter(m) {
            if(m.indexOf('.') !== -1){
                m = m.split('.');
                if(angular.isArray(m))
                    return (m[0] + m[1].charAt(0).toUpperCase() + m[1].slice(1));
                return m + m.charAt(0).toUpperCase() + m.slice(1);
            }
            return m;
        }

        // lookup verify supported router.
        function lookupRouter(arr){
            arr = arr || [];
            let filtered = arr.filter(function (a) {
                return /^(ngRoute|ngNewRouter|ui\.router)$/.test(a);
            });
            if(filtered.length > 1)
                throw new Error(`Only one router can be initialized
            attempted to initialize with ${filtered.join(', ')}`);
            if(!filtered || !filtered.length)
                throw new Error('Attempted to initialize using router module of undefined. ' +
                    'Supported Modules: ngRoute, ngNewRouter, ui.router');
            return normalizeRouter(filtered[0]);
        }

        if(!angular.isString(ns)){
            if(angular.isObject(ns) && !angular.isArray(ns)){
                options = ns;
                deps = undefined;
                ns = undefined;
            }
            if(angular.isArray(ns)){
                options = deps;
                deps = ns;
                ns = undefined;
            }
        }

        // allow options as second arg.
        if(!angular.isArray(deps) && angular.isObject(deps)){
            options = deps;
            deps = undefined;
        }

        options = options || {};

        // allow dependencies in options
        if(options.dependencies){
            deps = options.dependencies;
            delete options.dependencies;
        }

        // define root namespace for app.
        this.ns = ns || 'app';

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

        // NOTE: routeBase, templateBase & componentBase
        // can be overriden at the area level.

        // globally prepends route paths.
        this.routeBase = '';

        // globally prepends view paths.
        this.templateBase = '';

        // global path for components.
        this.componentBase = '/components';

        // when true root base paths are
        // prepended to area paths.
        // if you wish to use root paths
        // only if not defined in area set
        // this to false.
        this.prependPaths = undefined;

        // lower route paths.
        // undefined or true paths
        // are lowered.
        this.lowerPaths = undefined;

        // required when ngRoute or uiRouter if
        // route defined as component. set
        // to false to ignore typically
        // either Controller or Ctrl.
        this.controllerSuffix = 'Controller';

        // the expression name used for
        // "controller" property in routes.
        // when componetizing routes for
        // ngRoute/uiRoute ONLY the controller is
        // added to the options as
        // follows: SomeController as ctrl.
        // where ctrl is the property defined
        // below.
        this.controllerAs = 'ctrl';

        // when not false instance
        // add $app to window.
        this.globalize = false;

        // global based controller.
        this.BaseCtrl = BaseCtrl;

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

        // extend options.
        angular.extend(this, options);

        // if globalized add to window
        // prefixed by $ (default: $app)
        if(this.globalize){
            this.globalName = `$${this.ns}`;
            window[this.globalName] = this;
        }

        // add base controller attr if defined.
        if(this.BaseCtrl){
            let elem = this.query(this.baseElement);
            if(elem)
                elem.setAttribute('ng-controller', 'BaseCtrl as ' + this.ns);
        }

        // lookup the router
        this.routerName = lookupRouter(this.dependencies);

        // show ngNewRouter warning.
        if(this.routerName === 'ngNewRouter'){
            if(console && console.warn){
                console.warn(`${this.routerName} is supported only as preview, should not be used in` +
                    `production. until more stable.`);
            }
        }

        // if ngNewRouter add controller
        // expression to routerElement.
        if(this.routerName === 'ngNewRouter' && this.routerElement){
            let elem = this.query(this.routerElement);
            if(elem)
                elem.setAttribute('ng-controller', 'RouteCtrl as router');
        }

        // get router config.
        this.routerConfig = angular.extend(configs[this.routerName], this.routerConfig);

        // ensure controllerSuffix
        this.controllerSuffix = this.controllerSuffix || 'Controller';

        // the key name added to $rootScope.
        this.areaKey = '$area';

        return this;
    }

    /**
     * Try catch get provider.
     * make errors clear.
     * @param injector - instance of $injector.
     * @param provider - string value representing
     * @returns {function|boolean}
     */
    tryInject(injector, provider){
        try {
            return injector.get(provider);
        } catch(ex) {
            ex.message = `Failed to inject ${provider}: ${ex.message}`;
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
    contains(arr, values, bool) {
        var self = this;
        bool = bool === undefined ? true : bool;
        if(!(values instanceof Array)){
            var idx = arr.indexOf(values);
            if(bool)
                return idx !== -1;
            return arr[idx];
        } else {
            let result = undefined;
            values.forEach((v) => {
                if(!result){
                    result = self.contains(arr, v, bool);
                }
            });
            return result;
        }
    }

    /**
     * Helper using document.querySelector
     * @param elem - element to find.
     * @param all - weather to use selectorAll
     * @returns {*}
     */
    query(elem, all) {
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
    async(arr, fn, pre, done){
        var i = 0,
            delay = 0;
        done = done || function () {};
        if(typeof pre !== 'function'){
            delay = pre;
            pre = undefined;
        }
        return setTimeout(function iter(){
            let params;
            if(i===arr.length)
                return done();
            // injects item, index.
            params = [arr[i], i++];
            // if pre call to get params.
            if(typeof pre === 'function')
                params = pre.apply(arr, params);
            // if not array convert apply to fn.
            if(!(params instanceof Array))
                params = [params];
            fn.apply(arr, params);
            setTimeout(iter, delay);
        }, 0);
    }

    /**
     * Returns collection of routes
     * by area name or all.
     * @param [area]
     * @returns {Array}
     */
    routes(area) {

        var self = this,
            routes = [];

        Object.keys(this.areas).forEach((a) => {
            let _routes = self.areas[a]._routes;
            if(!area || a === area)
                routes = routes.concat(_routes);
        });

        // flatten routes.
        if(this.routerName === 'ngNewRouter'){
            routes = [].concat.apply([], routes);
        }

        return routes;

    }

    /**
     * Returns list of providers for app.
     * @param injector
     * @returns {{}}
     */
    providers(injector) {

        if(!injector) return;

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

        if(this.routerName === 'ngRoute' || this.routerName === 'uiRouter') {
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
    area(name, deps, options) {

        var self = this,
            globalAreaOptsKeys = ['routerName', 'routerConfig', 
                'access', 'inherit', 'componentBase',
                'routeBase', 'templateBase', 'controllerSuffix',
                'controllerAs', 'areaKey'],
            area;

        // if only area name provided get area.
        if(angular.isString(name) && arguments.length === 1){
            if(!this.areas[name])
                throw new Error(`The area ${name} could not be found.`);
            return this.areas[name];
        }

        // allow namespace and
        // options only as params.
        if(arguments.length === 2 && angular.isObject(deps) && !angular.isArray(deps)){
            options = deps;
            deps = undefined;
        }

        var regex = new RegExp('^(app|' + this.ns + ')', 'i');
        if(angular.isString(name))
            name = name.replace(regex,'');

        options = options || {};

        // check for duplicates.
        if(this.areas[name])
            throw new Error(`Failed to register area ${name} duplicate detected.`);

        // create area instance.
        area = new Area(name, options);

        // set default area options
        // if not defined.
        globalAreaOptsKeys.forEach((k) => {
            if(!self.contains(['routeBase', 'templateBase', 'componentBase'], k)){
                if(area[k] === undefined)
                    area[k] = self[k];
            } else {
                // prepend base paths to area paths.
                if(area[k] !== undefined && self.prependPaths !== false) {
                    if(area[k].charAt(0) !== '/')
                        area[k] = '/' + area[k];
                    area[k] = self[k] + area[k];
                    area[k] = area[k].replace(/\/\//g, '/');
                } else {
                    area[k] = self[k];
                }
            }
        });

        // ensure access is an array.
        if(!angular.isArray(area.access)){
            if(angular.isNumber(area.access) || angular.isString(area.access))
                area.access = [area.access];
            else
                throw new Error(`Failed to register area ${area.name}
            area.access must be of type array but got ${typeof area.access}`);
        }

        // get area namespace.
        area.ns = area.ns || (`${this.ns}.${name}`);

        // add the area as a dependency.
        // only if not deactivated.
        // area is created but will not
        // be loaded.
        if(!area.inactive)
            this.dependencies.push(area.ns);

        // create the module.
        area.module = angular.module(area.ns, area.dependencies);

        // expose app instance to area.
        area.basap = this;

        // get area routes or all routes.
        area.getRoutes = function getRoutes (all) {
            let area = all ? area.name : undefined;
            return self.routes(area);
        };

        // add the area to the collection.
        this.areas[area.name] = area;

        // return the area.
        return area;

    }

    /**
     * Boostraps Angular app.
     * @param element - the element to bootstrap app.
     */
    bootstrap(element) {

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

        // inject area into rootScope.
        function run($injector, $rootScope) {

        }
        run.$inject = ['$injector', '$rootScope'];

        // add factory for getting routes.
        function RouteFact() {
            var factory = {
                get: function get(area) {
                    return self.routes(area);
                }
            };
            return factory;
        }
        _module.factory('$routes', RouteFact);

        // add main router controller.
        // you can add nested routers
        // the below is simply the base router.
        if(self.routerName === 'ngNewRouter'){
            _module.controller('RouteCtrl', RouteCtrl);
        }

        // expose basap as factory
        function BasapFact () {
            return self;
        }
        _module.factory('$basap', BasapFact);

        // expose base controller.
        if(this.BaseCtrl)
            _module.controller('BaseCtrl', this.BaseCtrl);

        var promise = new Promise(function(resolve) {
            var areaKeys = Object.keys(self.areas);
            function fn(item) {
                var area = self.areas[item];
                if(area)
                    area.init();
            }
            self.async(areaKeys, fn, null, resolve);
        });

        promise.then(function() {
            // exec run block.
            _module.config(config).run(run);

            // bootstrap to element.
            angular.element(document).ready(function () {
                angular.bootstrap(element, [self.ns]);
            });

        });


    }

}

// Singleton instance of Base.
Base.instance = undefined;


/**
 * Gets singleton instance of Base.
 * @param [ns] - the app namespace
 * @param [deps] - the main module dependencies.
 * @param [options] - area default options.
 * @private
 * @returns {Base}
 */
function get(ns, deps, options) {
    if(!Base.instance){
        Base.instance = new Base(ns, deps, options);
        Base.constructor = null;
    }
    return Base.instance;
}


export default get;