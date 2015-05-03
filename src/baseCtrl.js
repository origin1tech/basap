/**
 * Base controller class.
 * @class
 */
class BaseCtrl {
    constructor($rootScope, $basap) {

        let extend = {};
        if($basap.baseExtend)
            extend = $basap.baseExtend;
        delete $basap.baseExtend;
        angular.extend(this, $basap, extend);

        // add lifcycle methods if ngNewRouter
        // and existing methods do not exist.
        if(this.routerName === 'ngNewRouter'){
            // TODO: create default methods.
            this.canActivate = this.canActivate || function () {

            };
            this.canDeactivate = this.canDeactivate || function() {

            };
            this.canReactivate = this.canReactivate || function() {

            };
        }

    }
}
BaseCtrl.$inject = ['$rootScope', '$basap'];

export default BaseCtrl;