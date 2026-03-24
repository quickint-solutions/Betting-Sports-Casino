module intranet.master {

    export interface IMasterScope extends intranet.common.IScopeBase {
        balanceInfo: any;
        user: any;
        isCPUser: any;
        imagePath: any;

        hideTransferMenu: boolean;
        showB2CSummary: boolean;
        showB2CMenu: boolean;
        canUpdateWhatsapp: boolean;
        showOffersMenu: boolean;
        showBannerMenu: boolean;

        currentWebApp: any;

        timezone: any;
        selectedTimezone: any;

        userTypes: any[];

        currentDate: any;

        announcement: string;

        // has andriod APK
        hasAPK: boolean;

        promiseTracker: any;

        positionTakingStatus: boolean;

        dwPendingCounter: any;
    }

    export class MasterCtrl extends intranet.common.ControllerBase<IMasterScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IMasterScope,
            private settings: common.IBaseSettings,
            private settingService: services.SettingService,
            private commonDataService: common.services.CommonDataService,
            private eventTypeService: services.EventTypeService,
            private accountService: services.AccountService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private modalService: common.services.ModalService,
            private userService: services.UserService,
            private $state: any,
            protected $rootScope: any,
            private websiteService: services.WebsiteService,
            private $interval: any,
            private isMobile: any,
            private $window: any,
            private toasterService: common.services.ToasterService,
            private $sce: any,
            private $location: any) {
            super($scope);

            document.body.setAttribute('class', 'mbg');
            this.$rootScope.viewPort = "";// "width=device-width, initial-scale=0,maximum-scale=1";
            if (this.isMobile.any) {
                document.body.setAttribute('class', 'mbg mini-view');
            }


            var refreshBalance = this.$rootScope.$on("master-balance-changed", () => {
                this.getBalance();

            });

            var currenttime = null;
            //  if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
            currenttime = this.$interval(() => {
                this.$scope.currentDate = new Date();
            }, 1000);
            //}

            var wsListnerAnnouncement = this.$rootScope.$on("ws-announcement-changed", (event, response) => {
                if (response.success) {
                    this.getAnnouncement();
                }
            });

            var wsDWChanged = this.$rootScope.$on("dw-status-changed", (event, response) => {
                this.getPendingDW();
            });

            var wsListnerDeposit = this.$rootScope.$on("ws-deposit-request", (event, response) => {
                this.toasterService.showToast(common.helpers.ToastType.Info, response.data, 10000);
                this.playAudio();
                this.getPendingDW();
            });
            var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request", (event, response) => {
                this.toasterService.showToast(common.helpers.ToastType.Warning, response.data, 10000);
                this.playAudio(false);
                this.getPendingDW();
            });

            var wsListnerBalance = this.$rootScope.$on("ws-balance-changed", (event, response) => {
                if (response.success) {
                    this.getBalance();
                    this.getPendingDW();
                }
            });

            this.$scope.promiseTracker = this.commonDataService.commonPromiseTracker;

            this.$scope.$on('$destroy', () => {
                refreshBalance();
                if (currenttime) { this.$interval.cancel(currenttime); }
                wsListnerAnnouncement();
                wsListnerBalance();
                wsListnerDeposit();
                wsListnerWithdrawal();
                wsDWChanged();
            });

            super.init(this);
        }

        private setInfo(): void {
            if (this.$scope.user.userType == common.enums.UserType.SuperAdmin) {
                this.$rootScope.current = { short: 'SA', usertype: common.enums.UserType.SuperAdmin, userId: this.$scope.user.id }
                this.$rootScope.child = { short: 'AD', usertype: common.enums.UserType.Admin }
            }
            else if (this.$scope.user.userType == common.enums.UserType.Admin) {
                this.$rootScope.current = { short: 'AD', usertype: common.enums.UserType.Admin, userId: this.$scope.user.id }
                this.$rootScope.child = { short: 'CUS', usertype: common.enums.UserType.SuperMaster }
            }
            else if (this.$scope.user.userType == common.enums.UserType.SuperMaster) {
                this.$rootScope.current = { short: 'CUS', usertype: common.enums.UserType.SuperMaster, userId: this.$scope.user.id }
                this.$rootScope.child = { short: 'MA', usertype: common.enums.UserType.Master }
            }
            else if (this.$scope.user.userType == common.enums.UserType.Master) {
                this.$rootScope.current = { short: 'MA', usertype: common.enums.UserType.Master, userId: this.$scope.user.id }
                this.$rootScope.child = { short: 'Agent', usertype: common.enums.UserType.Agent }
            }
            else if (this.$scope.user.userType == common.enums.UserType.Agent) {
                this.$rootScope.current = { short: 'Agent', usertype: common.enums.UserType.Agent, userId: this.$scope.user.id }
                this.$rootScope.child = { short: 'Member', usertype: common.enums.UserType.Player }
            }

            this.localStorageHelper.set("l-m-child", this.$rootScope.child);
        }

        private timezoneChanged(value: any): void {
            this.$scope.selectedTimezone = value;
            this.$rootScope.timezone = value.replace(':', '');
        }

        public loadInitialData(): void {
            this.$scope.currentWebApp = this.settings.WebApp;

            // if (this.settings.IsFirstLogin == true) { this.openTerms(); }
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.isCPUser = this.commonDataService.isCPLogin();
            this.getUserData();
            this.setInfo();

            this.$scope.hasAPK = this.settings.HasAPK;
            this.$scope.userTypes = [];

            this.$scope.timezone = common.helpers.CommonHelper.getTimeZone();
            this.$scope.selectedTimezone = this.$scope.timezone;
            this.$rootScope.timezone = common.helpers.CommonHelper.getTimeZone();

            this.$scope.balanceInfo = {};

            this.loadEventTypes();
            this.getBalance();
            this.getSupportDetail();

            this.fillUserTypes();
            this.getAnnouncement();
            this.getPendingDW();
        }

        private getSupportDetail() {
            this.commonDataService.getSupportDetails().then((data: any) => {
                if (data.isB2C && this.$scope.user.userType == common.enums.UserType.Agent) {
                    if (!this.$scope.isCPUser) {
                        this.$scope.hideTransferMenu = true;
                        this.$scope.canUpdateWhatsapp = true;
                        this.$scope.showOffersMenu = true;
                        this.$scope.showBannerMenu = true;
                    }
                    this.$scope.showB2CMenu = true;
                }
                if (data.isB2C) {
                    this.$scope.showB2CSummary = true;
                }
            });
        }

        private isActive(path: string): string {
            return (this.$location.$$url == path) ? 'active ' : '';
        }

        private isContain(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active ' : '';
        }

        private isDownline(path: string): string {
            var result = '';
            if (this.$location.$$url == path) { result = 'active '; }
            else if (this.$location.$$url.indexOf('/master/member') >= 0) {
                result = 'active ';
            }
            return result;
        }

        private logout(): void {
            this.commonDataService.logout();
        }

        private loadEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                        }
                    }
                });
        }

        private getUserData(): void {
            this.$scope.user = this.commonDataService.getLoggedInUserData();
        }

        private getBalance(): void {
            this.$scope.balanceInfo.isBalanceLoaded = false;
            var promise: ng.IHttpPromise<any>;
            promise = this.accountService.getBalance();
            promise.success((res: common.messaging.IResponse<any>) => {
                if (res.success) {
                    this.$scope.balanceInfo.exposure = res.data.exposure;
                    this.$scope.balanceInfo.balanceUp = res.data.balanceUp;
                    this.$scope.balanceInfo.balanceDown = res.data.balanceDown;
                    this.$scope.balanceInfo.availableCredit = res.data.availableCredit;
                    this.$scope.positionTakingStatus = res.data.ptStatus;
                }
            }).finally(() => { this.$scope.balanceInfo.isBalanceLoaded = true; });
        }

        private fillUserTypes(): void {
            this.$scope.userTypes.push({ id: common.enums.UserType.SuperAdmin, name: 'SA' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Admin, name: 'AD' });
            this.$scope.userTypes.push({ id: common.enums.UserType.SuperMaster, name: 'SM' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Master, name: 'MA' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Agent, name: 'AG' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Player, name: 'PL' });
            this.$scope.userTypes.push({ id: common.enums.UserType.PLS, name: 'PLS' });
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
                return found[0].name;
            }
        }

        private openVideo(): void {
            var url = this.$state.href('glctv');
            this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
        }

        private getAnnouncement(): void {
            this.settingService.getNotifications()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                        } else {
                            this.$scope.announcement = undefined;
                        }
                    }
                });

            //this.messageService.getAnnouncement()
            //    .success((response: common.messaging.IResponse<any>) => {
            //        if (response.success) {
            //            this.$scope.announcement = response.data;
            //        }
            //    });
        }

        private downloadAPK(): void {
            this.commonDataService.downloadMasterAPK();
        }

        private changePassword(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'profile.password.change.modal.header';

            modal.data = {
                userId: this.$scope.user.id
            };
            modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
            modal.controller = 'changePasswordModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private updateWhatsapp(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Update Whatsapp Number';

            modal.bodyUrl = this.settings.ThemeName + '/master/account/update-info-modal.html';
            modal.controller = 'updateInfoModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.websiteService.getSupportDetail()
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.commonDataService.setSupportDetails(response.data);
                            }
                        });
                }
            });
        }

        private openRules(): void {
            this.commonDataService.openWebsiteRules();
        }

        private PTStatusChanged(): void {
            this.userService.changePTstatus(this.$scope.positionTakingStatus)
                .success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages);
                });
        }

        private openTerms(): void {
            this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                    this.userService.firstLoginDone();
                });
            });
        }

        private openHelp(): void {
            var url = this.$state.href('help.creating_agency_user', { 'user': this.$rootScope.child.short });
            this.$window.open(this.$sce.trustAsUrl(url), "Help", "width=900,height=500,left=300,top=150");
        }

        private getPendingDW() {
            this.accountService.getPendingPayInOutCount()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.dwPendingCounter = response.data; }
                });
        }

        private playAudio(isDeposit: boolean = true): void {
            if (isDeposit) {
                var audio = new Audio('audio/d-tone.mp3');
                audio.play();
            } else {
                var audio = new Audio('audio/w-tone.mp3');
                audio.play();
            }
        }
    }
    angular.module('intranet.master').controller('masterCtrl', MasterCtrl);
}