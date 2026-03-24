var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MyAccountCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, $location) {
                super($scope);
                this.settings = settings;
                this.$location = $location;
                this.$scope.footerTemplate = this.settings.ThemeName + '/template/footer.html';
            }
            isActive(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
            }
        }
        home.MyAccountCtrl = MyAccountCtrl;
        angular.module('intranet.home').controller('myAccountCtrl', MyAccountCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MyAccountCtrl.js.map