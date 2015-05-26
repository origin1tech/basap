import basap from '../src/base';
import uiRouter from 'angular-ui-router';
import ngRoute from 'angular-route';
import ngNewRouter from 'angular/router';

//////////////////////////////////////
////////// [SELECT ROUTER] ///////////
// select the router you wish
// to test then comment out the
// remaining routers.
//////////////////////////////////////
var deps;
deps = [ 'ngRoute'];
//deps = [ 'ui.router'];
///deps = [ 'ngNewRouter'];

//////////////////////////////////////
/////////// [APP OPTIONS] ////////////
// since the app is located in the
// example folder we mount our app
// in this location.
//////////////////////////////////////
var options = {
    mount: '/example'
};

///////////////////////////////////////
////////// [CREATE APP] ///////////////
///////////////////////////////////////
// using Basap we create our
// app pasing in core
// dependencies and any options
// see: base.js contructor for options.
////////////////////////////////////////
var app = basap('basap', deps, options);

export default app;