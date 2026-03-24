module intranet.master {
    export interface ITransferModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        totalChips: any;
        isPlayer: boolean;
    }

    export class TransferModalCtrl extends intranet.common.ControllerBase<ITransferModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ITransferModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.totalChips = 0;

            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.item = this.modalOptions.data;
                if (this.$scope.item.chips) {
                    this.$scope.totalChips = angular.isNumber(this.$scope.item.chips) ? this.$scope.item.chips : parseFloat(this.$scope.item.chips.replaceAll(',', ''));
                    this.$scope.item.chips = angular.isNumber(this.$scope.item.chips) ? this.$scope.item.chips : parseFloat(this.$scope.item.chips.replaceAll(',', ''));
                }
                this.$scope.isPlayer = this.$scope.item.userType == common.enums.UserType.Player;
                this.$scope.item.settleBalance = true;
            }

            this.$scope.modalOptions.ok = result => {
                this.transferBalance();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private chipsChange(): void {
            this.$scope.item.isvalid = true;
        }

        private transferBalance(): void {
            var item: any = {};
            angular.copy(this.$scope.item, item);
            if (item.chips.length > 0 || item.chips > 0) {
                item.chips = angular.isNumber(item.chips) ? item.chips : parseFloat(item.chips.replaceAll(',', ''));
                var model: any = {
                    isTransfer: true,
                    chips: item.chips,
                    userId: item.id,
                    dwType: item.dwType,
                    comment: item.comment,
                    timestamp: moment().format('x'),
                };
                if (model) {

                    var promise: ng.IHttpPromise<any>;

                    model.chips = this.$filter('toGLC')(item.chips);
                    if (model.dwType == 'D') {
                        if (this.$scope.item.userType == common.enums.UserType.Player) {
                            model.settleBalance = item.settleBalance;
                            promise = this.accountService.IN(model);
                        } else {
                            promise = this.accountService.transferIn(model);
                        }
                    } else {
                        if (this.$scope.item.userType == common.enums.UserType.Player) {
                            model.settleBalance = item.settleBalance;
                            promise = this.accountService.OUT(model);
                        } else {
                            promise = this.accountService.transferOut(model);
                        }
                    }

                    if (promise) {
                        this.commonDataService.addPromise(promise);
                        promise.success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.toasterService.showMessages(response.messages, 3000);
                                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                            }
                            else {
                                this.$scope.messages = response.messages;
                            }
                        });
                    }
                }
            }
        }
    }

    angular.module('intranet.master').controller('transferModalCtrl', TransferModalCtrl);
}