angular.module('intranet')
    .config(['$httpProvider', '$translateProvider',
        'settings', '$breadcrumbProvider', 'ScrollBarsProvider', '$compileProvider', 'localStorageServiceProvider',
        function ($httpProvider, $translateProvider: ng.translate.ITranslateProvider,
            settings: intranet.common.IBaseSettings, $breadcrumbProvider,
            ScrollBarsProvider: any, compileProvider: ng.ICompileProvider,
            localStorageServiceProvider: any) {


            $translateProvider.useLoader('uiTranslationLoader', undefined);

            $translateProvider.preferredLanguage();
            $translateProvider.useSanitizeValueStrategy('sanitizeParameters');

            //do one $digest cycle when multiple requests (http://blog.thoughtram.io/angularjs/2015/01/14/exploring-angular-1.3-speed-up-with-applyAsync.html)
            $httpProvider.useApplyAsync(true);

            //every response interceptors
            //------------------------------------------
            //$httpProvider.interceptors.push(intranet.common.interceptors.ResponseInterceptorFactory.create());

            // cfpLoadingBarProvider.includeSpinner = false;

            // for skype/whatsapp etc links otherwise it will 'unsafe'
            compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|skype|whatsapp|tel|blob|upi):/);
            compileProvider.debugInfoEnabled(false);

            //breadcrumb options
            //-----------------------
            $breadcrumbProvider.setOptions({
                templateUrl: settings.ThemeName + '/template/breadcrumb.html',
                includeAbstract: true
            });

            // custom scrollbar
            ScrollBarsProvider.defaults = {
                scrollButtons: {
                    scrollAmount: 'auto', // scroll amount when button pressed 
                    enable: true // enable scrolling buttons by default 
                },
                advanced: {
                    autoScrollOnFocus: false
                },
                scrollInertia: 400, // adjust however you want 
                axis: 'y', // enable 2 axis scrollbars by default, 
                theme: 'minimal-dark',
                autoHideScrollbar: true
            };

            localStorageServiceProvider
                .setPrefix(settings.IsFaaS ? 'fs' : 'fb')
                .setStorageCookie(45, '/', true);

            // handle 404
            $httpProvider.interceptors.push(['$location', 'isMobile', 'settings', 'WSSocketService', 'WSFairTradeSocketService',
                function ($location: any, isMobile: any,
                    settings: intranet.common.IBaseSettings, WSSocketService: any, WSFairTradeSocketService: any) {
                    return {
                        'responseError': function (response) {
                            if (response.config.url.indexOf(settings.ApiBaseUrl) > -1) {

                                if (response.status === 403) {
                                    $location.path('/forbidden');
                                }
                                else if (response.status === 401) {
                                    if (settings.IsFaaS) {
                                        $location.path('/forbidden');
                                    }
                                    else {
                                        WSSocketService.closeWs();
                                        WSFairTradeSocketService.closeWs();
                                        if (!isMobile.any) {
                                            intranet.common.helpers.CommonHelper.isPromoWebsite(settings.WebApp) && settings.WebSiteIdealFor <= 2
                                                ? $location.path('/promo')
                                                : $location.path('/login');
                                        } else {
                                            if (settings.IsMobileSeperate) { window.location.href = settings.MobileUrl; } else {
                                                intranet.common.helpers.CommonHelper.isPromoWebsite(settings.WebApp) && settings.WebSiteIdealFor <= 2
                                                    ? $location.path('/mobile/m-promo')
                                                    : $location.path('/mobile/login');
                                            }
                                        }
                                    }
                                }
                            }
                            return response;
                        }
                    };
                }]);
        }])

    .factory('uiTranslationLoader', ['$q', 'translationService', 'settings',
        ($q: ng.IQService, translationService: intranet.services.TranslationService, settings: intranet.common.IBaseSettings) => options => {
            var deferred = $q.defer();

            var config: ng.IRequestShortcutConfig = {};
            var promise: ng.IHttpPromise<any>;
            if (settings.IsFaaS) {
                promise = translationService.getTranslationByCode(options.key, config);
            }
            else {
                promise = translationService.getTranslations(options.key, config);
            }
            if (promise) {
                promise.success((response: intranet.common.messaging.IResponse<any>) => {
                    if (response && response.success) {
                        deferred.resolve(response.data);
                    } else { deferred.reject(options.key); }
                })
                    .error(() => deferred.reject(options.key));

                return deferred.promise;
            }
        }])

    .run(['$rootScope', '$state', 'localStorageHelper', 'settings', '$translate', '$templateCache',
        'isMobile', 'authorizationService', 'commonProcessService', '$location', 'googleTagManagerService',
        ($rootScope, $state, localStorageHelper: intranet.common.helpers.LocalStorageHelper,
            settings: intranet.common.IBaseSettings, $translate, $templateCache,
            isMobile: any,
            authorizationService: intranet.common.services.AuthorizationService,
            commonProcessService: intranet.common.services.CommonProcessService,
            $location: any, googleTagManagerService: intranet.services.GoogleTagManagerService) => {

            // Don't know :)
            $rootScope.$state = $state;

            localStorageHelper.getUserTokenFromCookie();

            ifvisible.setIdleDuration(settings.IdleTime);

            // User language
            var userData = localStorageHelper.get(settings.UserData);
            if (userData && userData.user && !settings.IsFaaS) {

                var id = userData.user.languageId.toString();
                $translate.use(id);

                if (userData.currency) {
                    settings.CurrencyRate = userData.currency.rate;
                    settings.CurrencyCode = userData.currency.code;
                    settings.CurrencyFraction = userData.currency.fractional;
                }
            }

            // override date picker template
            var datepicketTemplate = $templateCache.get(settings.ThemeName + '/template/datetimepicker.html');
            $templateCache.put('templates/datetimepicker.html', datepicketTemplate);

            // override bootstrap datepicker
            var year = $templateCache.get(settings.ThemeName + '/template/bootstrap/year.html');
            $templateCache.put('uib/template/datepicker/year.html', year);
            var month = $templateCache.get(settings.ThemeName + '/template/bootstrap/month.html');
            $templateCache.put('uib/template/datepicker/month.html', month);
            var day = $templateCache.get(settings.ThemeName + '/template/bootstrap/day.html');
            $templateCache.put('uib/template/datepicker/day.html', day);

            //uib.bootstrap carousel 
            var carousel = $templateCache.get(settings.ThemeName + '/template/bootstrap/carousel.html');
            $templateCache.put('uib/template/carousel/carousel.html', carousel);

            var checkResolution = function () {
                var current_resolution = '';
                if (isMobile.any) {
                    current_resolution = 'mobile';
                } else {
                    current_resolution = 'web';
                }

                var existing_resolution = localStorageHelper.get(settings.DeviceType);
                if (!existing_resolution) {
                    localStorageHelper.set(settings.DeviceType, current_resolution);
                }
                else if (current_resolution != existing_resolution) {
                    localStorageHelper.set(settings.DeviceType, current_resolution);
                    commonProcessService.onLoadLocationSelection();
                }
            }();

            //commonProcessService.isAPILive();


            //angular.element($window).bind('resize', function () {
            //    $window.location.reload();
            //});

            if (settings.WebApp == 'baazibook' || settings.WebApp == 'fairbook') {
                $rootScope.$on('$stateChangeSuccess', () => {
                    var path = $location.path(),
                        absUrl = $location.absUrl(),
                        virtualUrl = absUrl.substring(absUrl.indexOf(path));
                    googleTagManagerService.push({ event: 'virtualPageView', virtualUrl: virtualUrl });
                });
            }

            $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                if (toState.data) {
                    if (toState.data.role) {
                        if (!authorizationService.hasClaimBoolean(toState.data.role)) {
                            event.preventDefault();
                            if (fromState && fromState.name == 'login') { $state.go('login'); }
                            else if (fromState && fromState.name == 'mobile.login') { $state.go('mobile.login'); }
                            else if (fromState && fromState.name == 'promo') { $state.go('promo'); }
                            else if (fromState && fromState.name == 'mobile.promo') { $state.go('mobile.promo'); }
                            else {
                                //$state.go('forbidden');
                                if (this.isMobile.any) {
                                    if (settings.IsMobileSeperate) { window.location.href = settings.MobileUrl; } else {
                                        intranet.common.helpers.CommonHelper.isPromoWebsite(settings.WebApp) && settings.WebSiteIdealFor <= 2
                                            ? $state.go('mobile.promo')
                                            : $state.go('mobile.login');
                                    }
                                } else {
                                    intranet.common.helpers.CommonHelper.isPromoWebsite(settings.WebApp) && settings.WebSiteIdealFor <= 2
                                        ? $state.go('promo')
                                        : $state.go('login');
                                }
                            }

                            //console.log('forbidden-state-change : ' + JSON.stringify(fromState.name));
                            //console.log('forbidden-state-change : ' + JSON.stringify(toState.name));
                        }
                    }
                    if (toState.data.can_access != undefined && toState.data.can_access == false) {
                        event.preventDefault();
                        $state.go('page-not-found');
                    }
                    if (toState.data.title) {
                        //document.title = toState.data.title;
                    }
                }

                if (settings.WebApp == 'fairbook' && fbq) {
                    fbq('track', 'PageView');
                }

                $rootScope.currentState = fromState;
                $rootScope.currentStateParams = fromParams;
            });

        }]);