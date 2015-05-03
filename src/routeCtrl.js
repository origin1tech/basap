/**
 * Route controller class.
 * used only for ngNewRotuer.
 * NOTE: Future not implemented.
 * @class
 */
class RouteCtrl {

    constructor($rootScope, $location, $router, $routes) {
        // add routes.
        //$router.config.apply($router, $routes.get());
        $rootScope.$watch(function () {
            return $location.path();
        }, function (newVal, oldVal) {
            var nextPath = newVal;
            // do something on path change.
        });
    }
}
RouteCtrl.$inject = ['$rootScope', '$location', '$router', '$routes'];

export default RouteCtrl;