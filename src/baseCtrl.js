/**
 * Base controller class.
 * @class
 */
class BaseCtrl {

    constructor($rootScope, $location, $http, $basap, $injector) {

        var self = this,
            extend = {};

        /* Extend Controller
        ************************************************/
        if($basap.baseExtend)
            extend = $basap.baseExtend;
        delete $basap.baseExtend;
        angular.extend(this, $basap, extend);

        /* Properties
        ************************************************/

        // expose rootScope
        this.$rootScope = $rootScope;

        // expose http
        this.$http = $http;

        // get the Angular injector
        this.$injector = $injector;

        // private properties.
        Object.defineProperties(this, {

            // set routes as they are
            // loaded prior to bootstrapping
            // i.e. they don't change.
            _routes: {
                value: this.routes(),
                writable: false
            }

        });

        // initialize the base controller.
        this.init();

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

                // get the area.
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

                // set previous and current.
                self[areaKey].previous = curArea;
                self[areaKey].current = nextArea;

                // set area title if enabled.
                if(nextArea && nextArea.title) {
                    // check if the route has a title
                    // otherwise use area title.
                    let title = next.title || nextArea.title;
                    let titleElem = document.querySelector('title');
                    if(title) {
                        title = self.ns + ' ' + title;
                        // convert to title case.
                        title = title.replace(/\w\S*/g,
                            function(txt){return txt.charAt(0).toUpperCase() +
                                txt.substr(1).toLowerCase();
                            });
                        titleElem.innerText = title;
                    }
                }

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
BaseCtrl.$inject = ['$rootScope', '$location', '$http', '$basap', '$injector'];

export default BaseCtrl;