module intranet.mobile.account {
    export interface IMobileMyProfileScope extends intranet.common.IScopeBase {
        user: any;
        timezone: any;
        languageList: any[];
        eventTypes: any[];
        bankingDetail: any;

        changeMobileModel: any;
        changeMobileMessages: common.messaging.ResponseMessage[];
        countryList: any;
        timer_otp: any;
        resendTimer: any;
        showLoading: any;
    }

    export class MobileMyProfileCtrl extends intranet.common.ControllerBase<IMobileMyProfileScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileMyProfileScope,
            private commonDataService: common.services.CommonDataService,
            private toasterService: intranet.common.services.ToasterService,
            private translationService: services.TranslationService,
            private modalService: common.services.ModalService,
            private userService: services.UserService,
            private paymentService: services.PaymentService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private languageService: services.LanguageService,
            private $timeout: any,
            private settingService: services.SettingService,
            private $sce: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
            this.$scope.eventTypes = [];
        }

        public loadInitialData(): void {
            this.getUserData();
            this.getLanguages();
            this.getBetConfig();
            if (this.commonDataService.isOBD()) {
                this.getOfflineDetail();
            }
        }

        private getUserData(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.user = result;
                if (this.$scope.user.languageId) this.$scope.user.languageId = this.$scope.user.languageId.toString();
            }
        }

        private getLanguages(): void {
            this.languageService.getLanguages()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.languageList = response.data;
                    }
                });
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

        private languageChanged(): void {
            this.userService.changeUserLanguage(this.$scope.user.languageId)
                .success((res: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(res.messages, 3000);
                    if (res.success) {
                        this.translationService.setLanguage(this.$scope.user.languageId);
                    }
                });
        }

        private getBetConfig(): void {
            this.commonDataService.getEventTypes()
                .then((data: any) => {
                    if (data) {
                        this.$scope.eventTypes = data.filter((d: any) => { return d.isActive; });
                    }
                }).finally(() => {
                    this.commonDataService.getUserBetConfig().then((data: any) => {
                        angular.forEach(this.$scope.eventTypes, (e: any) => {
                            angular.forEach(data, (d: any) => {
                                if (e.id == d.eventTypeId) {
                                    e.betDelay = d.betDelay;
                                    e.maxBet = d.maxBet;
                                    e.maxExposure = d.maxExposure;
                                    e.maxProfit = d.maxProfit;
                                    e.minBet = d.minBet;
                                }
                            });
                        });
                    });
                });
        }

        private getOfflineDetail() {
            this.paymentService.getBankDetails()
                .success((response: common.messaging.IResponse<any>) => {
                    this.$scope.bankingDetail = response.data;
                });
        }


        private openChangeMobile() {
            jQuery('#change-mobile-modal').addClass('disp');
            jQuery('#change-mobile-modal' + " input:visible:first").focus();
            this.$timeout(() => {
                jQuery('#change-mobile-modal' + ' .inner-modal').addClass('disp');
            }, 200);

            this.$scope.changeMobileModel = { oldMobileNo: this.$scope.user.mobile, otpvia: '2' };
            this.$scope.resendTimer = 0;
            this.loadCountries();
        }

        private closeAllMOdal(overlayClick: boolean = false, event: any = null): void {
            if (overlayClick) {
                if (jQuery(event.target).closest('.no-close')[0] && !jQuery(event.target).hasClass('popup-close')) {
                    //return false;
                } else {
                    this.$timeout(() => {
                        this.$scope.changeMobileModel = {};
                        jQuery('.modal-overlay').removeClass('disp');
                        jQuery('.inner-modal').removeClass('disp');
                    }, 100);
                }
            }
            else {
                jQuery('.modal-overlay').removeClass('disp');
                jQuery('.inner-modal').removeClass('disp');
                this.$scope.changeMobileModel = {};
            }
        }

        private loadCountries() {
            this.settingService.getCountryList()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.countryList = response.data;
                        var selectedCountry = this.$scope.countryList[0];
                        var selectedList = this.$scope.countryList.filter((c: any) => { return c.isSelected; }) || [];
                        if (selectedList.length > 0) { selectedCountry = selectedList[0]; }
                        this.$scope.changeMobileModel.selectedCountry = {};
                        angular.copy(selectedCountry, this.$scope.changeMobileModel.selectedCountry);
                    }
                });
        }

        private countryChanged(model: any) {
            model.otpvia = 2;
        }

        private requestOtpForChange() {
            var model: any = {
                channel: this.$scope.changeMobileModel.otpvia,
                mobile: this.$scope.changeMobileModel.selectedCountry.dialCode + '' + this.$scope.changeMobileModel.newMobileNo,
                otpType: 3 // 1=register,2=forget
            }
            this.userService.requestOTP(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.changeMobileModel.otpid = response.data;
                        this.localStorageHelper.set('forget_otpid', response.data);
                        this.OTPcounterForget(3 * 60);
                    }
                    this.toasterService.showMessages(response.messages);
                });
        }

        private formatTime(totalSeconds: any): any {
            var minutes: any = 0;
            var remainSeconds: any = 0;
            if (totalSeconds > 60) {
                minutes = math.floor(math.divide(totalSeconds, 60));
                remainSeconds = math.floor(math.mod(totalSeconds, 60));
            }
            else {
                remainSeconds = totalSeconds
            }
            if (minutes.toString().length === 1) { minutes = '0' + minutes; }
            if (remainSeconds.toString().length === 1) { remainSeconds = '0' + remainSeconds; }
            return minutes + ':' + remainSeconds;
        }

        private OTPcounterForget(intval: any): void {
            var interval = intval;
            this.$timeout.cancel(this.$scope.timer_otp);

            var startdelay = (() => {
                if (interval > 0) {
                    interval = interval - 1;
                    this.$scope.timer_otp = this.$timeout(() => {
                        this.$scope.resendTimer = interval;
                        startdelay();
                    }, 1000);
                }
            });
            startdelay();
        }

        private changeNumber() {
            this.$scope.showLoading = true;
            var model: any = {
                newMobileNo: this.$scope.changeMobileModel.selectedCountry.dialCode + '' + this.$scope.changeMobileModel.newMobileNo,
                otp: this.$scope.changeMobileModel.otp,
                otpId: this.$scope.changeMobileModel.otpid,
                oldMobileNo: this.$scope.changeMobileModel.oldMobileNo
            };
            this.userService.updateMobileNo(model)
                .success((response: common.messaging.IResponse<any>, status, headers, config) => {
                    if (this.$scope.changeMobileMessages) this.$scope.changeMobileMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(common.helpers.ToastType.Info, "Mobile number updated successfully.");
                        this.closeAllMOdal();

                        var existinUserData = this.localStorageHelper.get(this.settings.UserData);
                        if (existinUserData.user) {
                            this.$scope.user.mobile = model.newMobileNo;
                            existinUserData.user.mobile = model.newMobileNo;
                            this.localStorageHelper.set(this.settings.UserData, existinUserData);
                        };

                    }
                    else {
                        this.$scope.changeMobileMessages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
        }
    }
    angular.module('intranet.mobile.account').controller('mobileMyProfileCtrl', MobileMyProfileCtrl);
}