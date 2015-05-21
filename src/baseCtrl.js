/**
 * Base controller class.
 * @class
 */
class BaseCtrl {

    constructor($rootScope, $basap) {

        var extend = {},
            routes;

        /* Extend Controller
        ************************************************/
        if($basap.baseExtend)
            extend = $basap.baseExtend;
        delete $basap.baseExtend;
        angular.extend(this, $basap, extend);

        /* Get Menu Items.
        ************************************************/
        routes = this.routes();

        // iterate the routes stripping
        // out those specified as menu enabled.
        angular.forEach(routes, function (r) {
            let route = r[1];

        });

        /* Methods & Properties
        ************************************************/

        // expose rootScope
        this.$rootScope = $rootScope;

        // initialize the base controller.
        this.init();

    }

    /**
     * Gets current title for the area in viewport.
     * @returns {string}
    */
    title(){
        var self = this,
            title = this.ns,
            curArea;
        function getArea() {
            try{
               return self[self.areaKey].current;
            } catch(ex){
                return undefined;
            }
        }
        curArea = getArea();
        title = curArea && curArea.name ? `${title} - ${curArea.name}` : title;
        title = title.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        return title;
    }

    /**
     * Initialize routing event listeners.
     */
    init() {

        var self = this,
            config = this.routerConfig;

        // angular 2.x router does not
        // expose start, change, error
        // broadcast events.
        if(this.routerName !== 'ngNewRouter'){

            let cur = 2,
                next = 1,
                areaKey = this.areaKey,
                curArea, nextArea,
                origAreas;

            // params for current route
            // in 3 pos withing arguments.
            if(this.routerName === 'uiRouter')
                cur = 3;

            // listen for route start events
            // add active area to $rootScope.
            this.$rootScope.$on(config.startEvent, function () {

                // store current $area objects
                // in case the route fails.
                //origAreas = $rootScope[areaKey];

                // ensure root scope area object.
                //$rootScope[areaKey] = $rootScope[areaKey] || {};
                self[areaKey] =  self[areaKey] || {};

                // get current and next areas.
                curArea = arguments[cur] ? arguments[cur] : undefined;
                nextArea = arguments[next] ? arguments[next]: undefined;

                // if no curArea initial
                // page load set to home area.
                if(!curArea){
                    curArea = nextArea;
                }

                // lookup the areas.
                curArea = self.areas[curArea[areaKey]];
                nextArea = self.areas[nextArea[areaKey]];

                //$rootScope[areaKey].previous = curArea;
                //$rootScope[areaKey].current = nextArea;
                self[areaKey].previous = curArea;
                self[areaKey].current = nextArea;

                // store prev, cur in var
                // if route fails reset
                // clear on route success.
                origAreas = {
                    previous: curArea,
                    current: nextArea
                };

            });

            // listen for route error events
            this.$rootScope.$on(config.successEvent, function () {
                origAreas = undefined;
            });

            // listen for route error events
            this.$rootScope.$on(config.errorEvent, function () {
                // set back to original areas
                //$rootScope[areaKey] = origAreas;
                self[areaKey] = origAreas;
            });

        }

        // there are currently no broadcast
        // events for new 2.x router favor
        // litening to events within router
        // controller
        else {
            // placeholder.
        }
    }

}
BaseCtrl.$inject = ['$rootScope', '$basap'];

export default BaseCtrl;