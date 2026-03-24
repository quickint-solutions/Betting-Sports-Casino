var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class CPAccessModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, permissionTypes, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.permissionTypes = permissionTypes;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.permissionList = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.user = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveUser();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.$scope.permissionList.push({ name: 'Manage Downline', access: 1 });
                this.$scope.permissionList.push({ name: 'Transfer', access: 1 });
                this.$scope.permissionList.push({ name: 'Risk Management', access: 1 });
                this.$scope.permissionList.push({ name: 'Reports', access: 1 });
                this.$scope.permissionList.push({ name: 'PT ON/Off', access: 1 });
                this.$scope.permissionList.push({ name: 'Statements', access: 1 });
                this.$scope.permissionList.push({ name: 'Aggregate Accounts', access: 1 });
                this.$scope.permissionList.push({ name: 'Banking D/W', access: 3 });
                this.setExistingPermission();
            }
            setExistingPermission() {
                if (this.$scope.user.permission) {
                    angular.forEach(this.$scope.user.permission, (p) => {
                        switch (p) {
                            case this.permissionTypes.MANAGE_DOWNLINE_VIEW_ONLY:
                                this.$scope.permissionList[0].access = 2;
                                break;
                            case this.permissionTypes.MANAGE_DOWNLINE_FULLACCESS:
                                this.$scope.permissionList[0].access = 3;
                                break;
                            case this.permissionTypes.TRANSFER_FULLACCESS:
                                this.$scope.permissionList[1].access = 3;
                                break;
                            case this.permissionTypes.RISK_MANAGEMENT_FULLACCESS:
                                this.$scope.permissionList[2].access = 3;
                                break;
                            case this.permissionTypes.REPORTS_FULLACCESS:
                                this.$scope.permissionList[3].access = 3;
                                break;
                            case this.permissionTypes.PT_ON_OFF_FULLACCESS:
                                this.$scope.permissionList[4].access = 3;
                                break;
                            case this.permissionTypes.STATEMENTS_FULLACCESS:
                                this.$scope.permissionList[5].access = 3;
                                break;
                            case this.permissionTypes.AGGREGATE_ACCOUNTS_FULLACCESS:
                                this.$scope.permissionList[6].access = 3;
                                break;
                            case this.permissionTypes.BANKING_DW_FULLACCESS:
                                this.$scope.permissionList[7].access = 3;
                                break;
                        }
                    });
                }
            }
            saveUser() {
                var model = { id: '', permission: [] };
                model.permission = [];
                model.id = this.$scope.user.id;
                angular.forEach(this.$scope.permissionList, (p, index) => {
                    switch (index) {
                        case 0:
                            if (p.access == 2) {
                                model.permission.push(this.permissionTypes.MANAGE_DOWNLINE_VIEW_ONLY);
                            }
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.MANAGE_DOWNLINE_FULLACCESS);
                            }
                            break;
                        case 1:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.TRANSFER_FULLACCESS);
                            }
                            break;
                        case 2:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.RISK_MANAGEMENT_FULLACCESS);
                            }
                            break;
                        case 3:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.REPORTS_FULLACCESS);
                            }
                            break;
                        case 4:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.PT_ON_OFF_FULLACCESS);
                            }
                            break;
                        case 5:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.STATEMENTS_FULLACCESS);
                            }
                            break;
                        case 6:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.AGGREGATE_ACCOUNTS_FULLACCESS);
                            }
                            break;
                        case 7:
                            if (p.access == 3) {
                                model.permission.push(this.permissionTypes.BANKING_DW_FULLACCESS);
                            }
                            break;
                    }
                });
                var promise;
                promise = this.userService.updateAdminUserPermission(model);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        master.CPAccessModalCtrl = CPAccessModalCtrl;
        angular.module('intranet.master').controller('cPAccessModalCtrl', CPAccessModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CPAccessModalCtrl.js.map