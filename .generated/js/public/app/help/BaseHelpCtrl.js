var intranet;
(function (intranet) {
    var help;
    (function (help) {
        class BaseHelpCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, $stateParams) {
                super($scope);
                this.settings = settings;
                this.$stateParams = $stateParams;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.logo = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/login-logo.png';
            }
            loadInitialData() {
            }
        }
        help.BaseHelpCtrl = BaseHelpCtrl;
        angular.module('intranet.help').controller('baseHelpCtrl', BaseHelpCtrl);
    })(help = intranet.help || (intranet.help = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BaseHelpCtrl.js.map