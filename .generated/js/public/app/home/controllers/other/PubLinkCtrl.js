var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PubLinkCtrl extends intranet.common.ControllerBase {
            constructor($scope, $location, settings) {
                super($scope);
                this.$location = $location;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.webname = this.settings.Title;
                this.$scope.host = this.$location.$$host;
                this.$scope.absUrl = this.$location.$$absUrl.split('#')[0];
            }
            loadInitialData() {
            }
        }
        home.PubLinkCtrl = PubLinkCtrl;
        angular.module('intranet.home').controller('pubLinkCtrl', PubLinkCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PubLinkCtrl.js.map