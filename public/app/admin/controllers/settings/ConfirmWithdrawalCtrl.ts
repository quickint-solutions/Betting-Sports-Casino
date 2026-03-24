module intranet.admin {

    export interface IConfirmWIthdrawalScope extends intranet.common.IScopeBase {
        gridItems: any[];
        search: any;
        withdrawalStatusList: any[];
    }

    export class ConfirmWithdrawalCtrl extends intranet.common.ControllerBase<IConfirmWIthdrawalScope>
        implements common.init.IInit {
        constructor($scope: IConfirmWIthdrawalScope,
            private toasterService: intranet.common.services.ToasterService,
            private paymentService: services.PaymentService,
            private settings: common.IBaseSettings,
            private $filter: any,
            protected $rootScope: any,
            private accountService: services.AccountService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                isConfirm: false,
                fromDate: new Date(moment().format("DD MMM YYYY HH:mm")),
                toDate: new Date(moment().add(2, 'd').format("DD MMM YYYY HH:mm")),
                status: common.enums.WithdrawalStatus.Pending.toString()
            };
            this.$scope.withdrawalStatusList = [];
        }

        public loadInitialData(): void {
            var status: any = common.enums.WithdrawalStatus;
            this.$scope.withdrawalStatusList = common.helpers.Utility.enumToArray<common.enums.WithdrawalStatus>(status);
            this.$scope.withdrawalStatusList.splice(0, 0, { id: -1, name: '-- Select Request Status --' });
        }

        private getStatus(status: any): string {
            return common.enums.WithdrawalStatus[status];
        }

        // callback : used to load grid
        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = {};
            searchquery.isConfirm = this.$scope.search.isConfirm;
            searchquery.fromDate = common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
            searchquery.toDate = common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
            if (this.$scope.search.status > 0) searchquery.status = this.$scope.search.status;
            return this.paymentService.getAllPaytmWithdrawal({ params: params, searchQuery: searchquery });
        }

        private confirmWithdrawal(item: any): void {
            this.confirm(item);
        }
        private rejectWithdrawal(item: any): void {
            this.confirm(item, true);
        }

        private confirm(item: any, isreject: boolean = false) {
            var model: any = {};
            model.withdrawalId = item.id;
            model.remarks = item.remarks;
            model.reject = isreject;

            this.paymentService.confirmPaytmWithdrawal(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.refreshGrid();
                    }
                    this.toasterService.showMessages(response.messages, 3000);
                });
        }

        private resetCriteria(): void {
            this.$scope.search.isConfirm = false;
            this.$scope.search.fromDate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.search.toDate = new Date(moment().add(2, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.search.status= common.enums.WithdrawalStatus.Pending.toString();
            this.refreshGrid();
        }
    }

    angular.module('intranet.admin').controller('confirmWithdrawalCtrl', ConfirmWithdrawalCtrl);
}