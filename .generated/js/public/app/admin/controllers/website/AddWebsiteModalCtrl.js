var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddWebsiteModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, websiteService, eventTypeService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.websiteService = websiteService;
                this.eventTypeService = eventTypeService;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.data = this.modalOptions.data;
                this.$scope.referralCodes = [];
                if (!this.$scope.data) {
                    this.$scope.data = {};
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveWebsiteData();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                if (this.$scope.data.referralCodes && this.$scope.data.referralCodes.length > 0) {
                    this.$scope.referralCodes = this.$scope.data.referralCodes;
                }
            }
            loadInitialData() {
                this.getActiveEventtypes();
                this.loadCatchaMode();
                this.loadStorageMode();
                var tables = intranet.common.enums.TableProvider;
                this.$scope.tableProviders = intranet.common.helpers.Utility.enumToArray(tables);
                if (this.$scope.data.allowedProvider) {
                    this.$scope.tableProviders.forEach((e) => {
                        var index = this.$scope.data.allowedProvider.indexOf(e.id);
                        if (index >= 0) {
                            e.checked = true;
                        }
                    });
                }
            }
            loadCatchaMode() {
                var levels = intranet.common.enums.CaptchaMode;
                this.$scope.captchaModes = intranet.common.helpers.Utility.enumToArray(levels);
                if (this.$scope.data.captchaMode > 0) {
                    this.$scope.data.captchaMode = this.$scope.data.captchaMode.toString();
                }
                else {
                    this.$scope.data.captchaMode = intranet.common.enums.CaptchaMode.System;
                }
            }
            loadStorageMode() {
                var levels = intranet.common.enums.StorageMode;
                this.$scope.storageModes = intranet.common.helpers.Utility.enumToArray(levels);
                if (this.$scope.data.storageMode > 0) {
                    this.$scope.data.storageMode = this.$scope.data.storageMode.toString();
                }
                else {
                    this.$scope.data.storageMode = intranet.common.enums.StorageMode.LocalStorage.toString();
                }
            }
            getActiveEventtypes() {
                this.eventTypeService.getActiveEventtype()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                        if (this.$scope.data.eventTypeIds) {
                            this.$scope.eventTypes.forEach((e) => {
                                var index = this.$scope.data.eventTypeIds.indexOf(e.id);
                                if (index >= 0) {
                                    e.checked = true;
                                }
                            });
                        }
                    }
                }).finally(() => { this.eventTypeChanged(false); });
            }
            eventTypeChanged(all = false) {
                if (all) {
                    this.$scope.eventTypes.forEach((a) => { a.checked = this.$scope.selectAllEventTypes; });
                }
                else {
                    var result = this.$scope.eventTypes.every((a) => { return a.checked == true; });
                    this.$scope.selectAllEventTypes = result;
                }
            }
            tableProviderChanged(all = false) {
                if (all) {
                    this.$scope.tableProviders.forEach((a) => { a.checked = this.$scope.selectAllTables; });
                }
                else {
                    var result = this.$scope.tableProviders.every((a) => { return a.checked == true; });
                    this.$scope.selectAllTables = result;
                }
            }
            addCode() { this.$scope.referralCodes.push({ referralCode: '', userLimit: 0, userCreated: 0 }); }
            removeCode(index) { this.$scope.referralCodes.splice(index, 1); }
            saveWebsiteData() {
                var model = {
                    id: 0,
                    name: this.$scope.data.name,
                    hosts: this.$scope.data.hosts,
                    url: this.$scope.data.url,
                    supportDetails: this.$scope.data.supportDetails,
                    hasTradefair: this.$scope.data.hasTradefair,
                    hasCasino: this.$scope.data.hasCasino,
                    isBetfair: this.$scope.data.isBetfair,
                    captchaMode: this.$scope.data.captchaMode,
                    storageMode: this.$scope.data.storageMode,
                    isRegisterEnabled: this.$scope.data.isRegisterEnabled,
                    pathServiceId: this.$scope.data.pathServiceId,
                    isB2C: this.$scope.data.isB2C,
                    channelName: this.$scope.data.channelName,
                    botApiKey: this.$scope.data.botApiKey,
                    eventTypeIds: [],
                    allowedProvider: [],
                    hasReferral: this.$scope.data.hasReferral,
                    maxCasinoPl: this.$scope.data.maxCasinoPl,
                    currentCasinoPl: this.$scope.data.currentCasinoPl,
                    allowLineMarket: this.$scope.data.allowLineMarket,
                };
                var invalidCode = false;
                angular.forEach(this.$scope.referralCodes, (r) => {
                    if (!r.referralCode || r.userLimit <= 0) {
                        invalidCode = true;
                    }
                });
                if (invalidCode) {
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(8, "Referral code must not be blank and user limit must be greater than 0", ''));
                }
                else {
                    model.referralCodes = this.$scope.referralCodes;
                    this.$scope.eventTypes.forEach((e) => {
                        if (e.checked) {
                            model.eventTypeIds.push(e.id);
                        }
                    });
                    this.$scope.tableProviders.forEach((e) => {
                        if (e.checked) {
                            model.allowedProvider.push(e.id);
                        }
                    });
                    if (this.$scope.data.id) {
                        model.id = this.$scope.data.id;
                    }
                    var promise;
                    if (this.$scope.data.id) {
                        promise = this.websiteService.updateWebsite(model);
                    }
                    else {
                        promise = this.websiteService.addWebsite(model);
                    }
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
        }
        admin.AddWebsiteModalCtrl = AddWebsiteModalCtrl;
        angular.module('intranet.admin').controller('addWebsiteModalCtrl', AddWebsiteModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddWebsiteModalCtrl.js.map