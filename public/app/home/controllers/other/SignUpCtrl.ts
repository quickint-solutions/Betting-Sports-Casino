module intranet.home {
    export interface ISignUpScope extends intranet.common.IScopeBase {
        model: any;
        captcha: any;
        supportDetail: any;
        refreshCaptcha: any;
        imagePath: any;

        spinnerImg: any;
        showLoading: boolean;

        countryList: any;

        // 0=all themes, 1=winexch/top365, 2=fairbook, 3=royalpatti, 4=lvexh
        loginMode: any;
        currentWebApp: string;


        //download app
        downloadApp: boolean;

        captchaMode: any;
        gWidgetId: any;
        gCaptchaPromise: any;
        gCaptchKey: any;
    }

    export class SignUpCtrl extends intranet.common.ControllerBase<ISignUpScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISignUpScope,
            private userService: services.UserService,
            private $timeout: ng.ITimeoutService,
            private toasterService: common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private commonDataService: common.services.CommonDataService,
            private $q: ng.IQService,
            private vcRecaptchaService: any,
            private isMobile: any,
            protected $rootScope: any,
            private $location:any,
            private $sce: any,
            private $window: any,
            private settings: common.IBaseSettings,
            private $state: ng.ui.IStateService) {
            super($scope);

            this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";

            document.body.setAttribute('class', 'cbg');

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.refreshCaptcha);
            });
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.messages = [];
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.loginMode = 0;
            this.$scope.captchaMode = 0;
            if (this.settings.WebApp == 'top365' || this.settings.WebApp == 'winexch') { this.$scope.loginMode = 1; }
            if (this.settings.WebApp == 'fairbook' || this.settings.WebApp == 'fourexch' || this.settings.WebApp == 'prideexchange') { this.$scope.loginMode = 2; }
            if (this.settings.WebApp == 'royalpatti') { this.$scope.loginMode = 3; }
            if (this.settings.WebApp == 'lvexch') { this.$scope.loginMode = 4; }

            this.$scope.currentWebApp = this.settings.WebApp;
            this.$scope.downloadApp = this.settings.HasAPK;
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.showLoading = false;
            this.$scope.model = { referralCode: this.$location.$$search.code };
            this.$scope.supportDetail = {};
            this.$scope.countryList = [];
        }

        public loadInitialData() {
            this.loadWebsiteDetail();

            this.$scope.countryList = common.helpers.CommonHelper.CountryList();
            this.findCountry();
        }

        private findCountry(): void {

            //var script1 = document.createElement("script");
            //script1.src = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js";
            //document.head.appendChild(script1);
            //script1.onload = function () {
            //    var w: any = window;
            //    const phoneInputField = document.querySelector("#phone");
            //    const phoneInput = w.intlTelInput(phoneInputField, {
            //        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            //    });
            //}


            var self = this;
            var setCountry = ((code) => {
                var lst = self.$scope.countryList.filter((c: any) => { return c.code == code; }) || [];
                if (lst.length > 0) {
                    self.$scope.model.selectedCountry = lst[0];
                }
            });

            jQuery.get(this.$sce.trustAsUrl("http://ip-api.com/json"), function (response) {
                setCountry(response.countryCode);
            }, "jsonp").fail(function () { setCountry('IN'); });
        }

        public getCaptcha(refresh: boolean = true) {
            if (this.$scope.refreshCaptcha) { this.$timeout.cancel(this.$scope.refreshCaptcha); }
            this.userService.getCaptcha()
                .success((response: intranet.common.messaging.IResponse<any>) => {
                    if (response && response.success) {
                        this.$scope.captcha = response.data;
                    }
                }).finally(() => {
                    if (refresh) {
                        this.$scope.refreshCaptcha = this.$timeout(() => {
                            this.getCaptcha();
                        }, 120000);
                    }
                });
        }

        private addGoogleCaptcha(): void {
            this.vcRecaptchaService.create('captchaholder', {
                key: this.$scope.gCaptchKey,
                size: 'invisible'
            }).then((id: any) => { this.$scope.gWidgetId = id; });
        }

        private executeGcaptcha(id: any, recursive: boolean = false): void {
            if (!recursive) this.vcRecaptchaService.execute(id);

            var response = this.vcRecaptchaService.getResponse();
            if (!response) { this.$timeout(() => { this.executeGcaptcha(id, true); }, 1000); }
            else {
                this.$scope.gCaptchaPromise.resolve(response);
            }
        }

        private getCaptchaResponse(): ng.IHttpPromise<any> {
            if (this.$scope.gCaptchaPromise.promise.$$state.status != 0) { this.$scope.gCaptchaPromise = this.$q.defer(); }
            if (this.$scope.gWidgetId != undefined) {
                this.executeGcaptcha(this.$scope.gWidgetId);
            }
            else {
                this.$scope.gWidgetId = this.vcRecaptchaService.create('captchaholder', {
                    key: this.$scope.gCaptchKey,
                    size: 'invisible'
                }).then((id: any) => {
                    this.executeGcaptcha(id);
                });
            }
            return this.$q.when(this.$scope.gCaptchaPromise.promise);
        }

        public register(): void {
            this.$scope.showLoading = true;
            if (this.validatePassword()) {
                var userToken = this.localStorageHelper.getUserTokenFromCookie();
                var model: any = {
                    referralCode: this.$scope.model.referralCode,
                    captcha: this.$scope.model.captcha,
                    IMEI: userToken,
                    device: 'web',
                    username: this.$scope.model.username,
                    password: this.$scope.model.password,
                    email: this.$scope.model.email,
                    mobile: this.$scope.model.selectedCountry.dial_code + '' +this.$scope.model.mobile,
                    name: this.$scope.model.username
                };
                if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                    model.key = this.$scope.captcha.key;
                    this.completeRegistration(model);
                }
                else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                    this.getCaptchaResponse().then((data: any) => {
                        model.key = data;
                        this.completeRegistration(model);
                    });
                }
            }
        }

        private completeRegistration(model: any) {
            var res: ng.IHttpPromise<any>;
            res = this.userService.register(model);
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.messages) this.$scope.messages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    this.toasterService.showToast(common.helpers.ToastType.Info, "Successfully registered, Login to continue.");
                    this.gotoLogin();
                }
                else {
                    this.$scope.messages = response.messages;
                }
            }).finally(() => { this.$scope.showLoading = false; })
        }

        private gotoLogin(): void {
            if (this.isMobile.any) { this.$state.go('mobile.login'); } else { this.$state.go('login'); }
           
        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        private validatePassword(): boolean {
            this.$scope.messages.splice(0);
            if (!this.commonDataService.validatePassword(this.$scope.model.password)) {
                var msg: string = 'Password must be 6 character long, must contain alphabetics and numbers';
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            else if (this.$scope.model.password !== this.$scope.model.confirmpassword) {
                var msg: string = "Password not matched with confirm password.";
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        this.$scope.captchaMode = data.captchaMode;
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                            this.$scope.gCaptchKey = this.$scope.supportDetail.recaptchaSiteKey;
                        }
                    }
                }).finally(() => {
                    if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                        this.getCaptcha();
                    } else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                        this.addGoogleCaptcha();
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
    angular.module('intranet.home').controller('signUpCtrl', SignUpCtrl);
}