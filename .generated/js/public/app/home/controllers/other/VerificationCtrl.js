var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class VerificationCtrl extends intranet.common.ControllerBase {
            constructor($scope, userService, $timeout, toasterService, localStorageHelper, commonDataService, authorizationService, $translate, WSSocketService, $rootScope, $sce, $window, isMobile, settings, $state) {
                super($scope);
                this.userService = userService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.authorizationService = authorizationService;
                this.$translate = $translate;
                this.WSSocketService = WSSocketService;
                this.$rootScope = $rootScope;
                this.$sce = $sce;
                this.$window = $window;
                this.isMobile = isMobile;
                this.settings = settings;
                this.$state = $state;
                this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";
                document.body.setAttribute('class', 'cbg');
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_otp);
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.loginMode = 0;
                if (this.settings.WebApp == 'top365' || this.settings.WebApp == 'winexch') {
                    this.$scope.loginMode = 1;
                }
                if (this.settings.WebApp == 'fairbook' || this.settings.WebApp == 'fourexch') {
                    this.$scope.loginMode = 2;
                }
                if (this.settings.WebApp == 'royalpatti') {
                    this.$scope.loginMode = 3;
                }
                if (this.settings.WebApp == 'lvexch') {
                    this.$scope.loginMode = 4;
                }
                this.$scope.currentWebApp = this.settings.WebApp;
                this.$scope.downloadApp = this.settings.HasAPK;
                this.$scope.spinnerImg = this.commonDataService.spinnerImg;
                this.$scope.showLoading = false;
                this.$scope.model = {};
                this.$scope.supportDetail = {};
            }
            loadInitialData() {
                this.loadWebsiteDetail();
                var userData = this.localStorageHelper.get(this.settings.UserData);
                if (userData) {
                    this.$scope.model.mobile = userData.user.mobile;
                    this.$scope.model.otpvia = 'sms';
                }
                var otpCounter = this.localStorageHelper.get('otp-timer');
                if (otpCounter > 0) {
                    this.OTPcounter(otpCounter);
                }
                var otpid = this.localStorageHelper.get('otpid');
                if (otpid) {
                    this.$scope.model.otpid = otpid;
                }
            }
            confirmOpt() {
                this.$scope.showLoading = true;
                var res;
                res = this.userService.confirmOTP(this.$scope.model.otp, this.$scope.model.otpid);
                res.success((response, status, headers, config) => {
                    if (this.$scope.messages)
                        this.$scope.messages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Successfully registered, Now deposit and start playing.");
                        this.gotoDashboard();
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
            requestNewOtp() {
                this.userService.requestOTP(this.$scope.model.otpvia)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.model.otpid = response.data;
                        this.localStorageHelper.set('otpid', response.data);
                    }
                    this.OTPcounter(3 * 60);
                    this.toasterService.showMessages(response.messages);
                });
            }
            OTPcounter(intval) {
                var interval = intval;
                this.$timeout.cancel(this.$scope.timer_otp);
                var startdelay = (() => {
                    if (interval > 0) {
                        interval = interval - 1;
                        this.$scope.timer_otp = this.$timeout(() => {
                            this.$scope.resendTimer = interval;
                            this.localStorageHelper.set('otp-timer', interval);
                            startdelay();
                        }, 1000);
                    }
                });
                startdelay();
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
            gotoDashboard() {
                this.WSSocketService.connetWs();
                if (this.isMobile.any) {
                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                        this.$state.go('mobile.seven.base.home');
                    }
                    else {
                        this.$state.go('mobile.base.home');
                    }
                }
                else {
                    this.$state.go('base.home');
                }
            }
            gotoLogin() {
                this.$state.go('login');
            }
            gotoLoginMobile() {
                this.$state.go('mobile.login');
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                        }
                    }
                });
            }
            openPrivacyPolicy() {
                var url = this.$state.href('privacypolicy');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            openCookiePolicy() {
                var url = this.$state.href('cookiepolicy');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            openTermsConditions() {
                var url = this.$state.href('termsconditions');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            openResponsibleGambling() {
                var url = this.$state.href('responsiblegambling');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
        }
        home.VerificationCtrl = VerificationCtrl;
        angular.module('intranet.home').controller('verificationCtrl', VerificationCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VerificationCtrl.js.map