var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ConfirmWithdrawalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, paymentService, settings, $filter, $rootScope, accountService) {
                super($scope);
                this.toasterService = toasterService;
                this.paymentService = paymentService;
                this.settings = settings;
                this.$filter = $filter;
                this.$rootScope = $rootScope;
                this.accountService = accountService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    isConfirm: false,
                    fromDate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    toDate: new Date(moment().add(2, 'd').format("DD MMM YYYY HH:mm")),
                    status: intranet.common.enums.WithdrawalStatus.Pending.toString()
                };
                this.$scope.withdrawalStatusList = [];
            }
            loadInitialData() {
                var status = intranet.common.enums.WithdrawalStatus;
                this.$scope.withdrawalStatusList = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.withdrawalStatusList.splice(0, 0, { id: -1, name: '-- Select Request Status --' });
            }
            getStatus(status) {
                return intranet.common.enums.WithdrawalStatus[status];
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getItems(params, filters) {
                var searchquery = {};
                searchquery.isConfirm = this.$scope.search.isConfirm;
                searchquery.fromDate = intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
                searchquery.toDate = intranet.common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
                if (this.$scope.search.status > 0)
                    searchquery.status = this.$scope.search.status;
                return this.paymentService.getAllPaytmWithdrawal({ params: params, searchQuery: searchquery });
            }
            confirmWithdrawal(item) {
                this.confirm(item);
            }
            rejectWithdrawal(item) {
                this.confirm(item, true);
            }
            confirm(item, isreject = false) {
                var model = {};
                model.withdrawalId = item.id;
                model.remarks = item.remarks;
                model.reject = isreject;
                this.paymentService.confirmPaytmWithdrawal(model)
                    .success((response) => {
                    if (response.success) {
                        this.refreshGrid();
                    }
                    this.toasterService.showMessages(response.messages, 3000);
                });
            }
            resetCriteria() {
                this.$scope.search.isConfirm = false;
                this.$scope.search.fromDate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.search.toDate = new Date(moment().add(2, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.status = intranet.common.enums.WithdrawalStatus.Pending.toString();
                this.refreshGrid();
            }
        }
        admin.ConfirmWithdrawalCtrl = ConfirmWithdrawalCtrl;
        angular.module('intranet.admin').controller('confirmWithdrawalCtrl', ConfirmWithdrawalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ConfirmWithdrawalCtrl.js.map