/**
 * Route controller class.
 * used only for ngNewRotuer.
 * NOTE: Future not implemented.
 * @class
 */
class RouteCtrl {

    constructor($rootScope, $location, $basap, $router) {

        // add routes.
        $router.config.apply($router, $basap.routes());

        $rootScope.$watch(function () {
            return $location.path();
        }, function (newVal, oldVal) {
            var nextPath = newVal;
            // do something on path change.
        });

    }
}
RouteCtrl.$inject = ['$rootScope', '$location', '$basap', '$router'];

export default RouteCtrl;