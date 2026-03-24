module intranet.home {

    export interface IPaymentReceivedScope extends intranet.common.IScopeBase {
        isSuccess: any;
        transactionId: any;
        webImagePath: any;
    }

    export class PaymentReceivedCtrl extends intranet.common.ControllerBase<IPaymentReceivedScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPaymentReceivedScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private $timeout: any,
            private $stateParams:any,
            private $sce: any,
            private $window: any,
            private $location: any,
            private $filter: any) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';

            if (this.$location.$$search && this.$location.$$search.transaction_id) {
                this.$scope.transactionId = this.$location.$$search.transaction_id;
            }

            if (this.$stateParams.status == 1) {
                this.$scope.isSuccess = true;
            }
        }

        public loadInitialData(): void {
            this.$timeout(() => {
                this.$window.opener.setData({ status: this.$stateParams.status });
                this.$window.close();
            }, 5000);
        }

        private closeMe(): void {
            this.$window.opener.setData({ status: this.$stateParams.status });
            this.$window.close();
        }



    }
    angular.module('intranet.home').controller('paymentReceivedCtrl', PaymentReceivedCtrl);
}