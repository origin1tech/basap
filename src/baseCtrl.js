
/**
 * Base controller class.
 * @class
 */
class BaseCtrl {

    constructor($rootScope, $basap, $injector, $timeout) {

        var extend = {};

        this.$timeout = $timeout;

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

        // if uiRouter get state.
        if(this.routerName === 'uiRouter'){
            this.$state = this.tryInject($injector, '$state');
        }

        // initialize the base controller.
        this.init();

    }

    /**
     * TODO: need to redo this method looks ugly could improve table until have time.
     * Initialize routing event listeners.
     * for detecting areas and defining
     * page titles.
     */
    init() {

        var self = this,
            config = this.routerConfig;

        var $timeout = this.$timeout;

        // angular 2.x router does not
        // expose start, change, error
        // broadcast events.
        if(this.routerName !== 'ngNewRouter'){

            let cur = 2,
                next = 1,
                areaKey = this.areaKey,
                $rootScope = this.$rootScope,
                stRteKey = 'State',
                curArea, nextArea,
                curRoute, nextRoute,
                origAreas;

            // params for current route
            // in 3 pos withing arguments.
            if(this.routerName === 'uiRouter')
                cur = 3;
            else
                stRteKey = 'Route';

            // listen for route start events
            // add active area to $rootScope.
            this.$rootScope.$on(config.startEvent, function () {

                // race issue, use try/catch
                // in interim to prevent err.
                try {

                    // get the area.
                    self[areaKey] =  self[areaKey] || {};

                    // get current and next areas.
                    curArea = arguments[cur] ? arguments[cur] : undefined;
                    nextArea = arguments[next] ? arguments[next]: undefined;

                    // if no curArea initial
                    // page load set to home area.
                    if(!curArea)
                        curArea = nextArea;

                    // set current and next route data.
                    if(curArea.$$route){
                        curRoute = curArea.$$route;
                        nextRoute = nextArea.$$route;
                    } else {
                        curRoute = curArea;
                        nextRoute = nextArea;
                        if(self.$state){
                            if(curRoute && curRoute.regexp)
                                delete curRoute.regexp;
                            nextRoute.regexp = self.$state.$current.url.regexp;
                        }
                    }

                    // handle route titles.
                    curRoute.title = curRoute.title || curRoute.name;
                    nextRoute.title = nextRoute.title || nextRoute.name;

                    if(/\./g.test(curRoute.title )){
                        let tmp = curRoute.title .split('.');
                        curRoute.title  = tmp.pop();
                    }

                    if(/\./g.test(nextRoute.title )){
                        let tmp = nextRoute.title .split('.');
                        nextRoute.title  = tmp.pop();
                    }

                    if(curRoute.title)
                        curRoute.title = curRoute.title.charAt(0).toUpperCase() +
                            curRoute.title.slice(1);
                    if(nextRoute.title)
                        nextRoute.title = nextRoute.title.charAt(0).toUpperCase() +
                            nextRoute.title.slice(1);

                    // lookup the areas.
                    curArea = self.areas[curArea[areaKey]];
                    nextArea = self.areas[nextArea[areaKey]];

                    // set previous and current.
                    self[areaKey].previous = curArea || {};
                    self[areaKey].current = nextArea;

                    // extend with route config info.
                    self[areaKey].previous.route = curRoute;
                    self[areaKey].current.route = nextRoute;

                    // set area title if enabled.
                    if(nextArea && nextArea.title) {
                        // check if the route has a title
                        // otherwise use area title.
                        let title = nextRoute.title || nextArea.title;
                        let titleElem = document.querySelector('title');
                        if(title) {
                            // convert to title case.
                            title = title.replace(/\w\S*/g,
                                function(txt){return txt.charAt(0).toUpperCase() +
                                    txt.substr(1).toLowerCase();
                                });
                            title = self.name + ' ' + title;
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

                    // set the active state/route.
                    $rootScope[`prev${stRteKey}`] = self[`prev${stRteKey}`] = curRoute;
                    $rootScope[`active${stRteKey}`] = self[`active${stRteKey}`] = nextRoute;

                } catch(e) {

                }

            });

            // listen for route error events
            this.$rootScope.$on(config.successEvent, function (...args) {

                if(self.$state){
                    let to = args[1];
                    if(to.params && to.params.invoke)
                        self.$state.go(to.params.invoke);
                }

                $timeout(function() {
                    origAreas = undefined;
                    curRoute = undefined;
                    nextRoute = undefined;
                })

            });

            // listen for route error events
            this.$rootScope.$on(config.errorEvent, function () {
                // set back to original areas
                self[areaKey] = origAreas;
                $rootScope[`active${stRteKey}`] = self[`active${stRteKey}`] = curRoute;
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
BaseCtrl.$inject = ['$rootScope', '$basap', '$injector', '$timeout'];

export default BaseCtrl;