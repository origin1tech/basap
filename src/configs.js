
/* Router method, events & providers
*****************************************/

var configs = {

    ngRoute: {
        provider:          '$routeProvider',
        otherwiseProvider: '$routeProvider',
        whenMethod:        'when',
        otherwiseMethod:   'otherwise',
        startEvent:        '$routeChangeStart',
        successEvent:      '$routeChangeSuccess',
        errorEvent:        '$routeChangeError'
    },

    uiRouter: {
        provider:          '$stateProvider',
        otherwiseProvider: '$urlRouterProvider',
        whenMethod:        'state',
        otherwiseMethod:   'otherwise',
        startEvent:        '$stateChangeStart',
        successEvent:      '$stateChangeSuccess',
        errorEvent:        '$stateChangeError'
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

export default configs;

