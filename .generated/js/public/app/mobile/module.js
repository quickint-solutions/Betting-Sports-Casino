angular.module('intranet.mobile', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, settings, permissionTypes) => {
        $stateProvider
            .state('mobile', {
            abstract: true,
            url: '/mobile',
            views: {
                main: {
                    template: '<div ui-view="mobilemain" class="mobile-top"></div>'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title,
            }
        })
            .state('mobile.login', {
            url: '/login?:msg',
            views: {
                mobilemain: {
                    controller: 'loginCtrl',
                    templateUrl: settings.ThemeName + (settings.WebSiteIdealFor <= 2 ? '/mobile/login.html' : '/home/login-master.html')
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                msg: { squash: true, value: null },
            },
            data: {
                title: settings.Title + ' | Login'
            }
        })
            .state('mobile.signup', {
            url: '/register?:code',
            views: {
                mobilemain: {
                    controller: 'signUpCtrl',
                    templateUrl: settings.ThemeName + '/mobile/signup.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Register'
            }
        })
            .state('mobile.verify', {
            url: '/mobile-verify',
            views: {
                mobilemain: {
                    controller: 'verificationCtrl',
                    templateUrl: settings.ThemeName + '/mobile/verification.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Verification',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base', {
            url: '',
            views: {
                mobilemain: {
                    controller: 'mobileBaseCtrl',
                    templateUrl: settings.ThemeName + '/mobile/base.html'
                },
                'openbets@mobile.base': {
                    controller: settings.ThemeName != 'dimd' && settings.ThemeName != 'sports' ? 'mobileOpenBetsCtrl' : '',
                    templateUrl: settings.ThemeName != 'dimd' && settings.ThemeName != 'sports' ? settings.ThemeName + '/mobile/open-bets.html' : ''
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.CLIENT_AREA,
                title: settings.Title + ' | Best Betting Exchange',
                can_access: !settings.IsFaaS && settings.WebSiteIdealFor <= 2
            }
        })
            .state('mobile.base.openbets', {
            url: '/open-bets',
            views: {
                center: {
                    controller: 'mobileOpenBetsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/open-bets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.base.home', {
            url: '/home',
            views: {
                center: {
                    controller: settings.ThemeName == 'sports' ? 'marketHighlightCtrl' : 'mobileHomeCtrl',
                    templateUrl: settings.ThemeName + (settings.ThemeName == 'sports' ? '/mobile/market-highlight.html' : '/mobile/home.html')
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.base.highlight', {
            url: '/sports/:nodetype/:id/:eventTypeId',
            views: {
                center: {
                    controller: 'marketHighlightCtrl',
                    templateUrl: settings.ThemeName + '/mobile/market-highlight.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                nodetype: { type: 'int', value: 1 },
                id: { type: 'string', value: settings.CricketId },
                eventTypeId: { type: 'string', value: settings.CricketId },
            },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.base.test', {
            url: '/test',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/test.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('mobile.base.inplay', {
            url: '/inplay',
            views: {
                center: {
                    controller: settings.ThemeName == 'sports' ? 'inplayCtrl' : 'mobileInplayCtrl',
                    templateUrl: settings.ThemeName + '/mobile/inplay.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'In-Play Betting & Best Odds | ' + settings.Title
            }
        })
            .state('mobile.base.mymarket', {
            url: '/my-markets',
            views: {
                center: {
                    controller: 'mobileMyMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/my-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.base.sports', {
            url: '/sports/:nodetype/:id/:page',
            views: {
                center: {
                    controller: 'mobileSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/sports.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                nodetype: { squash: true, value: null },
                id: { squash: true, value: null },
                page: { squash: true, value: null }
            },
            data: {
                title: 'All Sport Betting & Best Odds | ' + settings.Title
            }
        })
            .state('mobile.base.multimarket', {
            url: '/multimarket',
            views: {
                center: {
                    controller: 'mobileMultiMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/multi-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Many Markets in One Screen | ' + settings.Title
            }
        })
            .state('mobile.base.account', {
            url: '/account',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/account.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account | ' + settings.Title
            }
        })
            .state('mobile.base.market', {
            url: '/market/:marketid',
            views: {
                center: {
                    controller: 'mobileMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('mobile.base.marketbyevent', {
            url: '/market-event/:eventid',
            views: {
                center: {
                    controller: 'mobileMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('mobile.base.horsemarket', {
            url: '/horsemarket/:eventtype/:marketid',
            views: {
                center: {
                    controller: settings.ThemeName == "dimd" ? 'sevenRaceMarketCtrl' : 'mobileHorseMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/horse-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Horse Race Betting Exchange and Best Odds | ' + settings.Title
            }
        }).state('mobile.base.livegamesmarket', {
            url: '/live-games-markets/:eventid',
            views: {
                center: {
                    controller: 'mobileLiveGamesMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/live-games-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Live Exchange Games'
            }
        })
            .state('mobile.base.settings', {
            url: '/settings',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/msetting.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Your open bets | ' + settings.Title
            }
        })
            .state('mobile.seven', {
            url: '/s',
            views: {
                mobilemain: {
                    template: '<div ui-view="mobilemain" class="mobile-top"></div>'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title
            }
        })
            .state('mobile.seven.base', {
            url: '',
            views: {
                mobilemain: {
                    controller: 'sevenBaseCtrl',
                    templateUrl: settings.ThemeName + '/mobile/base.html'
                }, 'openbets@mobile.seven.base': {
                    controller: settings.ThemeName == 'bking' ? 'openBetsByEventCtrl' : '',
                    templateUrl: settings.ThemeName == 'bking' ? settings.ThemeName + '/mobile/open-bets.html' : ''
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.CLIENT_AREA,
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.seven.base.home', {
            url: '/home',
            views: {
                center: {
                    controller: 'sevenHomeCtrl',
                    templateUrl: settings.ThemeName + '/mobile/home.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.seven.base.livegames', {
            url: '/live-games/:name',
            views: {
                center: {
                    controller: 'mobileLiveGamesCtrl',
                    templateUrl: settings.ThemeName + '/mobile/live-games.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Live Exchange Games'
            }
        })
            .state('mobile.seven.base.openbets', {
            url: '/openbets',
            views: {
                center: {
                    controller: 'mobileOpenBetsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/open-bets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Your open bets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.settings', {
            url: '/settings',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/msettings.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Your open bets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.timesettings', {
            url: '/time-settings',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/time-setting.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Your open bets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.mymarket', {
            url: '/my-markets',
            views: {
                center: {
                    controller: 'mobileMyMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/my-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.seven.base.sports', {
            url: '/sports/:nodetype/:id/:name/:eventTypeId',
            views: {
                center: {
                    controller: 'sevenSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/sports.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                nodetype: { squash: true, value: null },
                id: { squash: true, value: null },
                name: { squash: true, value: null },
                eventTypeId: { squash: true, value: null }
            },
            data: {
                title: 'All Sport Betting & Best Odds | ' + settings.Title
            }
        })
            .state('mobile.seven.base.race', {
            url: '/race/:id/:name',
            views: {
                center: {
                    controller: 'sevenRaceHighlightCtrl',
                    templateUrl: settings.ThemeName + '/mobile/race-highlight.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'All Sport Betting & Best Odds | ' + settings.Title
            }
        })
            .state('mobile.seven.base.multimarket', {
            url: '/multimarket',
            views: {
                center: {
                    controller: 'mobileMultiMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/multi-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Many Markets in One Screen | ' + settings.Title
            }
        })
            .state('mobile.seven.base.account', {
            url: '/account',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/account.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account | ' + settings.Title
            }
        })
            .state('mobile.seven.base.market', {
            url: '/market/:eventId/:betid',
            views: {
                center: {
                    controller: 'sevenMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                marketid: { squash: true, value: null },
                betid: { squash: true, value: null },
            },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.livegamesmarket', {
            url: '/live-games-markets/:eventid/:betid',
            views: {
                center: {
                    controller: 'mobileLiveGamesMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/live-games-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Live Exchange Games'
            }
        })
            .state('mobile.seven.base.racemarket', {
            url: '/:eventtype/race-market/:marketid/:betid',
            views: {
                center: {
                    controller: 'sevenRaceMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/horse-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                eventtype: { squash: true, value: null },
                marketid: { squash: true, value: null },
                betid: { squash: true, value: null },
            },
            data: {
                title: 'Horse Race Betting Exchange and Best Odds | ' + settings.Title
            }
        })
            .state('mobile.seven.base.binarymarket', {
            url: '/binary-market/:eventTypeId/:betid',
            views: {
                center: {
                    controller: 'mobileBinaryMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/binary-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                eventTypeId: { squash: true, value: null },
                betid: { squash: true, value: null },
            },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('mobile.base.binarymarket', {
            url: '/binary-market/:eventTypeId',
            views: {
                center: {
                    controller: 'mobileBinaryMarketCtrl',
                    templateUrl: settings.ThemeName + '/mobile/binary-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                eventTypeId: { squash: true, value: null },
            },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('mobile.promo', {
            url: '/m-promo',
            views: {
                mobilemain: {
                    controller: 'promoCtrl',
                    templateUrl: settings.ThemeName + '/mobile/promo.html'
                },
                "mobile-center@mobile.promo": {
                    templateUrl: settings.ThemeName + '/mobile/promo-home.html'
                },
                "homecenter@mobile.promo": {
                    templateUrl: settings.ThemeName == 'sports' ? settings.ThemeName + '/mobile/promo-highlight.html' : ''
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Register/Login',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.seven.base.rules', {
            url: '/rules-and-regulations',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/rules-regulation.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Rules And Regulations'
            }
        }).state('mobile.seven.base.kyc', {
            url: '/kyc',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/kyc.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | KYC'
            }
        })
            .state('mobile.seven.base.reponsiblegame', {
            url: '/responsible-game',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/responsible-game.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | responsible game'
            }
        })
            .state('mobile.seven.base.exclusionpolicy', {
            url: '/exclusion-policy',
            views: {
                center: {
                    templateUrl: settings.ThemeName + '/mobile/exclusion-policy.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | exclusion policy'
            }
        })
            .state('mobile.seven.base.passwordchange', {
            url: '/change-password',
            views: {
                center: {
                    controller: 'passwordChangeCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/password-change.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Change Password | ' + settings.Title
            }
        })
            .state('mobile.seven.base.scoreboard', {
            url: '/scoreboard/:eventId',
            views: {
                center: {
                    controller: 'mobileScoreboardCtrl',
                    templateUrl: settings.ThemeName + '/mobile/scoreboard.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                marketid: { squash: true, value: null },
            },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.highlight', {
            url: '/market-highlight/:nodetype/:id/:eventTypeId',
            views: {
                center: {
                    controller: 'bkingHighlightCtrl',
                    templateUrl: settings.ThemeName + '/mobile/market-highlight.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                nodetype: { squash: true, value: null },
                id: { squash: true, value: null },
                eventTypeId: { squash: true, value: null },
            },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        }).state('mobile.seven.base.livegamehighlight', {
            url: '/game-highlight/:eventTypeId',
            views: {
                center: {
                    controller: 'bkingLiveGamesHighlightCtrl',
                    templateUrl: settings.ThemeName + '/mobile/live-games-highlight.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                eventTypeId: { squash: true, value: null },
            },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.base.fdlivegames', {
            url: '/fd-live-games',
            views: {
                center: {
                    controller: 'liveGameDemoCtrl',
                    templateUrl: settings.ThemeName + '/livegamedemo/live-game-demo.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.seven.base.fdlivegames', {
            url: '/fd-live-games',
            views: {
                center: {
                    controller: 'liveGameDemoCtrl',
                    templateUrl: settings.ThemeName + '/livegamedemo/live-game-demo.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('mobile.base.publink', {
            url: '/link',
            views: {
                "center@mobile.base": {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/publink.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.publink.privacypolicy', {
            url: '/privacy-policy',
            views: {
                "homecenter@mobile.base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/privacy-policy.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.publink.termscondition', {
            url: '/terms-and-condition',
            views: {
                "homecenter@mobile.base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/terms-and-condition.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.publink.responsiblegambling', {
            url: '/responsible-gambling',
            views: {
                "homecenter@mobile.base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/responsible-gambling.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.publink.aboutus', {
            url: '/about-us',
            views: {
                "homecenter@mobile.base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/about-us.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.publink.kyc', {
            url: '/general-policy',
            views: {
                "homecenter@mobile.base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/kyc.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.sports', {
            url: '/sports',
            views: {
                "homecenter@mobile.promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/promo-sports.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' All sports betting',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.inplay', {
            url: '/inplay',
            views: {
                "homecenter@mobile.promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/promo-inplay.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' All sports betting',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.indiancasino', {
            url: '/indian-casino',
            views: {
                "homecenter@mobile.promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/casino/promo-indian-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Indian Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.slotcasino', {
            url: '/slot-casino',
            views: {
                "homecenter@mobile.promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/casino/promo-slot-casino.html'
                },
                "mobile-center@mobile.promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/casino/promo-slot-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Slot Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.casino', {
            url: '/m-casino-promo',
            views: {
                "homecenter@mobile.promo": {
                    controller: settings.ThemeName == 'sports' ? 'promoSportsCtrl' : '',
                    templateUrl: settings.ThemeName + (settings.ThemeName == 'sports' ? '/mobile/casino/promo-casino.html' : '/mobile/promo-casino.html')
                },
                "mobile-center@mobile.promo": {
                    controller: settings.ThemeName == 'sports' || settings.ThemeName == 'dimd2' ? 'promoSportsCtrl' : '',
                    templateUrl: settings.ThemeName + (settings.ThemeName == 'sports' || settings.ThemeName == 'dimd2' ? '/mobile/casino/promo-casino.html' : '/mobile/promo-casino.html')
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Register/Login',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.offerinfo', {
            url: '/m-offer-info',
            views: {
                "mobile-center@mobile.promo": {
                    templateUrl: settings.ThemeName + '/mobile/offer-info.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Offer/Promotion Information',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.indiancasino', {
            url: '/indian-casino',
            views: {
                "center@mobile.base": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/casino/indian-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Indian Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.slotcasino', {
            url: '/slot-casino',
            views: {
                "center@mobile.base": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/casino/slot-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Slot Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.base.casino', {
            url: '/m-casino-promo',
            views: {
                "center@mobile.base": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + (settings.ThemeName == 'sports' ? '/mobile/casino/live-casino.html' : '/mobile/casino/casino.html')
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Register/Login',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.publink', {
            url: '/link',
            views: {
                "mobile-center@mobile.promo": {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/promo-publink.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.publink.privacypolicy', {
            url: '/privacy-policy',
            views: {
                "homecenter@mobile.promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/privacy-policy.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.publink.termscondition', {
            url: '/terms-and-condition',
            views: {
                "homecenter@mobile.promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/terms-and-condition.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.publink.responsiblegambling', {
            url: '/responsible-gambling',
            views: {
                "homecenter@mobile.promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/responsible-gambling.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.publink.aboutus', {
            url: '/about-us',
            views: {
                "homecenter@mobile.promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/about-us.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('mobile.promo.publink.kyc', {
            url: '/general-policy',
            views: {
                "homecenter@mobile.promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/kyc.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        });
    }]);
//# sourceMappingURL=module.js.map