var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PaymentReceivedCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, settings, $timeout, $stateParams, $sce, $window, $location, $filter) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.$timeout = $timeout;
                this.$stateParams = $stateParams;
                this.$sce = $sce;
                this.$window = $window;
                this.$location = $location;
                this.$filter = $filter;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                if (this.$location.$$search && this.$location.$$search.transaction_id) {
                    this.$scope.transactionId = this.$location.$$search.transaction_id;
                }
                if (this.$stateParams.status == 1) {
                    this.$scope.isSuccess = true;
                }
            }
            loadInitialData() {
                this.$timeout(() => {
                    this.$window.opener.setData({ status: this.$stateParams.status });
                    this.$window.close();
                }, 5000);
            }
            closeMe() {
                this.$window.opener.setData({ status: this.$stateParams.status });
                this.$window.close();
            }
        }
        home.PaymentReceivedCtrl = PaymentReceivedCtrl;
        angular.module('intranet.home').controller('paymentReceivedCtrl', PaymentReceivedCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PaymentReceivedCtrl.js.map