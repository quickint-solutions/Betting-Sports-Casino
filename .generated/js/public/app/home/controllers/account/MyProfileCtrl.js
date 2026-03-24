var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MyProfileCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, toasterService, translationService, modalService, userService, languageService, paymentService, $stateParams, $timeout, $sce, settingService, localStorageHelper, settings) {
                super($scope);
                this.commonDataService = commonDataService;
                this.toasterService = toasterService;
                this.translationService = translationService;
                this.modalService = modalService;
                this.userService = userService;
                this.languageService = languageService;
                this.paymentService = paymentService;
                this.$stateParams = $stateParams;
                this.$timeout = $timeout;
                this.$sce = $sce;
                this.settingService = settingService;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
                this.$scope.eventTypes = [];
                this.$scope.fromMember = false;
            }
            loadInitialData() {
                if (this.$stateParams.memberid) {
                    this.$scope.fromMember = true;
                    this.getUserDataById();
                }
                else {
                    this.getUserData();
                    this.getLanguages();
                    this.getBetConfig();
                    if (this.commonDataService.isOBD()) {
                        this.getOfflineDetail();
                    }
                }
            }
            getUserDataById() {
                this.userService.getUserById(this.$stateParams.memberid)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.user = response.data;
                        this.getBetConfig(response.data);
                    }
                });
            }
            getUserData() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.user = result;
                    if (this.$scope.user.languageId)
                        this.$scope.user.languageId = this.$scope.user.languageId.toString();
                }
                var cResult = this.commonDataService.getLoggedInUserCurrency();
                if (cResult) {
                    this.$scope.user.currency = cResult;
                }
            }
            getLanguages() {
                this.languageService.getLanguages()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.languageList = response.data;
                    }
                });
            }
            changePassword() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'profile.password.change.modal.header';
                if (this.$stateParams.memberid) {
                    modal.data = {
                        userId: this.$scope.user.id,
                        fromMember: true
                    };
                }
                else {
                    modal.data = {
                        userId: this.$scope.user.id
                    };
                }
                modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
                modal.controller = 'changePasswordModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            languageChanged() {
                this.userService.changeUserLanguage(this.$scope.user.languageId)
                    .success((res) => {
                    this.toasterService.showMessages(res.messages, 3000);
                    if (res.success) {
                        this.translationService.setLanguage(this.$scope.user.languageId);
                    }
                });
            }
            getBetConfig(data = undefined) {
                this.commonDataService.getEventTypes()
                    .then((data) => {
                    if (data) {
                        this.$scope.eventTypes = data.filter((d) => { return d.isActive; });
                    }
                }).finally(() => {
                    if (!data) {
                        var promise;
                        promise = this.userService.getMyBetConfig();
                        promise.success((response) => {
                            if (response.success) {
                                angular.forEach(this.$scope.eventTypes, (e) => {
                                    angular.forEach(response.data.betConfigs, (d) => {
                                        if (e.id == d.eventTypeId) {
                                            e.betDelay = d.betDelay;
                                            e.maxBet = d.maxBet;
                                            e.maxExposure = d.maxExposure;
                                            e.maxProfit = d.maxProfit;
                                            e.minBet = d.minBet;
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        angular.forEach(this.$scope.eventTypes, (e) => {
                            angular.forEach(this.$scope.user.betConfigs, (d) => {
                                if (e.id == d.eventTypeId) {
                                    e.betDelay = d.betDelay;
                                    e.maxBet = d.maxBet;
                                    e.maxExposure = d.maxExposure;
                                    e.maxProfit = d.maxProfit;
                                    e.minBet = d.minBet;
                                }
                            });
                        });
                    }
                });
            }
            getOfflineDetail() {
                this.paymentService.getBankDetails()
                    .success((response) => {
                    this.$scope.bankingDetail = response.data;
                });
            }
            openChangeMobile() {
                jQuery('#change-mobile-modal').addClass('disp');
                jQuery('#change-mobile-modal' + " input:visible:first").focus();
                this.$timeout(() => {
                    jQuery('#change-mobile-modal' + ' .inner-modal').addClass('disp');
                }, 200);
                this.$scope.changeMobileModel = { oldMobileNo: this.$scope.user.mobile, otpvia: '2' };
                this.$scope.resendTimer = 0;
                this.loadCountries();
            }
            closeAllMOdal(overlayClick = false, event = null) {
                if (overlayClick) {
                    if (jQuery(event.target).closest('.no-close')[0] && !jQuery(event.target).hasClass('popup-close')) {
                    }
                    else {
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
            loadCountries() {
                this.settingService.getCountryList()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.countryList = response.data;
                        var selectedCountry = this.$scope.countryList[0];
                        var selectedList = this.$scope.countryList.filter((c) => { return c.isSelected; }) || [];
                        if (selectedList.length > 0) {
                            selectedCountry = selectedList[0];
                        }
                        this.$scope.changeMobileModel.selectedCountry = {};
                        angular.copy(selectedCountry, this.$scope.changeMobileModel.selectedCountry);
                    }
                });
            }
            countryChanged(model) {
                model.otpvia = 2;
            }
            requestOtpForChange() {
                var model = {
                    channel: this.$scope.changeMobileModel.otpvia,
                    mobile: this.$scope.changeMobileModel.selectedCountry.dialCode + '' + this.$scope.changeMobileModel.newMobileNo,
                    dialCode: this.$scope.changeMobileModel.selectedCountry.dialCode,
                    otpType: 3
                };
                this.userService.requestOTP(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.changeMobileModel.otpid = response.data;
                        this.localStorageHelper.set('forget_otpid', response.data);
                        this.OTPcounterForget(3 * 60);
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
            formatTime(totalSeconds) {
                var minutes = 0;
                var remainSeconds = 0;
                if (totalSeconds > 60) {
                    minutes = math.floor(math.divide(totalSeconds, 60));
                    remainSeconds = math.floor(math.mod(totalSeconds, 60));
                }
                else {
                    remainSeconds = totalSeconds;
                }
                if (minutes.toString().length === 1) {
                    minutes = '0' + minutes;
                }
                if (remainSeconds.toString().length === 1) {
                    remainSeconds = '0' + remainSeconds;
                }
                return minutes + ':' + remainSeconds;
            }
            OTPcounterForget(intval) {
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
            changeNumber() {
                this.$scope.showLoading = true;
                var model = {
                    newMobileNo: this.$scope.changeMobileModel.selectedCountry.dialCode + '' + this.$scope.changeMobileModel.newMobileNo,
                    otp: this.$scope.changeMobileModel.otp,
                    otpId: this.$scope.changeMobileModel.otpid,
                    oldMobileNo: this.$scope.changeMobileModel.oldMobileNo
                };
                this.userService.updateMobileNo(model)
                    .success((response, status, headers, config) => {
                    if (this.$scope.changeMobileMessages)
                        this.$scope.changeMobileMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Mobile number updated successfully.");
                        this.closeAllMOdal();
                        var existinUserData = this.localStorageHelper.get(this.settings.UserData);
                        if (existinUserData.user) {
                            this.$scope.user.mobile = model.newMobileNo;
                            existinUserData.user.mobile = model.newMobileNo;
                            this.localStorageHelper.set(this.settings.UserData, existinUserData);
                        }
                        ;
                    }
                    else {
                        this.$scope.changeMobileMessages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
        }
        home.MyProfileCtrl = MyProfileCtrl;
        angular.module('intranet.home').controller('myProfileCtrl', MyProfileCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MyProfileCtrl.js.map