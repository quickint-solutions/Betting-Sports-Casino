module intranet.master {
    export interface IAddDepositEntryModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;

        userList: any[];
        promiseItem: any;
        password: any;
    }

    export class AddDepositEntryModalCtrl extends intranet.common.ControllerBase<IAddDepositEntryModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddDepositEntryModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private paymentService: services.PaymentService,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.userList = [];
            this.$scope.item = {};
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.password = 'Gameokhan@111';

            this.$scope.modalOptions.ok = result => {
                this.saveDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.userService.findMembers(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.userList = response.data;
                        if (this.$scope.userList && this.$scope.userList.length > 0) {
                            this.$scope.userList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.userList.splice(0);
            }
        }

        private saveDetail(): void {
            if (this.$scope.item.password === this.$scope.password) {
                var promise: ng.IHttpPromise<any>;
                var model: any = {};
                model.transactionHash = this.$scope.item.transactionHash;
                model.bfic = this.$scope.item.bfic;
                model.rate = this.$scope.item.rate;
                model.amount = this.$filter('toGLC')(this.$scope.item.amount);
                model.tokenAddress = this.$scope.item.tokenAddress;
                model.walletAddress = this.$scope.item.walletAddress;

                if (this.$scope.item.selectedUser) {
                    model.userId = this.$scope.item.selectedUser.id;
                }

                promise = this.paymentService.addGameOkPayment(model);
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
            } else {
                this.toasterService.showToast(common.helpers.ToastType.Warning, 'Password is wrong.', 3000);
            }
        }

    }

    angular.module('intranet.master').controller('addDepositEntryModalCtrl', AddDepositEntryModalCtrl);
}