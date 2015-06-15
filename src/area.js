import angular from 'angular';

/**
 * Represents Area module containing its components.
 * @class
 */
class Area {

    /**
     * Area constructor.
     * @contructor
     * @param name - the area name.
     * @param [deps] - module dependencies.
     * @param [options] - area options.
     */
    constructor(name, deps, options) {

        if(!angular.isArray(deps) && angular.isObject(deps)){
            options = deps;
            deps = undefined;
        }

        // allow passing deps in options.
        if(options.dependencies){
            deps = options.dependencies;
            delete options.dependencies;
        }

        /* Public properties
        ***********************************/

        // the area name
        this.name = name;

        // the namespace for the area.
        this.ns = undefined;

        // area module dependencies.
        this.dependencies = deps || [];

        // when true this tells Basap that
        // this is the main area and as such
        // routeBase should not be prepended
        // to routes.
        this.root = undefined;

        // area base by default is set to
        // the area name. areaBase
        // prefixes pathBase, templateBase
        // and componentBase if defined
        // set to false to ignore.
        this.areaBase = undefined;

        // prefix routes with this string.
        // TODO: convert to routeBase currently a minor bug.
        this.routeBase = undefined;

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

        // disable the area.
        this.inactive = false;

        // extend w/ options.
        if(options)
            angular.extend(this, options);

        // check if areaBase is enabled.
        if(this.areaBase !== false){
            // if areaBase is string use
            // it otherwise set to area name.
            if(!angular.isString(this.areaBase))
                this.areaBase = `/${this.name}`;
        }

        /* Components
        ***********************************/

        // wrapper function for calling
        // this.component by a type.
        function componentWrapper(type) {
            return function(...args) {
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
    setBase(base, key, obj){

        var self = this;

        // allows passing two strs
        // the base path and the route path.
        if(arguments.length === 2){
            obj = key;
            key = base;
            base = undefined;
        }

        // checks if val is in array.
        function contains(arr, val){
            return arr.indexOf(val) !== -1;
        }

        // joins two strings.
        // Todo: test make sure works in all scenarios.
        function join(b,p) {
            let result;
            b = b || '';
            // ensure . or / as first char.
            if(b && !/^(\.|\/)/.test(p))
                p = '/' + p;
            // remove last char if backslash.
            if(/\/$/.test(p) && p.length > 1)
                p = p.slice(0, -1);
            // ensure no double backslashes
            result = b + p;
            result = result.replace(/\\/g, '/');
            return result;
        }

        // iterate object's properties and
        // nested properties.
        function iterateConfig(o) {
            for(var prop in o){
                if(o.hasOwnProperty(prop)){
                    if(angular.isObject(o[prop]) && !angular.isArray(0[prop])){
                        iterateConfig(o[prop]);
                    }
                    else {
                        if(contains(key, prop)){
                            if(prop === 'url' || prop === 'path'){
                                if(!o.root && !self.root)
                                    o[prop] = join(base, o[prop]);
                            } else {
                                o[prop] = join(base, o[prop]);
                            }
                            if(o[prop] !== '/')
                                o[prop] = o[prop].replace(/\/$/, '');
                        }
                    }
                }
            }
            return o;
        }

        // if object is string (uiRouter)
        // then join with base.
        if(angular.isString(obj)){
            return join(base, obj);
        }

        // if typeof object iterate
        // and return the result.
        else {
            if(!angular.isArray(key))
                key = [key];
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
    setMapping(type, mapping) {

        if(this.routerName !== 'ngNewRouter')
            throw new Error(`Method setMapping is not implemented for ${this.routerName}`);

        var map = {
            controller: 'setCtrlNameMapping',
            template:   'setTemplateMapping',
            component:  'setComponentFromCtrlMapping'
        };

        // if not in map try reverse
        // lookup by values.
        if(!map[type]){
            let values = Object.keys(map).map((k) => {
                return map[k];
            });
            type = this.basap.contains(values, type, false);
            if(!type)
                throw new Error(`Failed to set mapping of type ${type}, the type is invalid.`);
        } else {
            type = map[type];
        }

        this._mappings.push([type, mapping]);

    }

    /**
     * Normalizes controller names to prevent
     * casing issues or invalid suffix when
     * using component feature.
     * @param name
     * @returns {string}
     */
    normalizeCtrlName(name){
        if(!this.controllerSuffix)
            return name;
        var key = name,
            suffix = this.controllerSuffix;
        // make sure suffix is cap.
        suffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);
        // attempt to normalize controller
        // name to prevent mis-namiing &
        // casing issues. when used with
        // components.
        var normExp =
            new RegExp('(Controller|Ctrl|Con|Ctrls|' + this.controllerSuffix + ')$', 'gi');
        key = key.replace(normExp, '');
        // ensure key is is cap.
        key = key.charAt(0).toUpperCase() + key.slice(1);
        // check if already componentized.
        key = `${key}${suffix}`;
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
    component(type, name, component){

        var self = this;

        if(!type) return this;

        function addComponent(t, c) {
             // iterate components add to collection.
            Object.keys(c).forEach((k) => {
                let key = k;
                // componentize key if type controller
                if(t === 'controller' && self.componentBase){
                    key = self.normalizeCtrlName(key);
                    self._controllers.push(k);
                }
                self._components.push([t, key, c[k]]);
            });
        }

         // ensure module is loaded
        if(!this.module && !this.module.config)
            throw new Error(`Failed to register component ${name}, the module is not loaded.`);

        // if only one argument assume
        // object containing collection
        // of component types.
        if(arguments.length === 1) {
            if(!angular.isObject(type) && !angular.isArray(type))
                throw new Error(`Failed to load component collection of type ${typeof type}.`);
            Object.keys(type).forEach(function (k){
                addComponent(k, type[k]);
            });
        } else {

             // lower and strip plural.
            type = type.toLowerCase();
            if(type === 'factories')
                type = 'factory';
            type = type.replace(/s$/, '');

            // allow component object as
            // second argument.
            if(angular.isObject(name) && !angular.isArray(name)){
                component = name;
                name = undefined;
            }

            // normalize single component to object.
            if(angular.isString(name)){
                var orig = component;
                component = {};
                component[name] = orig;
            }
            addComponent(type, component);
        }

    }

    /**
     * Simply calls component.
     * @returns {Area}
     */
    components(){
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
    when(path, options) {

        var self = this,
            routerName = this.routerName,
            key;

        // get the path or overridden path.
        function getPath(key, route) {
            if(routerName === 'ngRoute' || routerName === 'ngNewRouter'){
                route.path = route.path || key;
                key = route.path || key;
                key = self.setBase(self.routeBase, key);
            }
            if(routerName === 'uiRouter' && route.state !== undefined){
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
            // if(arguments.length === 2){
            //     opts = base;
            //     base = name;
            //     name = undefined;
            // }
            let templateUrl = opts.component,
                name = templateUrl;

            // check template parts, pop name.
            if(/\//g.test(templateUrl))
                name = templateUrl.split('/').pop();

            // set the genrated templateUrl
            // and the generated controller
            // checking if "controllerAs" is
            // enabled.
            if(name) {
                opts.templateUrl = `${templateUrl}/${name}.html`;
                if(self.basap.lowerPaths !== false)
                    opts.templateUrl = opts.templateUrl.toLowerCase();
                opts.controller = self.normalizeCtrlName(name);//
                if(self.controllerAs !== false)
                    opts.controller = `${opts.controller} as ${self.controllerAs}`;
                opts = self.setBase(base, ['templateUrl'], opts);
            }
            return opts;
        }

        // iterate the views or children object
        // generating the templateUrls and controllers
        function iterateUiComponents(base, obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if(prop === 'children'){
                        obj[prop].forEach((c, i) => {
                            obj[prop][i] = iterateUiComponents(base, c);
                        });
                    }
                    if(angular.isObject(obj[prop])){
                        iterateUiComponents(base, obj[prop]);
                    }
                }
            }
            if(obj.component) {
                obj = generateComponent(base, obj);
            }
            return obj;
        }

        // normalize paths where base
        // path or template has been
        // provided as prefix.
        function normalizeOptions(opts){
            opts = self.setBase(self.routeBase, ['url'], opts);
            if(routerName !== 'ngNewRouter'){
                // componentize uiRouter and ngRoute.
                if(!self.basap.contains(Object.keys(opts), ['views', 'children', 'component'])){
                    opts = self.setBase(self.templateBase, ['templateUrl'], opts);
                }
                else {
                     if(!angular.isString(self.componentBase))
                        throw new Error(`To use components with ${routerName}`+
                            ` componentBase must be string || empty string.`);
                    if(routerName === 'ngRoute'){
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
        function normalizeRouteArray(key, options){
            if(routerName === 'ngNewRouter'){
                options.path = key;
                return [options];
            } else {
                return [key, options];
            }
        }

        // iterate an object of
        // route configurations.
        if(angular.isObject(path) && !angular.isArray(path)){
            Object.keys(path).forEach((r) => {
                let route = path[r];
                key = getPath(r, route);
                route[self.areaKey] = self.name;
                if(self.basap.lowerPaths !== false)
                    key = key.toLowerCase();
                self._routes.push(normalizeRouteArray(key, normalizeOptions(route)));
            });
        }

        // iterate array of route configurations.
        else if(angular.isArray(path)){
            path.forEach((route) => {
                key = getPath(null, route);
                if(key){
                    route[self.areaKey] = self.name;
                    if(self.basap.lowerPaths !== false)
                        key = key.toLowerCase();
                    self._routes.push(normalizeRouteArray(key, normalizeOptions(route)));
                }
            });
        }

        // process single route w/ options.
        else {

            let isStringOrObj = angular.isObject(options) || angular.isString(options);
            if(arguments.length !== 2 || !isStringOrObj){
                throw new Error(`Route ${path} could not be registered, the configuration invalid.`);
            }

            else {

                // if options is string
                // assume redirect.
                if(angular.isString(options)){
                    options = { redirectTo: options };
                }

                if(angular.isObject(options)){
                    key = getPath(path, options);
                    options[self.areaKey] = self.name;
                    if(self.basap.lowerPaths !== false)
                        key = key.toLowerCase();
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
    otherwise(path) {
        if(angular.isString(path) && !/^\./.test(path)){
            path = this.setBase(this.routeBase, path);
            path = path.replace(/^\./, '');
        }
        if(angular.isObject(path) && path.redirectTo && !/^\./.test(path.redirectTo) && !path.static){
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
    config(fn) {
        if(fn)
            this.module.config.apply(this, arguments);
        return this;
    }

    /**
     * Adds custom run function to module.
     * this is merely a convenience wrapper.
     * @param [fn] - the function to exec or array including dependencies.
     * @returns {Area}
     */
    run(fn) {
        if(fn)
            this.module.run.apply(this, arguments);
        return this;
    }

    /**
     * Initialize the area.
     * @returns {Area}
     */
    init() {

        // prevent duplicate initializations.
        if(this._initialized)
            throw new Error(`${this.ns} attempted to init but has already been initialized.`);

        var self = this,
            _module = this.module;

        function DummyCtrl() {}

        // expose provider register methods.
        function config($injector) {

            // get all providers from app instance.
            let providers = self.basap.providers($injector);

            // set any mappings that are required.
            if(self.routerName === 'ngNewRouter'){
                self._mappings.forEach((m) => {
                    let type = m.shift();
                    providers.loader[type].apply(null, m);
                });
            }

            // register components.
            self._components.forEach((k) => {
                let type = k[0];
                if(angular.isString(type) && providers[type]){
                    k.shift();
                    providers[type].apply(null, k);
                } else {
                    throw new Error(`Component type ${type} invalid configuration or not supported.`);
                }
            });

            // if ngRoute or uiRouter use injector
            // to get route/otherwise providers
            // then inject routes.
            if(self.routerName === 'ngRoute' || self.routerName === 'uiRouter'){
                self._routes.forEach((r) => {
                    let key = r[0],
                        opts = r[1],
                        reqCtrl;
                    if(key === 'otherwise'){
                        // strip first element.
                        r.shift();
                        providers.otherwise[self.routerConfig.otherwiseMethod].apply(providers.otherwise, r);
                    } else {
                        // if component, check for
                        // valid controller if not exists
                        // inject noop dummy controller.
                        if(opts && opts.component){
                            reqCtrl = self.normalizeCtrlName(opts.component);
                            if(!self.basap.contains(self._controllers, reqCtrl))
                                providers.controller(reqCtrl, DummyCtrl);
                        }

                        if(self.routerName === 'uiRouter' && (opts && opts.redirectTo))
                            providers.otherwise.when.call(providers.otherwise, opts.url, opts.redirectTo);
                        else
                            providers.route[self.routerConfig.whenMethod].apply(providers.route, r);
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

}

export default Area;