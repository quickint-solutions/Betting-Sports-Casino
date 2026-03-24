
module intranet.admin {
    export interface IAddWebsiteModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
        eventTypes: any[];
        captchaModes: any[];
        storageModes: any[];
        selectAllEventTypes: any;
        referralCodes: any[];
        tableProviders: any[];
        selectAllTables: any;
    }

    export class AddWebsiteModalCtrl extends intranet.common.ControllerBase<IAddWebsiteModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddWebsiteModalScope,
            private websiteService: services.WebsiteService,
            private eventTypeService: services.EventTypeService,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.data = this.modalOptions.data;
            this.$scope.referralCodes = [];
            if (!this.$scope.data) { this.$scope.data = {}; }


            this.$scope.modalOptions.ok = result => {
                this.saveWebsiteData();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            if (this.$scope.data.referralCodes && this.$scope.data.referralCodes.length > 0) {
                this.$scope.referralCodes = this.$scope.data.referralCodes;
            }
        }

        public loadInitialData(): void {
            this.getActiveEventtypes();
            this.loadCatchaMode();
            this.loadStorageMode();

            var tables: any = common.enums.TableProvider;
            this.$scope.tableProviders = common.helpers.Utility.enumToArray<common.enums.TableProvider>(tables);
            if (this.$scope.data.allowedProvider) {
                this.$scope.tableProviders.forEach((e: any) => {
                    var index = this.$scope.data.allowedProvider.indexOf(e.id);
                    if (index >= 0) {
                        e.checked = true;
                    }
                });
            }
        }

        private loadCatchaMode(): void {
            var levels: any = common.enums.CaptchaMode;
            this.$scope.captchaModes = common.helpers.Utility.enumToArray<common.enums.CaptchaMode>(levels);
            if (this.$scope.data.captchaMode > 0) { this.$scope.data.captchaMode = this.$scope.data.captchaMode.toString(); }
            else { this.$scope.data.captchaMode = common.enums.CaptchaMode.System; }
        }

        private loadStorageMode(): void {
            var levels: any = common.enums.StorageMode;
            this.$scope.storageModes = common.helpers.Utility.enumToArray<common.enums.StorageMode>(levels);
            if (this.$scope.data.storageMode > 0) { this.$scope.data.storageMode = this.$scope.data.storageMode.toString(); }
            else { this.$scope.data.storageMode = common.enums.StorageMode.LocalStorage.toString(); }
        }

        private getActiveEventtypes(): void {
            this.eventTypeService.getActiveEventtype()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                        if (this.$scope.data.eventTypeIds) {
                            this.$scope.eventTypes.forEach((e: any) => {
                                var index = this.$scope.data.eventTypeIds.indexOf(e.id);
                                if (index >= 0) {
                                    e.checked = true;
                                }
                            });
                        }
                    }
                }).finally(() => { this.eventTypeChanged(false); });
        }

        private eventTypeChanged(all: boolean = false): void {
            if (all) {
                this.$scope.eventTypes.forEach((a: any) => { a.checked = this.$scope.selectAllEventTypes; });
            }
            else {
                var result = this.$scope.eventTypes.every((a: any) => { return a.checked == true; });
                this.$scope.selectAllEventTypes = result;
            }
        }

        private tableProviderChanged(all: boolean = false): void {
            if (all) {
                this.$scope.tableProviders.forEach((a: any) => { a.checked = this.$scope.selectAllTables; });
            }
            else {
                var result = this.$scope.tableProviders.every((a: any) => { return a.checked == true; });
                this.$scope.selectAllTables = result;
            }
        }

        private addCode() { this.$scope.referralCodes.push({ referralCode: '', userLimit: 0, userCreated: 0 }); }

        private removeCode(index: any) { this.$scope.referralCodes.splice(index, 1); }

        private saveWebsiteData(): void {
            var model: any = {
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
            angular.forEach(this.$scope.referralCodes, (r: any) => {
                if (!r.referralCode || r.userLimit <= 0) { invalidCode = true; }
            });

            if (invalidCode) {
                this.$scope.messages.push(new common.messaging.ResponseMessage(8, "Referral code must not be blank and user limit must be greater than 0", ''));

            } else {
                model.referralCodes = this.$scope.referralCodes;

                this.$scope.eventTypes.forEach((e: any) => {
                    if (e.checked) {
                        model.eventTypeIds.push(e.id);
                    }
                });
                this.$scope.tableProviders.forEach((e: any) => {
                    if (e.checked) {
                        model.allowedProvider.push(e.id);
                    }
                });

                if (this.$scope.data.id) { model.id = this.$scope.data.id; }

                var promise: ng.IHttpPromise<any>;
                if (this.$scope.data.id) {
                    promise = this.websiteService.updateWebsite(model);
                }
                else {
                    promise = this.websiteService.addWebsite(model);
                }
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


    angular.module('intranet.admin').controller('addWebsiteModalCtrl', AddWebsiteModalCtrl);
}