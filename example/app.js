
////////////////////////////////////////
/////// [IMPORT DEPENDENCIES] //////////
////////////////////////////////////////
// import Basap and the core
// dependencies for the app.
////////////////////////////////////////
import basap from '../src/base';
import uiRouter from 'angular-route';

///////////////////////////////////////
///////// [IMPORT COMPONENTS] /////////
// these are your app area
// components like "public",
// "admin", "customer" etc.
///////////////////////////////////////
import home from './components/home/home';

///////////////////////////////////////
////////// [CREATE APP] ///////////////
///////////////////////////////////////
// using Basap we create our
// app pasing in core
// dependencies and any options
// see: base.js contructor for options.
////////////////////////////////////////
var app = basap('basap',
    ['ngRoute'],
    { componentBase: '/example/components' /* options */}
);

///////////////////////////////////////
////////// [CREATE AREA] //////////////
///////////////////////////////////////
// using Basap we create our
// app pasing in core
// dependencies and any options
// see: area.js contructor for options.
////////////////////////////////////////d
var area = app.area('main', []);

///////////////////////////////////////
///////// [CREATE CONTROLLER] /////////
///////////////////////////////////////
// in this same manner you can create
// factory, service, decorator,
// constant, value. pase the name
// for the component and the function
// class that should be applied.
////////////////////////////////////////
function HomeController($location, $anchorScroll){
    this.toAnchor = function (id) {
        $location.hash(id);
        $anchorScroll();
    }
}
HomeController.$inject = ['$location', '$anchorScroll'];
area.controller('HomeController', HomeController);

// when you componentize a route a controller
// is required, in future versions of basap these
// will get generated automatically for routes
// which only require a view with no backend code.
function DummyController() {}
area.controller('OptionController', DummyController);
area.controller('ResourceController', DummyController);

///////////////////////////////////////
////////// [ADD ROUTES] ///////////////
///////////////////////////////////////
// specify a path or state and its
// configuration object. you may also
// pass a single param, an array of
// objects or an Object of routes in
// which the key is used as the state
// or path unless overriden within the
// object options.
// see: Area.when method for
//     options and alternate configs.
////////////////////////////////////////
area.when('/', { component: 'Home' });
area.when('/option', { component: 'Option'});
area.when('/resource', { component: 'Resource'});


///////////////////////////////////////
/////////// [BOOTSTRAP] ///////////////
///////////////////////////////////////
// manually bootstrap Angular this
// would be similar to adding
// ng-app="app", bootstrapping manually
// gives us greater control.
////////////////////////////////////////
app.bootstrap();