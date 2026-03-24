module intranet.home {
    export interface IVerificationScope extends intranet.common.IScopeBase {
        model: any;
        timer_otp: any;
        resendTimer: any;

        imagePath: any;

        spinnerImg: any;
        showLoading: boolean;

        // 0=all themes, 1=winexch/top365, 2=fairbook, 3=royalpatti, 4=lvexh
        loginMode: any;
        currentWebApp: string;


        //download app
        downloadApp: boolean;

        supportDetail: any;
    }

    export class VerificationCtrl extends intranet.common.ControllerBase<IVerificationScope>
        implements intranet.common.init.IInit {
        constructor($scope: IVerificationScope,
            private userService: services.UserService,
            private $timeout: ng.ITimeoutService,
            private toasterService: common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private commonDataService: common.services.CommonDataService,
            private authorizationService: intranet.common.services.AuthorizationService,
            private $translate: any,
            private WSSocketService: any,
            protected $rootScope: any,
            private $sce: any,
            private $window: any,
            private isMobile: any,
            private settings: common.IBaseSettings,
            private $state: ng.ui.IStateService) {
            super($scope);

            this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";

            document.body.setAttribute('class', 'cbg');

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_otp);
            });
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.messages = [];
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.loginMode = 0;

            if (this.settings.WebApp == 'top365' || this.settings.WebApp == 'winexch') { this.$scope.loginMode = 1; }
            if (this.settings.WebApp == 'fairbook' || this.settings.WebApp == 'fourexch') { this.$scope.loginMode = 2; }
            if (this.settings.WebApp == 'royalpatti') { this.$scope.loginMode = 3; }
            if (this.settings.WebApp == 'lvexch') { this.$scope.loginMode = 4; }

            this.$scope.currentWebApp = this.settings.WebApp;
            this.$scope.downloadApp = this.settings.HasAPK;
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.showLoading = false;
            this.$scope.model = {};
            this.$scope.supportDetail = {};
        }

        public loadInitialData() {
            this.loadWebsiteDetail();
            var userData = this.localStorageHelper.get(this.settings.UserData);
            if (userData) {
                this.$scope.model.mobile = userData.user.mobile;
                this.$scope.model.otpvia = 'sms';
            }

            var otpCounter = this.localStorageHelper.get('otp-timer');
            if (otpCounter > 0) { this.OTPcounter(otpCounter); }

            var otpid = this.localStorageHelper.get('otpid');
            if (otpid) { this.$scope.model.otpid = otpid; }
        }

        public confirmOpt(): void {
            this.$scope.showLoading = true;

            var res: ng.IHttpPromise<any>;
            res = this.userService.confirmOTP(this.$scope.model.otp, this.$scope.model.otpid);
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.messages) this.$scope.messages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    this.toasterService.showToast(common.helpers.ToastType.Info, "Successfully registered, Now deposit and start playing.");
                    this.gotoDashboard();
                }
                else {
                    this.$scope.messages = response.messages;
                }
            }).finally(() => { this.$scope.showLoading = false; })
        }

        private requestNewOtp(): void {
            this.userService.requestOTP(this.$scope.model.otpvia)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.model.otpid = response.data;
                        this.localStorageHelper.set('otpid', response.data);
                    }
                    this.OTPcounter(3 * 60);
                    this.toasterService.showMessages(response.messages);
                });
        }

        private OTPcounter(intval: any): void {
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

        private gotoDashboard(): void {

            // start web socket
            this.WSSocketService.connetWs();

            if (this.isMobile.any) {
                if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                    this.$state.go('mobile.seven.base.home');
                }
                else {
                    this.$state.go('mobile.base.home');
                }
            } else {
                this.$state.go('base.home');
            }
        }

        private gotoLogin(): void {
            this.$state.go('login');
        }

        private gotoLoginMobile(): void {
            this.$state.go('mobile.login');
        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                        }
                    }
                });
        }

        private openPrivacyPolicy(): void {
            var url = this.$state.href('privacypolicy');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openCookiePolicy(): void {
            var url = this.$state.href('cookiepolicy');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openTermsConditions(): void {
            var url = this.$state.href('termsconditions');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openResponsibleGambling(): void {
            var url = this.$state.href('responsiblegambling');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }
    }
    angular.module('intranet.home').controller('verificationCtrl', VerificationCtrl);
}