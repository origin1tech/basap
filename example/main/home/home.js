function HomeCtrl($location, $anchorScroll) {
    this.toAnchor = function (id) {
        $location.hash(id);
        $anchorScroll();
    };
}
HomeCtrl.$inject = ['$location', '$anchorScroll'];

export default HomeCtrl;