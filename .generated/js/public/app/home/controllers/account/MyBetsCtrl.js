var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MyBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, $location) {
                super($scope);
                this.$location = $location;
                super.init(this);
            }
            initScopeValues() {
            }
            loadInitialData() {
            }
            isActive(path) {
                return (this.$location.$$url == path) ? 'active' : '';
            }
        }
        home.MyBetsCtrl = MyBetsCtrl;
        angular.module('intranet.home').controller('myBetsCtrl', MyBetsCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MyBetsCtrl.js.map