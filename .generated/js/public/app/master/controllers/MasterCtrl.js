var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class MasterCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, settingService, commonDataService, eventTypeService, accountService, localStorageHelper, modalService, userService, $state, $rootScope, websiteService, $interval, isMobile, $window, toasterService, $sce, $location) {
                super($scope);
                this.settings = settings;
                this.settingService = settingService;
                this.commonDataService = commonDataService;
                this.eventTypeService = eventTypeService;
                this.accountService = accountService;
                this.localStorageHelper = localStorageHelper;
                this.modalService = modalService;
                this.userService = userService;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.websiteService = websiteService;
                this.$interval = $interval;
                this.isMobile = isMobile;
                this.$window = $window;
                this.toasterService = toasterService;
                this.$sce = $sce;
                this.$location = $location;
                document.body.setAttribute('class', 'mbg');
                this.$rootScope.viewPort = "";
                if (this.isMobile.any) {
                    document.body.setAttribute('class', 'mbg mini-view');
                }
                var refreshBalance = this.$rootScope.$on("master-balance-changed", () => {
                    this.getBalance();
                });
                var currenttime = null;
                currenttime = this.$interval(() => {
                    this.$scope.currentDate = new Date();
                }, 1000);
                var wsListnerAnnouncement = this.$rootScope.$on("ws-announcement-changed", (event, response) => {
                    if (response.success) {
                        this.getAnnouncement();
                    }
                });
                var wsDWChanged = this.$rootScope.$on("dw-status-changed", (event, response) => {
                    this.getPendingDW();
                });
                var wsListnerDeposit = this.$rootScope.$on("ws-deposit-request", (event, response) => {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Info, response.data, 10000);
                    this.playAudio();
                    this.getPendingDW();
                });
                var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request", (event, response) => {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Warning, response.data, 10000);
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
                    if (currenttime) {
                        this.$interval.cancel(currenttime);
                    }
                    wsListnerAnnouncement();
                    wsListnerBalance();
                    wsListnerDeposit();
                    wsListnerWithdrawal();
                    wsDWChanged();
                });
                super.init(this);
            }
            setInfo() {
                if (this.$scope.user.userType == intranet.common.enums.UserType.SuperAdmin) {
                    this.$rootScope.current = { short: 'SA', usertype: intranet.common.enums.UserType.SuperAdmin, userId: this.$scope.user.id };
                    this.$rootScope.child = { short: 'AD', usertype: intranet.common.enums.UserType.Admin };
                }
                else if (this.$scope.user.userType == intranet.common.enums.UserType.Admin) {
                    this.$rootScope.current = { short: 'AD', usertype: intranet.common.enums.UserType.Admin, userId: this.$scope.user.id };
                    this.$rootScope.child = { short: 'CUS', usertype: intranet.common.enums.UserType.SuperMaster };
                }
                else if (this.$scope.user.userType == intranet.common.enums.UserType.SuperMaster) {
                    this.$rootScope.current = { short: 'CUS', usertype: intranet.common.enums.UserType.SuperMaster, userId: this.$scope.user.id };
                    this.$rootScope.child = { short: 'MA', usertype: intranet.common.enums.UserType.Master };
                }
                else if (this.$scope.user.userType == intranet.common.enums.UserType.Master) {
                    this.$rootScope.current = { short: 'MA', usertype: intranet.common.enums.UserType.Master, userId: this.$scope.user.id };
                    this.$rootScope.child = { short: 'Agent', usertype: intranet.common.enums.UserType.Agent };
                }
                else if (this.$scope.user.userType == intranet.common.enums.UserType.Agent) {
                    this.$rootScope.current = { short: 'Agent', usertype: intranet.common.enums.UserType.Agent, userId: this.$scope.user.id };
                    this.$rootScope.child = { short: 'Member', usertype: intranet.common.enums.UserType.Player };
                }
                this.localStorageHelper.set("l-m-child", this.$rootScope.child);
            }
            timezoneChanged(value) {
                this.$scope.selectedTimezone = value;
                this.$rootScope.timezone = value.replace(':', '');
            }
            loadInitialData() {
                this.$scope.currentWebApp = this.settings.WebApp;
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.isCPUser = this.commonDataService.isCPLogin();
                this.getUserData();
                this.setInfo();
                this.$scope.hasAPK = this.settings.HasAPK;
                this.$scope.userTypes = [];
                this.$scope.timezone = intranet.common.helpers.CommonHelper.getTimeZone();
                this.$scope.selectedTimezone = this.$scope.timezone;
                this.$rootScope.timezone = intranet.common.helpers.CommonHelper.getTimeZone();
                this.$scope.balanceInfo = {};
                this.loadEventTypes();
                this.getBalance();
                this.getSupportDetail();
                this.fillUserTypes();
                this.getAnnouncement();
                this.getPendingDW();
            }
            getSupportDetail() {
                this.commonDataService.getSupportDetails().then((data) => {
                    if (data.isB2C && this.$scope.user.userType == intranet.common.enums.UserType.Agent) {
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
            isActive(path) {
                return (this.$location.$$url == path) ? 'active ' : '';
            }
            isContain(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active ' : '';
            }
            isDownline(path) {
                var result = '';
                if (this.$location.$$url == path) {
                    result = 'active ';
                }
                else if (this.$location.$$url.indexOf('/master/member') >= 0) {
                    result = 'active ';
                }
                return result;
            }
            logout() {
                this.commonDataService.logout();
            }
            loadEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                        }
                    }
                });
            }
            getUserData() {
                this.$scope.user = this.commonDataService.getLoggedInUserData();
            }
            getBalance() {
                this.$scope.balanceInfo.isBalanceLoaded = false;
                var promise;
                promise = this.accountService.getBalance();
                promise.success((res) => {
                    if (res.success) {
                        this.$scope.balanceInfo.exposure = res.data.exposure;
                        this.$scope.balanceInfo.balanceUp = res.data.balanceUp;
                        this.$scope.balanceInfo.balanceDown = res.data.balanceDown;
                        this.$scope.balanceInfo.availableCredit = res.data.availableCredit;
                        this.$scope.positionTakingStatus = res.data.ptStatus;
                    }
                }).finally(() => { this.$scope.balanceInfo.isBalanceLoaded = true; });
            }
            fillUserTypes() {
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperAdmin, name: 'SA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Admin, name: 'AD' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperMaster, name: 'SM' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Master, name: 'MA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Agent, name: 'AG' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Player, name: 'PL' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.PLS, name: 'PLS' });
            }
            getUserTypeShort(usertype) {
                var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
                if (found.length > 0) {
                    return found[0].name;
                }
            }
            openVideo() {
                var url = this.$state.href('glctv');
                this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
            }
            getAnnouncement() {
                this.settingService.getNotifications()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                        }
                        else {
                            this.$scope.announcement = undefined;
                        }
                    }
                });
            }
            downloadAPK() {
                this.commonDataService.downloadMasterAPK();
            }
            changePassword() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'profile.password.change.modal.header';
                modal.data = {
                    userId: this.$scope.user.id
                };
                modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
                modal.controller = 'changePasswordModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            updateWhatsapp() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Update Whatsapp Number';
                modal.bodyUrl = this.settings.ThemeName + '/master/account/update-info-modal.html';
                modal.controller = 'updateInfoModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.websiteService.getSupportDetail()
                            .success((response) => {
                            if (response.success) {
                                this.commonDataService.setSupportDetails(response.data);
                            }
                        });
                    }
                });
            }
            openRules() {
                this.commonDataService.openWebsiteRules();
            }
            PTStatusChanged() {
                this.userService.changePTstatus(this.$scope.positionTakingStatus)
                    .success((response) => {
                    this.toasterService.showMessages(response.messages);
                });
            }
            openTerms() {
                this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                        this.userService.firstLoginDone();
                    });
                });
            }
            openHelp() {
                var url = this.$state.href('help.creating_agency_user', { 'user': this.$rootScope.child.short });
                this.$window.open(this.$sce.trustAsUrl(url), "Help", "width=900,height=500,left=300,top=150");
            }
            getPendingDW() {
                this.accountService.getPendingPayInOutCount()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.dwPendingCounter = response.data;
                    }
                });
            }
            playAudio(isDeposit = true) {
                if (isDeposit) {
                    var audio = new Audio('audio/d-tone.mp3');
                    audio.play();
                }
                else {
                    var audio = new Audio('audio/w-tone.mp3');
                    audio.play();
                }
            }
        }
        master.MasterCtrl = MasterCtrl;
        angular.module('intranet.master').controller('masterCtrl', MasterCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MasterCtrl.js.map