import angular from 'angular';
import Logger from './logger';
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
        // TODO: need to change this so can't be found other than by initial array of deps.
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
        this.routeBase = '';

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
        this.logger = undefined;

        // extend options.
        angular.extend(this, options);

        // ensure we have a name for display.
        this.name = this.name || this.ns;

        // check if template/componentBase
        // have values if not inherit from
        // viewBase.
        if(!this.templateBase)
            this.templateBase = this.viewBase;

        if(!this.componentBase)
            this.componentBase = this.viewBase;

        // check if logger is enabled.
        if(this.logger !== false)
            this.logger = this.logger || true;

        // create logger instance.
        this.log = new Logger(this.logger, this.module);

        // globalize logger if enabled.
        if(this.log.options.globalize !== false)
            window.$log = this.log;

        // if globalized add to window
        // prefixed by $ (default: $app)
        if(this.globalize)
            window[this.globalizeAs] = this; //`${this.ns}`;

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
        this.controllerSuffix = this.controllerSuffix || 'Ctrl';

        // the key name added to $rootScope.
        this.areaKey = '$area';

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
     * Simple check if value is
     * a boolean object.
     * @param val
     * @returns {boolean}
     */
    isBoolean(val) {
        return val === true || val === false;
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
            let result;
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
     * if mapped returns url/path
     * with configuration object.
     * @param [area] - the area you wish to retrieve routes for.
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
        } else {
            // convert to array of objects.
            angular.forEach(routes, function (r,i) {
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
                'access', 'inherit', 'componentBase', 'onComponetize',
                'routeBase', 'templateBase', 'controllerSuffix',
                'controllerAs', 'areaKey', 'onControllerName', 'mount'],
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
            // if not a base type
            // and area's key has no
            // value, simply update
            // from app options property.
            if(!self.contains(['routeBase', 'templateBase', 'componentBase'], k)){
                if(area[k] === undefined)
                    area[k] = self[k];
            }
            // if key is a base type
            // check for prepends and
            // overrides.
            else {
                // prepend base paths to area paths.
                let tmpBase = area[k] !== undefined ? area[k] : '';
                if(tmpBase === false){
                    area[k] = '';
                    return;
                }
                if(area.areaBase)
                    tmpBase = `${area.areaBase}/${tmpBase}`;
                // ensure first char is backslash.
                if(tmpBase.charAt(0) !== '/')
                    tmpBase = `/${tmpBase}`;
                // if no tmpBase but base options
                // contain value of same base
                // type allow it to populate
                // the base path.
                if(!tmpBase || !tmpBase.length && (self[k] && self[k].length))
                    tmpBase = self[k];
                // check for mount point.
                // routeBase should NOT be
                // prepended with mount point.
                if(k !== 'routeBase')
                    tmpBase = `${self.mount || ''}/${tmpBase}`;
                // ensure no double backslashes.
                tmpBase = tmpBase.replace(/\/\//g, '/');
                // remove trailing slash.
                tmpBase = tmpBase.replace(/\/$/, '');
                // finally update the base type
                // with the tmpBase value.
                area[k] = tmpBase || '';
            }

        });



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
    menu(filter) {
        var _filter;
        // filter function.
        function filterRoutes(route) {
            if(!route)
                return;
            // ensure valid route name.
            route.label = route.label || route.title || route.name;
            if(/\./g.test(route.label)){
                let tmp = route.label.split('.');
                route.label = tmp.pop();
            }
            if(filter === undefined)
                return route.menu;
            // ensure route.menu is defined.
            if(route.menu !== undefined){
                // if string split to array
                // after trimming whitespace.
                if(angular.isString(route.menu)){
                    let found = false, menu;
                    menu = route.menu.replace(/\s/g, '');
                    menu = menu.split(',');
                    menu.forEach(m => {

                        if(!found)
                            found = (m === filter);
                    });
                    return found;
                }
                return filter === route.menu;
            }
            return false;
        }
        _filter = filterRoutes;
        if(angular.isFunction(filter))
            _filter = filter;
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
    config(fn) {
        if(fn)
            this.module.config.apply(this, arguments);
        return this;
    }

    /**
     * Adds custom run function to module.
     * this is merely a convenience wrapper.
     * @param [fn] - the function to exec or array including dependencies.
     * @returns {Base}
     */
    run(fn) {
        if(fn)
            this.module.run.apply(this, arguments);
        return this;
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

        // add main router controller.
        // you can add nested routers
        // the below is simply the base router.
        if(self.routerName === 'ngNewRouter'){
            _module.controller('RouteCtrl', RouteCtrl);
        }

        // expose basap as factory
        function BasapFact () {

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
            // exec config block.
            _module.config(config);

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
 * @param [options] - base default options.
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