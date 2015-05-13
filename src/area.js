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

        // area global access roles/levels.
        this.access = [0];

        // when true base paths (template, path, component)
        // defined in basap (the base.js file)
        // are ignored. Otherwise the paths
        // specified in basap are prepended to the
        // below base paths.
        // TODO: Not Implemented yet.
        this.baseOverride = false;

        // prefix routes with this string.
        this.pathBase = undefined;

        // prefix template url with this string.
        this.templateBase = undefined;

        // base path for components.
        this.componentBase = undefined;

        // the suffix you use to define
        // your controllers usually
        // Controller or ctrl. This property
        // is used to append this string
        // to compoentized routes for ngRoute
        // and uiRouter.
        this.controllerSuffix = undefined;

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

        // disable the area.
        this.inactive = false;

        // extend w/ options.
        if(options)
            angular.extend(this, options);

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
            b = b || '';
            // ensure . or / as first char.
            if(b && !/^(\.|\/)/.test(p))
                p = '/' + p;
            if(/\/$/.test(p) && p.length > 1)
                p = p.slice(0, -1);
            return b + p;
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
                        if(contains(key, prop))
                            o[prop] = join(base, o[prop]);
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

        // lower and strip plural.
        type = type.toLowerCase();
        type = type.replace(/s$/, '');

        // ensure module is loaded
        if(!this.module && !this.module.config)
            throw new Error(`Failed to register component ${name}, the module is not loaded.`);

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

        // iterate components add to collection.
        Object.keys(component).forEach((k) => {
            let key = k;
            // componentize key if type controller
            if(type === 'controller' && self.componentBase){
                key = self.normalizeCtrlName(key);
                self._controllers.push(k);
            }
            self._components.push([type, key, component[k]]);
        });

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
                key = route.path || key;
                key = self.setBase(self.pathBase, key);
                if(routerName !== 'ngNewRouter')
                    delete route.path;
            }
            if(routerName === 'uiRouter' && route.state !== undefined){
                key = route.state || key;
                delete route.state;
            }
            return key;
        }

        // when router is ngRoute or uiRouter
        // if options contains "component"
        // componentize the configuration
        // options for the route.
        function generateComponent(name, base, opts) {
            if(arguments.length === 2){
                opts = base;
                base = name;
                name = undefined;
            }
            name = opts.component;
            // set the genrated templateUrl
            // and the generated controller
            // checking if "controllerAs" is
            // enabled.
            if(name) {
                let ctrlName = name;
                opts.templateUrl = `${name}/${name}.html`;
                if(self.basap.lowerPaths !== false)
                    opts.templateUrl = opts.templateUrl.toLowerCase();
                opts.controller = self.normalizeCtrlName(name);//
                if(self.controllerAs !== undefined)
                    opts.controller = `${opts.controller} as ${self.controllerAs}`;
                opts = self.setBase(base, ['templateUrl'], opts);
            }
            return opts
        }

        // iterate the views or children object
        // generating the templateUrls and controllers
        function iterateUiComponents(base, obj) {

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if(prop === 'children'){
                        obj[prop].forEach((c, i) => {
                            obj[prop][i] = iterateUiComponents(base, c)
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
            opts = self.setBase(self.pathBase, ['url', 'redirectTo'], opts);
            if(routerName !== 'ngNewRouter'){
                // componentize uiRouter and ngRoute.
                let compBase = self.componentBase;
                if(!angular.isString(compBase))
                    throw new Error(`To use components with ${routerName}`+
                        ` componentBase or templateBase must be valid string.`);
                if(!self.basap.contains(Object.keys(opts), ['views', 'children', 'component'])){
                    opts = self.setBase(self.templateBase, ['templateUrl'], opts);
                }
                else {
                    if(!self.componentBase)
                        throw new Error('Componetized routes require area.componentBase ' +
                            'to be set in area options.');
                    if(routerName === 'ngRoute'){
                        opts = generateComponent(compBase, opts);
                    } else {
                        //opts = generateComponent(compBase, opts);
                        opts = iterateUiComponents(compBase, opts);
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
            if(angular.isObject(options)){
                key = getPath(path, options);
                options[self.areaKey] = self.name;
                if(self.basap.lowerPaths !== false)
                    key = key.toLowerCase();
                self._routes.push(normalizeRouteArray(key, normalizeOptions(options)));
            } else {
                throw new Error(`Route ${path} could not be registered, the configuration is missing or invalid.`);
            }
        }

        return this;
    }

    /**
     * Add otherwise to routes collection.
     * @param path - path, object or function.
     * @returns {Area}
     */
    otherwise(path) {
        if(angular.isString(path))
            path = this.setBase(this.pathBase, path);
        if(angular.isObject(path) && path.redirectTo)
            path.redirectTo = this.setBase(this.pathBase, path.redirectTo);
        this._routes.push(['otherwise', path]);
        return this;
    }

    /**
     * Adds custom configure function to module.
     * this is merely a convenience wrapper
     * @param [fn] - the function to exec.
     * @returns {Area}
     */
    config(fn) {
        if(angular.isFunction (fn))
            this.module.config(fn);
        return this;
    }

    /**
     * Adds custom run function to module.
     * this is merely a convenience wrapper.
     * @param [fn] - the function to exec.
     * @returns {Area}
     */
    run(fn) {
        if(angular.isFunction (fn))
            this.module.run(fn);
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

        function lookupController(name) {
            let ctrls = self._
        }

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
                        if(opts.component){
                            reqCtrl = self.normalizeCtrlName(opts.component);
                            if(!self.basap.contains(self._controllers, reqCtrl))
                                providers.controller(reqCtrl, DummyCtrl);
                        }
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