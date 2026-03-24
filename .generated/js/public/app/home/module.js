angular.module('intranet.home', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, settings, permissionTypes) => {
        $stateProvider
            .state('base', {
            abstract: true,
            url: '?msg',
            views: {
                main: {
                    controller: 'baseCtrl',
                    templateUrl: settings.ThemeName + '/home/base.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.CLIENT_AREA,
                title: settings.Title,
                can_access: !settings.IsFaaS && settings.WebSiteIdealFor <= 2
            }
        })
            .state('base.account', {
            url: '/account',
            views: {
                main: {
                    controller: 'myAccountCtrl',
                    templateUrl: settings.ThemeName + '/home/account/myaccount.html'
                },
                "left@base.account": {
                    controller: settings.ThemeName == "lotus" ? 'sportTreeCtrl' : '',
                    templateUrl: settings.ThemeName == "lotus" ? (settings.ThemeName + '/home/sport/sport-tree.html') : '',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account | ' + settings.Title,
                can_access: !settings.IsFaaS
            }
        })
            .state('base.account.bets', {
            url: '/bets',
            views: {
                content: {
                    controller: settings.ThemeName == 'lotus' ? 'lotusMyBetsCtrl' : 'myBetsCtrl',
                    templateUrl: settings.ThemeName == 'lotus' ? settings.ThemeName + '/home/account/lotus-mybets.html' : settings.ThemeName + '/home/account/mybets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_BET,
                title: 'My Bets | ' + settings.Title
            }
        })
            .state('base.account.fdbethistory', {
            url: '/fd-betshistory',
            views: {
                content: {
                    controller: 'fdBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('base.account.bets.current', {
            url: '/currentbets',
            views: {
                betsreport: {
                    controller: 'currentBetCtrl',
                    templateUrl: settings.ThemeName + '/home/account/current-bet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Current Bets | ' + settings.Title
            }
        })
            .state('base.account.bets.history', {
            url: '/betshistory',
            views: {
                betsreport: {
                    controller: 'betHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('base.account.bets.fdhistory', {
            url: '/fd-betshistory',
            views: {
                betsreport: {
                    controller: 'fdBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('base.account.bets.profitloss', {
            url: '/profitloss',
            views: {
                betsreport: {
                    controller: 'profitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Profit/Loss | ' + settings.Title
            }
        })
            .state('base.account.bets.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                betsreport: {
                    controller: 'fdProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('base.account.profitloss', {
            url: '/my-profitloss',
            views: {
                content: {
                    controller: 'profitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Profit/Loss | ' + settings.Title
            }
        })
            .state('base.account.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                content: {
                    controller: 'fdProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('base.account.profile', {
            url: '/profile',
            views: {
                content: {
                    controller: 'myProfileCtrl',
                    templateUrl: settings.ThemeName + '/home/account/myprofile.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Profile | ' + settings.Title
            }
        })
            .state('base.account.wallet', {
            url: '/wallet',
            views: {
                content: {
                    controller: 'myWalletCtrl',
                    templateUrl: settings.ThemeName + '/home/account/mywallet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Wallet | ' + settings.Title
            }
        })
            .state('base.account.statement', {
            url: '/statement',
            views: {
                content: {
                    controller: 'accountStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/account-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Account Statements | ' + settings.Title
            }
        })
            .state('base.account.bonusstatement', {
            url: '/bonus-statement',
            views: {
                content: {
                    controller: 'bonusStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/bonus-statement.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bonus | ' + settings.Title,
                can_access: !settings.IsFaaS
            }
        })
            .state('base.account.referralstatement', {
            url: '/referral-statement',
            views: {
                content: {
                    controller: 'referralStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/referral-statement.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Referral | ' + settings.Title,
                can_access: !settings.IsFaaS
            }
        })
            .state('base.account.transferstatement', {
            url: '/transfer-statement',
            views: {
                content: {
                    controller: 'accountStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/transfer-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Transfer Statements | ' + settings.Title
            }
        })
            .state('base.account.casinostatement', {
            url: '/casino-statement',
            views: {
                content: {
                    controller: 'casinoStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/casino-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Casino Statements | ' + settings.Title
            }
        })
            .state('base.account.history', {
            url: '/login-history',
            views: {
                content: {
                    controller: 'loginHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/login-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_LOGIN_HISTORY,
                title: 'My Login History | ' + settings.Title
            }
        })
            .state('base.livegames', {
            url: '/live-games',
            views: {
                main: {
                    controller: 'liveGameDemoCtrl',
                    templateUrl: settings.ThemeName + '/livegamedemo/live-game-demo.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Live Games | ' + settings.Title,
            }
        })
            .state('base.home.livegames', {
            url: 'live-casino-games',
            views: {
                center: {
                    controller: 'liveGameDemoCtrl',
                    templateUrl: settings.ThemeName + '/livegamedemo/live-game-demo.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Live Games | ' + settings.Title,
            }
        })
            .state('base.home', {
            url: '/',
            views: {
                main: {
                    controller: 'homeCtrl',
                    templateUrl: settings.ThemeName + '/home/home.html'
                },
                "sporttree@base.home": {
                    templateUrl: settings.ThemeName + '/home/sport/sport-tree.html'
                },
                "left@base.home": {
                    controller: settings.ThemeName != 'bking' && settings.ThemeName != 'dimd' && settings.ThemeName != 'dimd2' && settings.ThemeName != 'sports' ? 'sportTreeCtrl' : '',
                    templateUrl: settings.ThemeName != 'bking' && settings.ThemeName != 'dimd' && settings.ThemeName != 'dimd2' && settings.ThemeName != 'sports' ? settings.ThemeName + '/home/sport/sport-tree.html' : ''
                },
                "center@base.home": {
                    controller: settings.ThemeName == 'lotus' || settings.ThemeName == 'bking' ? 'inplayLotusCtrl' : 'marketHighlightCtrl',
                    templateUrl: settings.ThemeName + (settings.ThemeName == 'lotus' || settings.ThemeName == 'bking' ? '/home/sport/inplay.html' : '/home/sport/market-highlight.html')
                },
                "right_placebet@base.home": {
                    controller: settings.ThemeName != 'sports' ? 'placeBetCtrl' : '',
                    templateUrl: settings.ThemeName != 'sports' ? settings.ThemeName + '/home/sport/place-bet.html' : ''
                },
                "right_openbet@base.home": {
                    controller: (settings.ThemeName == 'bking' ? 'openBetsByEventCtrl' : 'openBetsCtrl'),
                    templateUrl: settings.ThemeName + '/home/sport/open-bets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.CLIENT_AREA,
                title: settings.Title + ' | Best Betting Exchange'
            }
        })
            .state('base.home.inplay', {
            url: 'inplay',
            views: {
                "center@base.home": {
                    controller: 'inplayCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/inplay.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'In-Play Betting & Best Odds | ' + settings.Title
            }
        })
            .state('base.home.results', {
            url: 'recent-results',
            views: {
                "center@base.home": {
                    controller: 'resultsCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/recent-results.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'List of recently resulted markets | ' + settings.Title
            }
        })
            .state('base.home.multimarket', {
            url: 'multimarket',
            views: {
                "center@base.home": {
                    controller: 'multiMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/multi-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Many Markets in One Screen | ' + settings.Title
            }
        })
            .state('base.home.mymarkets', {
            url: 'mymarkets',
            views: {
                "center@base.home": {
                    controller: 'myMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/my-markets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Markets in One Screen | ' + settings.Title
            }
        })
            .state('base.home.sport', {
            url: 'sport/:nodetype/:id/:eventTypeId',
            views: {
                left: {
                    controller: settings.ThemeName != 'bking' && settings.ThemeName != 'dimd' && settings.ThemeName != 'sports' ? 'sportTreeCtrl' : '',
                    templateUrl: settings.ThemeName != 'bking' && settings.ThemeName != 'dimd' && settings.ThemeName != 'sports' ? settings.ThemeName + '/home/sport/sport-tree.html' : ''
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('base.home.sport.racingmarket', {
            url: '/racing',
            views: {
                "center@base.home": {
                    controller: 'horseHighlightCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/horse-market-highlight.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Horse Race Betting Exchange and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.livegames', {
            url: '/live-games',
            views: {
                "center@base.home": {
                    controller: (settings.ThemeName == 'lotus' || settings.ThemeName == 'bking' ? 'liveGamesHighlightCtrl' : 'liveGamesCtrl'),
                    templateUrl: settings.ThemeName + (settings.ThemeName == 'lotus' || settings.ThemeName == 'bking' ? '/home/sport/live-games-highlight.html' : '/home/sport/live-games.html')
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Live Exchange Games Betting and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.virtualgames', {
            url: '/virtual-games',
            views: {
                "center@base.home": {
                    controller: 'virtualGamesCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/virtual-games.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Virtual Exchange Games Betting and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.fullracemarket', {
            url: '/racing/:marketid',
            views: {
                "center@base.home": {
                    controller: 'horseMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/horse-fullmarket.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Horse Race Betting Exchange and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.upcomingrace', {
            url: '/upcoming-race/:marketid',
            views: {
                "center@base.home": {
                    controller: 'upcomingRaceCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/upcoming-race-markets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Horse Race Betting Exchange and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.market', {
            url: '/market',
            views: {
                "center@base.home": {
                    controller: 'marketHighlightCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/market-highlight.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Highlights of Popular Betting Markets | ' + settings.Title
            }
        })
            .state('base.home.sport.fullmarket', {
            url: '/fullmarket/:eventId',
            views: {
                "center@base.home": {
                    controller: 'fullMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/fullmarket.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Betting Market and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.livegamesmarket', {
            url: '/live-games-market/:eventid',
            views: {
                "center@base.home": {
                    controller: 'liveGamesMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/live-games-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Live Exchange Games Market and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.virtualgamesmarket', {
            url: '/virtual-games-market/:eventid',
            views: {
                "center@base.home": {
                    controller: 'virtualGamesMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/virtual-games-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Live Exchange Games Market and Best Odds | ' + settings.Title
            }
        })
            .state('base.home.sport.binarymarket', {
            url: '/binary-market',
            views: {
                "center@base.home": {
                    controller: 'binaryMarketCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/binary-market.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Betting Market and Best Odds | ' + settings.Title
            }
        })
            .state('base.account.passwordchange', {
            url: '/change-password',
            views: {
                content: {
                    controller: 'passwordChangeCtrl',
                    templateUrl: settings.ThemeName + '/home/account/password-change.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Change Password | ' + settings.Title
            }
        })
            .state('base.account.transferonline', {
            url: '/transfer-online/:tab',
            views: {
                content: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/home/account/payment-gateway.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                tab: { squash: true, value: null },
            },
            data: {
                title: 'Deposit/Withdraw Money Online | ' + settings.Title
            }
        })
            .state('base.account.transfercrypto', {
            url: '/transfer-crypto/:tab',
            views: {
                content: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/home/account/payment-gateway-crypto.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                tab: { squash: true, value: null },
            },
            data: {
                title: 'Deposit/Withdraw Crypto | ' + settings.Title
            }
        })
            .state('base.casino', {
            url: '/casino',
            views: {
                "main@base": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/live-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.indiancasino', {
            url: '/indian-casino',
            views: {
                "main@base": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/indian-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.slotcasino', {
            url: '/slot-casino',
            views: {
                "main@base": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/slot-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.home.casino', {
            url: 'live-casino',
            views: {
                "center@base.home": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.home.slotcasino', {
            url: 'slot-games',
            views: {
                "center@base.home": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/slot-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.publink', {
            url: '/link',
            views: {
                "main@base": {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/publink.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.publink.privacypolicy', {
            url: '/privacy-policy',
            views: {
                "homecenter@base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/privacy-policy.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.publink.termscondition', {
            url: '/terms-and-condition',
            views: {
                "homecenter@base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/terms-and-condition.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.publink.responsiblegambling', {
            url: '/responsible-gambling',
            views: {
                "homecenter@base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/responsible-gambling.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.publink.aboutus', {
            url: '/about-us',
            views: {
                "homecenter@base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/about-us.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('base.publink.kyc', {
            url: '/general-policy',
            views: {
                "homecenter@base.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/kyc.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('paymentreceived', {
            url: '/payment-status/:status',
            views: {
                main: {
                    controller: 'paymentReceivedCtrl',
                    templateUrl: settings.ThemeName + '/home/account/payment-status.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Deposit Money Online | ' + settings.Title
            }
        })
            .state('login', {
            url: '/login?:msg',
            views: {
                main: {
                    controller: 'loginCtrl',
                    templateUrl: settings.ThemeName + (settings.WebSiteIdealFor <= 2 ? '/home/login.html' : '/home/login-master.html')
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                msg: { squash: true, value: null },
            },
            data: {
                title: settings.Title + ' Login',
                can_access: !settings.IsFaaS
            }
        })
            .state('signup', {
            url: '/register?:code',
            views: {
                main: {
                    controller: 'signUpCtrl',
                    templateUrl: settings.ThemeName + '/home/signup.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Register',
                can_access: !settings.IsFaaS
            }
        })
            .state('verify', {
            url: '/verify',
            views: {
                main: {
                    controller: 'verificationCtrl',
                    templateUrl: settings.ThemeName + '/home/verification.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Verification',
                can_access: !settings.IsFaaS
            }
        })
            .state('glctv', {
            url: '/glc-streaming-line',
            views: {
                main: {
                    controller: 'gLCTVCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/glc-tv.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Broadcasting'
            }
        })
            .state('rdview', {
            url: '/radar/:marketid',
            views: {
                main: {
                    controller: 'radarModalCtrl',
                    templateUrl: settings.ThemeName + '/home/sport/radar-modal.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Radar Betting',
                can_access: !settings.IsFaaS
            }
        })
            .state('wcstv', {
            url: '/wcs-streaming-line/:eventId',
            views: {
                main: {
                    controller: 'wcsPopupTVCtrl',
                    templateUrl: 'app/common/components/wcs-popup-tv/wcs-popup-tv.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Broadcasting'
            }
        })
            .state('page-not-found', {
            url: '/page-not-found',
            views: {
                main: {
                    controller: 'pageNotFoundCtrl',
                    templateUrl: settings.ThemeName + '/home/page-not-found.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Page is Not Found | ' + settings.Title
            }
        })
            .state('forbidden', {
            url: '/forbidden',
            views: {
                main: {
                    controller: 'pageNotFoundCtrl',
                    templateUrl: settings.ThemeName + '/home/forbidden.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Sorry! You Do Not Have Permission to Access This Page | ' + settings.Title
            }
        })
            .state('test', {
            url: '/test',
            views: {
                main: {
                    templateUrl: settings.ThemeName + '/home/test.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('testreport', {
            url: '/testreport',
            views: {
                main: {
                    templateUrl: settings.ThemeName + '/home/testreport.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('maintenance', {
            url: '/maintenance',
            views: {
                main: {
                    controller: 'maintenanceCtrl',
                    templateUrl: settings.ThemeName + '/home/maintenance.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' is under maintenance',
            }
        })
            .state('promo', {
            url: '/promo',
            views: {
                main: {
                    controller: 'promoCtrl',
                    templateUrl: settings.ThemeName + '/home/promo.html'
                },
                "center@promo": {
                    templateUrl: (settings.ThemeName == 'lotus' || settings.ThemeName == 'sports' || settings.ThemeName == 'dimd2') ? settings.ThemeName + '/home/promo-home.html' : ''
                },
                "homecenter@promo": {
                    templateUrl: settings.ThemeName == 'sports' || settings.ThemeName == 'dimd2' ? settings.ThemeName + '/home/promo-highlight.html' : ''
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Register/Login',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.sports', {
            url: '/sports',
            views: {
                "homecenter@promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/promo-sports.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' All sports betting',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.inplay', {
            url: '/inplay',
            views: {
                "homecenter@promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/promo-inplay.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' All sports betting',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.casino', {
            url: '/casino',
            views: {
                "center@promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/promo-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Live Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.indiancasino', {
            url: '/indian-casino',
            views: {
                "center@promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/promo-indian-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Indian Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.slotcasino', {
            url: '/slot-casino',
            views: {
                "center@promo": {
                    controller: 'promoSportsCtrl',
                    templateUrl: settings.ThemeName + '/home/casino/promo-slot-casino.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Slot Casino',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.offerinfo', {
            url: '/offer-info',
            views: {
                "center@promo": {
                    templateUrl: settings.ThemeName + '/home/offer-info.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Offer/Promotion Information',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.publink', {
            url: '/link',
            views: {
                "center@promo": {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/promo-publink.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.publink.privacypolicy', {
            url: '/privacy-policy',
            views: {
                "homecenter@promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/privacy-policy.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.publink.termscondition', {
            url: '/terms-and-condition',
            views: {
                "homecenter@promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/terms-and-condition.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.publink.responsiblegambling', {
            url: '/responsible-gambling',
            views: {
                "homecenter@promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/responsible-gambling.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.publink.aboutus', {
            url: '/about-us',
            views: {
                "homecenter@promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/about-us.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('promo.publink.kyc', {
            url: '/general-policy',
            views: {
                "homecenter@promo.publink": {
                    templateUrl: settings.ThemeName + '/home/publink/kyc.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
                can_access: !settings.IsFaaS
            }
        })
            .state('privacypolicy', {
            url: '/privacy-policy',
            views: {
                main: {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/publink.html'
                },
                "publink-center@privacypolicy": {
                    templateUrl: settings.ThemeName + '/home/publink/privacy-policy.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Privacy Policy',
            }
        })
            .state('cookiepolicy', {
            url: '/cookie-policy',
            views: {
                main: {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/publink.html'
                },
                "publink-center@cookiepolicy": {
                    templateUrl: settings.ThemeName + '/home/publink/cookie-policy.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Cookie Policy',
            }
        })
            .state('termsconditions', {
            url: '/terms-conditions',
            views: {
                main: {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/publink.html'
                },
                "publink-center@termsconditions": {
                    templateUrl: settings.ThemeName + '/home/publink/terms-conditions.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Terms And Conditions',
            }
        })
            .state('responsiblegambling', {
            url: '/responsible-gambling',
            views: {
                main: {
                    controller: 'pubLinkCtrl',
                    templateUrl: settings.ThemeName + '/home/publink/publink.html'
                },
                "publink-center@responsiblegambling": {
                    templateUrl: settings.ThemeName + '/home/publink/responsible-gambling.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title + ' Responsible Gambling',
            }
        })
            .state('lmaster', {
            url: '/l-master',
            views: {
                main: {
                    templateUrl: settings.ThemeName + '/l-master/l-master.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('base.home.account', {
            url: 'ac',
            views: {
                'center@base.home': {
                    controller: 'myAccountCtrl',
                    templateUrl: settings.ThemeName + '/home/account/myaccount.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account | ' + settings.Title,
                can_access: !settings.IsFaaS
            }
        })
            .state('base.home.account.statement', {
            url: '/statement',
            views: {
                content: {
                    controller: 'accountStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/account-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Account Statements | ' + settings.Title
            }
        })
            .state('base.home.account.profile', {
            url: '/profile',
            views: {
                content: {
                    controller: 'myProfileCtrl',
                    templateUrl: settings.ThemeName + '/home/account/myprofile.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Profile | ' + settings.Title
            }
        })
            .state('base.home.account.wallet', {
            url: '/wallet',
            views: {
                content: {
                    controller: 'myWalletCtrl',
                    templateUrl: settings.ThemeName + '/home/account/mywallet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Wallet | ' + settings.Title
            }
        })
            .state('base.home.account.transferonline', {
            url: '/transfer-online/:tab',
            views: {
                content: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/home/account/payment-gateway.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                tab: { squash: true, value: null },
            },
            data: {
                title: 'Deposit/Withdraw Money Online | ' + settings.Title
            }
        }).state('base.home.account.bonusstatement', {
            url: '/bonus-statement',
            views: {
                content: {
                    controller: 'bonusStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/bonus-statement.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bonus | ' + settings.Title,
                can_access: !settings.IsFaaS
            }
        })
            .state('base.home.account.referralstatement', {
            url: '/referral-statement',
            views: {
                content: {
                    controller: 'referralStatementCtrl',
                    templateUrl: settings.ThemeName + '/home/account/referral-statement.html'
                },
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Referral | ' + settings.Title,
                can_access: !settings.IsFaaS
            }
        })
            .state('base.home.account.bets', {
            url: '/bets',
            views: {
                content: {
                    controller: settings.ThemeName == 'lotus' ? 'lotusMyBetsCtrl' : 'myBetsCtrl',
                    templateUrl: settings.ThemeName == 'lotus' ? settings.ThemeName + '/home/account/lotus-mybets.html' : settings.ThemeName + '/home/account/mybets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_BET,
                title: 'My Bets | ' + settings.Title
            }
        })
            .state('base.home.account.bets.current', {
            url: '/currentbets',
            views: {
                betsreport: {
                    controller: 'currentBetCtrl',
                    templateUrl: settings.ThemeName + '/home/account/current-bet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Current Bets | ' + settings.Title
            }
        })
            .state('base.home.account.bets.history', {
            url: '/betshistory',
            views: {
                betsreport: {
                    controller: 'betHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('base.home.account.bets.fdhistory', {
            url: '/fd-betshistory',
            views: {
                betsreport: {
                    controller: 'fdBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('base.home.account.bets.profitloss', {
            url: '/my-profitloss',
            views: {
                betsreport: {
                    controller: 'profitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Profit/Loss | ' + settings.Title
            }
        })
            .state('base.home.account.bets.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                betsreport: {
                    controller: 'fdProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('base.home.account.profitloss', {
            url: '/my-profitloss',
            views: {
                content: {
                    controller: 'profitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Profit/Loss | ' + settings.Title
            }
        })
            .state('base.home.account.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                content: {
                    controller: 'fdProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/home/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('base.home.account.loginhistory', {
            url: '/login-history',
            views: {
                content: {
                    controller: 'loginHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/login-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_LOGIN_HISTORY,
                title: 'My Login History | ' + settings.Title
            }
        })
            .state('base.home.account.passwordchange', {
            url: '/change-password',
            views: {
                content: {
                    controller: 'passwordChangeCtrl',
                    templateUrl: settings.ThemeName + '/home/account/password-change.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Change Password | ' + settings.Title
            }
        })
            .state('base.home.account.setting', {
            url: '/setting',
            views: {
                content: {
                    templateUrl: settings.ThemeName + '/home/account/setting.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Change Password | ' + settings.Title
            }
        });
        $urlRouterProvider.when('', ['commonProcessService',
                (commonProcessService) => {
                commonProcessService.onLoadLocationSelection();
            }]);
        $urlRouterProvider.otherwise('/page-not-found');
    }]);
//# sourceMappingURL=module.js.map