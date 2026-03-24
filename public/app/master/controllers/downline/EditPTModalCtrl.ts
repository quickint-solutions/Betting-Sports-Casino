module intranet.master {
    export interface IEditPTModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        member: any;

        allPTConfigList: any[];
        ptConfigList: any[];
        isSamePtConfig: boolean;

        parentPSname: string;
        myPSname: string;
    }

    export class EditPTModalCtrl extends intranet.common.ControllerBase<IEditPTModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IEditPTModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private settings: common.IBaseSettings,
            private currencyService: services.CurrencyService,
            private configService: services.ConfigService,
            private $stateParams: any,
            private $translate: ng.translate.ITranslateService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.isSamePtConfig = false;
            this.$scope.member = { betConfig: {} };
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.member = this.modalOptions.data;
            }

            this.$scope.myPSname = super.getUserTypesShort(this.$scope.member.userType);
            this.$scope.parentPSname = super.getUserTypesShort(this.$scope.member.userType - 1);

            this.$scope.modalOptions.ok = result => {
                if (this.$scope.member.bulkEdit) { this.saveBulkPT() }
                else {
                    this.savePlayerPT();
                }
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.getEventTypes();
        }

        // PT COnfig
        private getCurrentUserPT(): void {
            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser && loggeduser.id == this.$scope.member.parentId && loggeduser.ptConfigs) {
                angular.forEach(loggeduser.ptConfigs, (mypt: any) => {
                    angular.forEach(this.$scope.ptConfigList, (pt: any) => {
                        if (pt.code == mypt.code) {
                            pt.maxpt = mypt.givePt;
                        }
                    });
                });
            }
            else {
                this.userService.getUserById(this.$scope.member.parentId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success && response.data) {
                            if (response.data.ptConfigs) {
                                angular.forEach(response.data.ptConfigs, (mypt: any) => {
                                    angular.forEach(this.$scope.ptConfigList, (pt: any) => {
                                        if (pt.code == mypt.code) {
                                            pt.maxpt = mypt.givePt;
                                        }
                                    });
                                });
                            }
                        }
                    });
            }
        }

        private getPtConfig(): void {
            var userid = this.$scope.member.userId;
            this.userService.getUserById(userid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        if (response.data.ptConfigs) {
                            this.$scope.allPTConfigList = response.data.ptConfigs;
                            angular.forEach(response.data.ptConfigs, (mypt: any) => {
                                angular.forEach(this.$scope.ptConfigList, (pt: any) => {
                                    if (pt.code == mypt.code) {
                                        pt.takePt = mypt.takePt;
                                        pt.givePt = mypt.givePt;
                                        if (this.$scope.member.userType == common.enums.UserType.Player) {
                                            pt.hideGivePt = true;
                                        }
                                    }
                                });
                            });
                        }
                    }
                });
        }

        private getEventTypes(): void {
            var codes: any = common.enums.PTCode;
            var ptCodes = common.helpers.Utility.enumToArray<common.enums.PTCode>(codes);
            this.$scope.ptConfigList = [];

            angular.forEach(ptCodes, (d: any) => {
                    this.$scope.ptConfigList.push({ code: d.id, ptCodeName: d.name, isvalid: true, takePt: 0, givePt: 0 });
            });
            if (!this.$scope.member.bulkEdit) { this.getPtConfig(); }
            this.getCurrentUserPT();
        }

        private ptConfigSameAll(st: any): void {
            this.$scope.isSamePtConfig = st;
            if (this.$scope.isSamePtConfig) {
                if (this.$scope.ptConfigList.length > 0) {
                    var firstPTConfig = this.$scope.ptConfigList[0];
                    angular.forEach(this.$scope.ptConfigList, (b: any, index: any) => {
                        if (index > 0) {
                            b.takePt = firstPTConfig.takePt;
                            b.givePt = firstPTConfig.givePt;
                        }
                    });

                }
            }
        }

        private ptConfigChange(field: string): void {
            if (this.$scope.isSamePtConfig) {
                if (this.$scope.ptConfigList.length > 0) {
                    var firstBetConfig = this.$scope.ptConfigList[0];
                    angular.forEach(this.$scope.ptConfigList, (b: any, index: any) => {
                        if (index > 0) {
                            b[field] = firstBetConfig[field];
                        }
                    });
                }
            }
        }

        private validatePT(p: any): void {
            if (math.add(p.takePt, p.givePt) > p.maxpt) {
                p.isvalid = false;
            } else { p.isvalid = true; }
        }


        private savePlayerPT(): void {
            var item: any = {};
            angular.copy(this.$scope.member, item);

            // pt config
            var model = {
                userId: this.$scope.member.userId,
                modelList: []
            };
            angular.forEach(this.$scope.ptConfigList, (pt: any) => {
                model.modelList.push({
                    userId: this.$scope.member.userId,
                    code: pt.code,
                    takePt: pt.takePt,
                    givePt: pt.givePt,
                });
            });

            if (this.$scope.isSamePtConfig) {
                var alltake = model.modelList[0].takePt;
                var allgive = model.modelList[0].givePt;
                angular.forEach(this.$scope.allPTConfigList, (ap: any) => {
                    var isExist = false;
                    angular.forEach(model.modelList, (mpt: any) => {
                        if (ap.eventTypeId == mpt.eventTypeId) { isExist = true; }
                    });
                    if (!isExist) {
                        model.modelList.push({
                            userId: this.$scope.member.userId,
                            code: ap.code,
                            takePt: alltake,
                            givePt: allgive,
                        });
                    }
                });
            }

            var ptpromise: ng.IHttpPromise<any>;
            ptpromise = this.userService.updatePtConfig([model])
            this.commonDataService.addPromise(ptpromise);
            ptpromise.success((response: common.messaging.IResponse<any>) => {
                this.toasterService.showMessages(response.messages, 3000);
                if (response.success) {
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                }
            });
        }

        private saveBulkPT(): void {
            var item: any = {};
            angular.copy(this.$scope.member, item);

            angular.forEach(this.$scope.member.downlineList, (d: any, index: any) => {
                var ptConfig = {
                    userId: d.id,
                    modelList: []
                };
                angular.forEach(this.$scope.ptConfigList, (pt: any) => {
                    ptConfig.modelList.push({
                        userId: d.id,
                        code: pt.code,
                        takePt: pt.takePt,
                        givePt: pt.givePt,
                    });
                });
                var ptpromise: ng.IHttpPromise<any>;
                ptpromise = this.configService.updatePtConfig([ptConfig])
                this.commonDataService.addPromise(ptpromise);
                ptpromise.success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages, 3000);
                    if (response.success && index == this.$scope.member.downlineList.length - 1) {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                });

            });
        }
    }
    angular.module('intranet.master').controller('editPTModalCtrl', EditPTModalCtrl);
}