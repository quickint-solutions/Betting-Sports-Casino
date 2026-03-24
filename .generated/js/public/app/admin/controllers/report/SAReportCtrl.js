var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAReportCtrl extends intranet.common.ControllerBase {
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
        admin.SAReportCtrl = SAReportCtrl;
        angular.module('intranet.admin').controller('sAReportCtrl', SAReportCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAReportCtrl.js.map