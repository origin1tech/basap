////////////// [NOTE] //////////////////
// this file is used to import our
// dependant areas and then bootstrap
// the application once all areas have
// been imported. This is also our
// initial filed called with
// System.import. In this case it is
// System.import('example/app');

////////////////////////////////////////
/////// [IMPORT DEPENDENCIES] //////////
////////////////////////////////////////
// import Basap and the core
// dependencies for the app.
////////////////////////////////////////
import app from './basap';

///////////////////////////////////////
/////////// [IMPORT AREAS] ////////////
// import each defined area so that
// traceur/babel will make it part
// of the tree and be appropriately
// compiled.
///////////////////////////////////////
import main from './main/index';

///////////////////////////////////////
/////////// [BOOTSTRAP] ///////////////
///////////////////////////////////////
// manually bootstrap Angular this
// would be similar to adding
// ng-app="app", bootstrapping manually
// gives us greater control.
////////////////////////////////////////
app.bootstrap();