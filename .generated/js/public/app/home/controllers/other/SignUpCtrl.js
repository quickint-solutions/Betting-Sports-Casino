var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class SignUpCtrl extends intranet.common.ControllerBase {
            constructor($scope, userService, $timeout, toasterService, localStorageHelper, commonDataService, $q, vcRecaptchaService, isMobile, $rootScope, $location, $sce, $window, settings, $state) {
                super($scope);
                this.userService = userService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.$q = $q;
                this.vcRecaptchaService = vcRecaptchaService;
                this.isMobile = isMobile;
                this.$rootScope = $rootScope;
                this.$location = $location;
                this.$sce = $sce;
                this.$window = $window;
                this.settings = settings;
                this.$state = $state;
                this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";
                document.body.setAttribute('class', 'cbg');
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.refreshCaptcha);
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.loginMode = 0;
                this.$scope.captchaMode = 0;
                if (this.settings.WebApp == 'top365' || this.settings.WebApp == 'winexch') {
                    this.$scope.loginMode = 1;
                }
                if (this.settings.WebApp == 'fairbook' || this.settings.WebApp == 'fourexch' || this.settings.WebApp == 'prideexchange') {
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
                this.$scope.model = { referralCode: this.$location.$$search.code };
                this.$scope.supportDetail = {};
                this.$scope.countryList = [];
            }
            loadInitialData() {
                this.loadWebsiteDetail();
                this.$scope.countryList = intranet.common.helpers.CommonHelper.CountryList();
                this.findCountry();
            }
            findCountry() {
                var self = this;
                var setCountry = ((code) => {
                    var lst = self.$scope.countryList.filter((c) => { return c.code == code; }) || [];
                    if (lst.length > 0) {
                        self.$scope.model.selectedCountry = lst[0];
                    }
                });
                jQuery.get(this.$sce.trustAsUrl("http://ip-api.com/json"), function (response) {
                    setCountry(response.countryCode);
                }, "jsonp").fail(function () { setCountry('IN'); });
            }
            getCaptcha(refresh = true) {
                if (this.$scope.refreshCaptcha) {
                    this.$timeout.cancel(this.$scope.refreshCaptcha);
                }
                this.userService.getCaptcha()
                    .success((response) => {
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
            addGoogleCaptcha() {
                this.vcRecaptchaService.create('captchaholder', {
                    key: this.$scope.gCaptchKey,
                    size: 'invisible'
                }).then((id) => { this.$scope.gWidgetId = id; });
            }
            executeGcaptcha(id, recursive = false) {
                if (!recursive)
                    this.vcRecaptchaService.execute(id);
                var response = this.vcRecaptchaService.getResponse();
                if (!response) {
                    this.$timeout(() => { this.executeGcaptcha(id, true); }, 1000);
                }
                else {
                    this.$scope.gCaptchaPromise.resolve(response);
                }
            }
            getCaptchaResponse() {
                if (this.$scope.gCaptchaPromise.promise.$$state.status != 0) {
                    this.$scope.gCaptchaPromise = this.$q.defer();
                }
                if (this.$scope.gWidgetId != undefined) {
                    this.executeGcaptcha(this.$scope.gWidgetId);
                }
                else {
                    this.$scope.gWidgetId = this.vcRecaptchaService.create('captchaholder', {
                        key: this.$scope.gCaptchKey,
                        size: 'invisible'
                    }).then((id) => {
                        this.executeGcaptcha(id);
                    });
                }
                return this.$q.when(this.$scope.gCaptchaPromise.promise);
            }
            register() {
                this.$scope.showLoading = true;
                if (this.validatePassword()) {
                    var userToken = this.localStorageHelper.getUserTokenFromCookie();
                    var model = {
                        referralCode: this.$scope.model.referralCode,
                        captcha: this.$scope.model.captcha,
                        IMEI: userToken,
                        device: 'web',
                        username: this.$scope.model.username,
                        password: this.$scope.model.password,
                        email: this.$scope.model.email,
                        mobile: this.$scope.model.selectedCountry.dial_code + '' + this.$scope.model.mobile,
                        name: this.$scope.model.username
                    };
                    if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                        model.key = this.$scope.captcha.key;
                        this.completeRegistration(model);
                    }
                    else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                        this.getCaptchaResponse().then((data) => {
                            model.key = data;
                            this.completeRegistration(model);
                        });
                    }
                }
            }
            completeRegistration(model) {
                var res;
                res = this.userService.register(model);
                res.success((response, status, headers, config) => {
                    if (this.$scope.messages)
                        this.$scope.messages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Successfully registered, Login to continue.");
                        this.gotoLogin();
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
            gotoLogin() {
                if (this.isMobile.any) {
                    this.$state.go('mobile.login');
                }
                else {
                    this.$state.go('login');
                }
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            validatePassword() {
                this.$scope.messages.splice(0);
                if (!this.commonDataService.validatePassword(this.$scope.model.password)) {
                    var msg = 'Password must be 6 character long, must contain alphabetics and numbers';
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                else if (this.$scope.model.password !== this.$scope.model.confirmpassword) {
                    var msg = "Password not matched with confirm password.";
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                return true;
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        this.$scope.captchaMode = data.captchaMode;
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                            this.$scope.gCaptchKey = this.$scope.supportDetail.recaptchaSiteKey;
                        }
                    }
                }).finally(() => {
                    if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                        this.getCaptcha();
                    }
                    else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                        this.addGoogleCaptcha();
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
        home.SignUpCtrl = SignUpCtrl;
        angular.module('intranet.home').controller('signUpCtrl', SignUpCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SignUpCtrl.js.map