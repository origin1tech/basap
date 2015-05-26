//////////////////////////////////////
////////////// [IMPORTS] /////////////
//////////////////////////////////////
// Here we are importing our base
// application from basap.js.
// we then import any components
// the area has. You could also
// import components directly and
// and then call area.component as
// described below. But for larger
// applications this structure shown
// seems to work well.
//////////////////////////////////////
import app from '../basap';
import components from './components';

///////////////////////////////////////
////////// [AREA OPTIONS] /////////////
///////////////////////////////////////
// define the dependencies and
// the options for the area.
////////////////////////////////////////
var deps = [],
    options = {};

///////////////////////////////////////
////////// [CREATE AREA] //////////////
///////////////////////////////////////
// using Basap we create our
// app pasing in core
// dependencies and any options
// see: area.js contructor for options.
////////////////////////////////////////
var area = app.area('main', deps, options);

////////////////////////////////////////
//////////// [SET MAPPING] /////////////
///////////////////////////////////////
// **NOTE ONLY USED WITH NgNewRouter**
// Uncomment when testing ngNewRouter.
// you can map the controller &
// template locations.
// see: $componentLoaderProvider
////////////////////////////////////////
//area.setMapping('template', function (name) {             // <== IMPORTANT UNCOMMENT when testing ngNewRouter!
//    return `example/main/${name}/${name}.html`;
//});

///////////////////////////////////////
///////// [ADD COMPONENTS] ////////////
///////////////////////////////////////
// above we imported a collection of
// components from component.js
// the file specifies components by
// type, you could however register
// a component directly using:
// ex: area.component('COMPONENT_NAME', Component);
////////////////////////////////////////
area.component(components);

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
//
// IMPORTANT: be sure to comment or
//            uncomment the routes
//            config below relative
//            to the router type you
//            are testing in basap.js
////////////////////////////////////////

/*********** ngRoute & ngNewRouter ***********/
area.when('/', { component: 'Home' });
area.when('/option', { component: 'Option'});
area.when('/resource', { component: 'Resource'});

/*********** ui.router ***********/
//area.when('home', { url: '/', component: 'Home' });
//area.when('option', { url: '/option', component: 'Option'});
//area.when('resource', { url: '/resource', component: 'Resource'});

///////////////////////////////////////
////////// [AREA EXPORT] //////////////
///////////////////////////////////////
// Exporting the area is not required.
// However if you need to do something
// with the area after creation simply
// use: export default area;
// where "area" is the variable
// name used when creating the area.
///////////////////////////////////////

