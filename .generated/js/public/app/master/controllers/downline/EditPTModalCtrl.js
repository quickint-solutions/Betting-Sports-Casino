var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class EditPTModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, settings, currencyService, configService, $stateParams, $translate, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.settings = settings;
                this.currencyService = currencyService;
                this.configService = configService;
                this.$stateParams = $stateParams;
                this.$translate = $translate;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
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
                    if (this.$scope.member.bulkEdit) {
                        this.saveBulkPT();
                    }
                    else {
                        this.savePlayerPT();
                    }
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.getEventTypes();
            }
            getCurrentUserPT() {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser && loggeduser.id == this.$scope.member.parentId && loggeduser.ptConfigs) {
                    angular.forEach(loggeduser.ptConfigs, (mypt) => {
                        angular.forEach(this.$scope.ptConfigList, (pt) => {
                            if (pt.code == mypt.code) {
                                pt.maxpt = mypt.givePt;
                            }
                        });
                    });
                }
                else {
                    this.userService.getUserById(this.$scope.member.parentId)
                        .success((response) => {
                        if (response.success && response.data) {
                            if (response.data.ptConfigs) {
                                angular.forEach(response.data.ptConfigs, (mypt) => {
                                    angular.forEach(this.$scope.ptConfigList, (pt) => {
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
            getPtConfig() {
                var userid = this.$scope.member.userId;
                this.userService.getUserById(userid)
                    .success((response) => {
                    if (response.success && response.data) {
                        if (response.data.ptConfigs) {
                            this.$scope.allPTConfigList = response.data.ptConfigs;
                            angular.forEach(response.data.ptConfigs, (mypt) => {
                                angular.forEach(this.$scope.ptConfigList, (pt) => {
                                    if (pt.code == mypt.code) {
                                        pt.takePt = mypt.takePt;
                                        pt.givePt = mypt.givePt;
                                        if (this.$scope.member.userType == intranet.common.enums.UserType.Player) {
                                            pt.hideGivePt = true;
                                        }
                                    }
                                });
                            });
                        }
                    }
                });
            }
            getEventTypes() {
                var codes = intranet.common.enums.PTCode;
                var ptCodes = intranet.common.helpers.Utility.enumToArray(codes);
                this.$scope.ptConfigList = [];
                angular.forEach(ptCodes, (d) => {
                    this.$scope.ptConfigList.push({ code: d.id, ptCodeName: d.name, isvalid: true, takePt: 0, givePt: 0 });
                });
                if (!this.$scope.member.bulkEdit) {
                    this.getPtConfig();
                }
                this.getCurrentUserPT();
            }
            ptConfigSameAll(st) {
                this.$scope.isSamePtConfig = st;
                if (this.$scope.isSamePtConfig) {
                    if (this.$scope.ptConfigList.length > 0) {
                        var firstPTConfig = this.$scope.ptConfigList[0];
                        angular.forEach(this.$scope.ptConfigList, (b, index) => {
                            if (index > 0) {
                                b.takePt = firstPTConfig.takePt;
                                b.givePt = firstPTConfig.givePt;
                            }
                        });
                    }
                }
            }
            ptConfigChange(field) {
                if (this.$scope.isSamePtConfig) {
                    if (this.$scope.ptConfigList.length > 0) {
                        var firstBetConfig = this.$scope.ptConfigList[0];
                        angular.forEach(this.$scope.ptConfigList, (b, index) => {
                            if (index > 0) {
                                b[field] = firstBetConfig[field];
                            }
                        });
                    }
                }
            }
            validatePT(p) {
                if (math.add(p.takePt, p.givePt) > p.maxpt) {
                    p.isvalid = false;
                }
                else {
                    p.isvalid = true;
                }
            }
            savePlayerPT() {
                var item = {};
                angular.copy(this.$scope.member, item);
                var model = {
                    userId: this.$scope.member.userId,
                    modelList: []
                };
                angular.forEach(this.$scope.ptConfigList, (pt) => {
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
                    angular.forEach(this.$scope.allPTConfigList, (ap) => {
                        var isExist = false;
                        angular.forEach(model.modelList, (mpt) => {
                            if (ap.eventTypeId == mpt.eventTypeId) {
                                isExist = true;
                            }
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
                var ptpromise;
                ptpromise = this.userService.updatePtConfig([model]);
                this.commonDataService.addPromise(ptpromise);
                ptpromise.success((response) => {
                    this.toasterService.showMessages(response.messages, 3000);
                    if (response.success) {
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                });
            }
            saveBulkPT() {
                var item = {};
                angular.copy(this.$scope.member, item);
                angular.forEach(this.$scope.member.downlineList, (d, index) => {
                    var ptConfig = {
                        userId: d.id,
                        modelList: []
                    };
                    angular.forEach(this.$scope.ptConfigList, (pt) => {
                        ptConfig.modelList.push({
                            userId: d.id,
                            code: pt.code,
                            takePt: pt.takePt,
                            givePt: pt.givePt,
                        });
                    });
                    var ptpromise;
                    ptpromise = this.configService.updatePtConfig([ptConfig]);
                    this.commonDataService.addPromise(ptpromise);
                    ptpromise.success((response) => {
                        this.toasterService.showMessages(response.messages, 3000);
                        if (response.success && index == this.$scope.member.downlineList.length - 1) {
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                    });
                });
            }
        }
        master.EditPTModalCtrl = EditPTModalCtrl;
        angular.module('intranet.master').controller('editPTModalCtrl', EditPTModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EditPTModalCtrl.js.map