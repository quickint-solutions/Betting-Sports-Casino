angular.module('intranet.admin', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, settings, permissionTypes) => {
        $stateProvider
            .state('admin', {
            url: '/admin',
            views: {
                main: {
                    controller: 'adminCtrl',
                    templateUrl: settings.ThemeName + '/admin/admin.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.ADMIN_AREA,
                title: 'Admin | ' + settings.Title
            },
        })
            .state('admin.dashboard', {
            url: '/dashboard',
            views: {
                main: {
                    controller: 'adminDashboardCtrl',
                    templateUrl: settings.ThemeName + '/admin/dashboard.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.ADMIN_AREA,
                title: 'Admin Dashboard | ' + settings.Title
            },
        })
            .state('admin.languages', {
            url: '/languages',
            views: {
                main: {
                    controller: 'languageCtrl',
                    templateUrl: settings.ThemeName + '/admin/language/language.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_LANGUAGE,
                title: 'Manage Languages | ' + settings.Title
            }
        })
            .state('admin.languages.translations', {
            url: '/:langName/:langId/translations',
            views: {
                "main@admin": {
                    controller: 'translationCtrl',
                    templateUrl: settings.ThemeName + '/admin/language/translation.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_TRANSLATION,
                title: 'Manage Translation | ' + settings.Title
            }
        })
            .state('admin.websites', {
            url: '/websites',
            views: {
                main: {
                    controller: 'websiteCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/website.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_WEBSITE,
                title: 'Manage Websites | ' + settings.Title
            }
        })
            .state('admin.manageip', {
            url: '/manageip',
            views: {
                main: {
                    controller: 'manageIpCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/manage-ip.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_IP,
                title: 'Manage IP | ' + settings.Title
            }
        })
            .state('admin.permissions', {
            url: '/permissions',
            views: {
                main: {
                    controller: 'permissionCtrl',
                    templateUrl: settings.ThemeName + '/admin/permission/permission.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_PERMISSION,
                title: 'Manage Permission | ' + settings.Title
            }
        })
            .state('admin.users', {
            url: '/users',
            views: {
                main: {
                    controller: 'userCtrl',
                    templateUrl: settings.ThemeName + '/admin/user/user.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_MEMBER,
                title: 'Manage Users | ' + settings.Title
            }
        })
            .state('admin.runners', {
            url: '/runners',
            views: {
                main: {
                    controller: 'runnerCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/runner.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_RUNNER,
                title: 'Manage Runners | ' + settings.Title
            }
        })
            .state('admin.runnersprice', {
            url: '/runners-price',
            views: {
                main: {
                    controller: 'runnerPriceCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/runner-price.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_DEFAULT_PRICE,
                title: 'Manage Runners Price | ' + settings.Title
            }
        })
            .state('admin.markets', {
            url: '/markets',
            views: {
                main: {
                    controller: 'manageMarketCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/managemarket.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_MARKET,
                title: 'Manage Markets | ' + settings.Title
            }
        })
            .state('admin.videomanager', {
            url: '/video-manager',
            views: {
                main: {
                    controller: 'videoManagerCtrl',
                    templateUrl: settings.ThemeName + '/admin/video/video-manager.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Videos | ' + settings.Title
            }
        })
            .state('admin.betfair', {
            url: '/betfair/account',
            views: {
                main: {
                    controller: 'betfairAccountCtrl',
                    templateUrl: settings.ThemeName + '/admin/betfair/betfair-account.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_BETFAIR_ACCOUNT,
                title: 'Manage Betfair Accounts | ' + settings.Title
            }
        })
            .state('admin.betfairsports', {
            url: '/betfair/sports',
            views: {
                "main@admin": {
                    controller: 'betfairSportCtrl',
                    templateUrl: settings.ThemeName + '/admin/betfair/betfair-sport.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_BOT,
                title: 'Manage Betfair Bots | ' + settings.Title
            }
        })
            .state('admin.bridgesports', {
            url: '/bridge/sports',
            views: {
                "main@admin": {
                    controller: 'bridgeSportCtrl',
                    templateUrl: settings.ThemeName + '/admin/betfair/bridge-sport.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_BOT,
                title: 'Manage Bridge Bots | ' + settings.Title
            }
        })
            .state('admin.sports', {
            url: '/sports',
            views: {
                main: {
                    controller: 'eventTypeCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/eventtype.html'
                }
            },
            ncyBreadcrumb: {
                label: '{{ctrl.$stateParams.eventtypename}}',
            },
            data: {
                role: permissionTypes.MANAGE_EVENT_TYPE,
                title: 'Manage Event Types | ' + settings.Title
            }
        })
            .state('admin.sports.event', {
            url: '/:eventtypeid/:eventtypename',
            views: {
                "main@admin": {
                    controller: 'eventCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/event.html'
                }
            },
            ncyBreadcrumb: {
                label: '{{ctrl.$stateParams.eventname}}',
            },
            data: {
                role: permissionTypes.MANAGE_EVENT,
                title: 'Manage Events | ' + settings.Title
            }
        })
            .state('admin.sports.event.market', {
            url: '/:eventid/:eventname',
            views: {
                "main@admin": {
                    controller: 'marketCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/market.html'
                }
            },
            data: {
                role: permissionTypes.MANAGE_MARKET,
                title: 'Manage Markets | ' + settings.Title
            }
        })
            .state('admin.account', {
            url: '/myaccount',
            views: {
                main: {
                    controller: 'sAAccountCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-account.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Languages | ' + settings.Title
            }
        })
            .state('admin.account.plstatement', {
            url: '/pl-statement',
            views: {
                content: {
                    controller: 'sAStatementsCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-plstmt.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Account P&L Statements | ' + settings.Title
            }
        })
            .state('admin.account.creditstatement', {
            url: '/credit-statement',
            views: {
                content: {
                    controller: 'sAStatementsCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-creditstmt.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Account Credit Statements | ' + settings.Title
            }
        })
            .state('admin.account.transferstatement', {
            url: '/transfer-statement',
            views: {
                content: {
                    controller: 'sAStatementsCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-transferstmt.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Account Transfer Statements | ' + settings.Title
            }
        })
            .state('admin.account.casinostatement', {
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
            .state('admin.account.betshistory', {
            url: '/betshistory',
            views: {
                content: {
                    controller: 'betHistoryCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('admin.account.fdbetshistory', {
            url: '/fd-betshistory',
            views: {
                content: {
                    controller: 'fdBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/fd-bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Bet History | ' + settings.Title
            }
        })
            .state('admin.account.fdbetsprofitloss', {
            url: '/fd-profit-loss',
            views: {
                content: {
                    controller: 'fdProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Bet History | ' + settings.Title
            }
        })
            .state('admin.livebets', {
            url: '/livebets',
            views: {
                "main@admin": {
                    controller: 'sALiveBetsCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-livebets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Live Bets | ' + settings.Title
            }
        })
            .state('admin.fdlivebets', {
            url: '/fd-livebets',
            views: {
                "main@admin": {
                    controller: 'sAFDLiveBetsCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-fd-livebets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'FD Live Bets | ' + settings.Title
            }
        })
            .state('admin.account.history', {
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
            .state('admin.commentary', {
            url: '/commentary',
            views: {
                main: {
                    templateUrl: settings.ThemeName + '/admin/commentary/commentary-base.html'
                },
                "left@admin.commentary": {
                    controller: 'sASportTreeCtrl',
                    templateUrl: settings.ThemeName + '/admin/commentary/sa-sport-tree.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_COMMENTARY,
                title: 'Manage Commentary | ' + settings.Title
            }
        })
            .state('admin.commentary.sport', {
            url: '/sport/:nodetype/:id',
            views: {
                "left@admin.commentary": {
                    controller: 'sASportTreeCtrl',
                    templateUrl: settings.ThemeName + '/admin/commentary/sa-sport-tree.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('admin.commentary.sport.manage', {
            url: '/manage/:eventId/:eventName',
            views: {
                "center@admin.commentary": {
                    controller: 'addCommentaryCtrl',
                    templateUrl: settings.ThemeName + '/admin/commentary/add-commentary.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('admin.fullposition', {
            url: '/full-position/:marketid',
            views: {
                'main@admin': {
                    controller: 'sAFullPositionCtrl',
                    templateUrl: settings.ThemeName + '/admin/position/full-position.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_BET_BY_ID,
                title: 'Position | ' + settings.Title
            }
        })
            .state('admin.position', {
            url: '/position',
            views: {
                'main@admin': {
                    controller: 'sAPositionCtrl',
                    templateUrl: settings.ThemeName + '/admin/position/position.html',
                },
                'left@admin.position': {
                    controller: 'sAPositionTreeCtrl',
                    templateUrl: settings.ThemeName + '/admin/position/position-tree.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_BET_BY_ID,
                title: 'Position | ' + settings.Title
            }
        })
            .state('admin.position.sport', {
            url: '/sport/:nodetype/:id',
            views: {
                "left@admin.position": {
                    controller: 'sAPositionTreeCtrl',
                    templateUrl: settings.ThemeName + '/admin/position/position-tree.html'
                }
            }, ncyBreadcrumb: { skip: true }
        })
            .state('admin.settings', {
            url: '/settings',
            views: {
                'main@admin': {
                    controller: 'settingsCtrl',
                    templateUrl: settings.ThemeName + '/admin/settings/settings.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_SETTING,
                title: 'Common Settings | ' + settings.Title
            }
        })
            .state('admin.paymentnumbers', {
            url: '/payment-numbers',
            views: {
                'main@admin': {
                    controller: 'paymentNumbersCtrl',
                    templateUrl: settings.ThemeName + '/admin/settings/payment-numbers.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_PAYMENT_NUMBER,
                title: 'Common Payment Numbers | ' + settings.Title
            }
        })
            .state('admin.confimwithdrawal', {
            url: '/confirm-withdrawal',
            views: {
                main: {
                    controller: 'confirmWithdrawalCtrl',
                    templateUrl: settings.ThemeName + '/admin/settings/confirm-withdrawal.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.ADMIN_PAYTMWITHDRAWAL_MANAGE,
                title: 'Manage Confirm Withdrawal | ' + settings.Title
            }
        })
            .state('admin.banking', {
            url: '/banking',
            views: {
                'main@admin': {
                    controller: 'sABankingCtrl',
                    templateUrl: settings.ThemeName + '/admin/banking/sa-banking.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.DW,
                title: 'Manage Deposit/Withdrawal | ' + settings.Title
            }
        })
            .state('admin.banking.list', {
            url: '/list/:memberid',
            views: {
                'bankgrid@admin.banking': {
                    controller: 'sABankingListCtrl',
                    templateUrl: settings.ThemeName + '/admin/banking/sa-banking-list.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                memberid: { squash: true, value: null }
            },
            data: {
                role: permissionTypes.DW,
                title: 'Manage Deposit/Withdrawal of Member | ' + settings.Title
            }
        })
            .state('admin.btbets', {
            url: '/betfair-bets',
            views: {
                'main@admin': {
                    controller: 'betfairLiveBetsCtrl',
                    templateUrl: settings.ThemeName + '/admin/betfair/betfair-livebets.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_BETFAIR_BET,
                title: 'Betfair Live Bets | ' + settings.Title
            }
        })
            .state('admin.report', {
            url: '/report',
            views: {
                main: {
                    controller: 'sAReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/sa-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.ADMIN_MYREPORT,
                title: 'My Reports | ' + settings.Title
            }
        })
            .state('admin.report.downline', {
            url: '/downline/:memberid/:usertype',
            views: {
                'myreport@admin.report': {
                    controller: 'sADownlineReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/sa-downline-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                memberid: { squash: true, value: null },
                usertype: { squash: true, value: null },
            },
            data: {
                title: 'My reports by downline | ' + settings.Title
            }
        })
            .state('admin.report.downlinesummary', {
            url: '/downline-summary/:memberid/:usertype',
            views: {
                'myreport@admin.report': {
                    controller: 'sADownlineSummaryCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/sa-downline-summary.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                memberid: { squash: true, value: null },
                usertype: { squash: true, value: null },
            },
            data: {
                title: 'My reports by downline summary | ' + settings.Title
            }
        })
            .state('admin.report.market', {
            url: '/market',
            views: {
                'myreport@admin.report': {
                    controller: 'sAMarketReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/sa-market-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My reports by market | ' + settings.Title
            }
        })
            .state('admin.report.fdgame', {
            url: '/fd-game',
            views: {
                'myreport@admin.report': {
                    controller: 'sAFDGameReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/sa-fd-game-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My reports by fd games | ' + settings.Title
            }
        })
            .state('admin.report.adminfdgame', {
            url: '/admin-fd-game',
            views: {
                'myreport@admin.report': {
                    controller: 'sAAdminFDReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/sa-admin-fd-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Admin reports by fd games | ' + settings.Title
            }
        })
            .state('admin.betreport', {
            url: '/bets/:marketId/:userId',
            views: {
                main: {
                    controller: 'betListReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/bet-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                marketId: { squash: true, value: null },
                userId: { squash: true, value: null },
            },
            data: {
                title: 'List of bets by market | ' + settings.Title
            }
        })
            .state('admin.fdbetreport', {
            url: '/fd-bets/:roundId/:userId',
            views: {
                main: {
                    controller: 'fdBetListReportCtrl',
                    templateUrl: settings.ThemeName + '/admin/report/fd-bet-report.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                roundId: { squash: true, value: null },
                userId: { squash: true, value: null },
            },
            data: {
                title: 'List of bets by fd game | ' + settings.Title
            }
        })
            .state('admin.marketrule', {
            url: '/market-rules',
            views: {
                main: {
                    controller: 'marketRulesCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/market-rules.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_MARKETRULE,
                title: 'My Reports | ' + settings.Title
            }
        })
            .state('admin.currency', {
            url: '/currency',
            views: {
                main: {
                    controller: 'currencyCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/currency.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Currency | ' + settings.Title
            }
        })
            .state('admin.country', {
            url: '/country',
            views: {
                main: {
                    controller: 'countryCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/country.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Currency | ' + settings.Title
            }
        })
            .state('admin.inquiry', {
            url: '/inquiry',
            views: {
                main: {
                    controller: 'inquiryCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/inquiry.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Inquiry | ' + settings.Title
            }
        })
            .state('admin.liveusers', {
            url: '/liveusers',
            views: {
                main: {
                    controller: 'saLiveUsersCtrl',
                    templateUrl: settings.ThemeName + '/admin/user/sa-live-users.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_LOGIN_HISTORY_MEMBER,
                title: 'View live uers | ' + settings.Title
            }
        })
            .state('admin.casinobanking', {
            url: '/casino-banking',
            views: {
                'main@admin': {
                    controller: 'sACasinoBankingCtrl',
                    templateUrl: settings.ThemeName + '/admin/casino-banking/sa-casino-banking.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.DW,
                title: 'Manage Deposit/Withdrawal of Casino | ' + settings.Title
            }
        })
            .state('admin.casinobanking.list', {
            url: '/list/:memberid',
            views: {
                'bankgrid@admin.casinobanking': {
                    controller: 'sACasinoBankingListCtrl',
                    templateUrl: settings.ThemeName + '/admin/casino-banking/sa-casino-banking-list.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                memberid: { squash: true, value: null }
            },
            data: {
                role: permissionTypes.DW,
                title: 'Manage Deposit/Withdrawal of Casino | ' + settings.Title
            }
        })
            .state('admin.operators', {
            url: '/operators',
            views: {
                main: {
                    controller: 'operatorCtrl',
                    templateUrl: settings.ThemeName + '/admin/operator/operator.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_WEBSITE,
                title: 'Manage Operator | ' + settings.Title
            }
        })
            .state('admin.operatorcurrency', {
            url: '/operator-currency',
            views: {
                main: {
                    controller: 'operatorCurrencyCtrl',
                    templateUrl: settings.ThemeName + '/admin/operator/operator-currency.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Currency | ' + settings.Title
            }
        })
            .state('admin.systemlog', {
            url: '/system-log',
            views: {
                'main@admin': {
                    controller: 'systemLogCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/system-log.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_SETTING,
                title: 'System log | ' + settings.Title
            }
        })
            .state('admin.socketlist', {
            url: '/socket-list',
            views: {
                'main@admin': {
                    controller: 'socketListCtrl',
                    templateUrl: settings.ThemeName + '/admin/website/socket-list.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_SETTING,
                title: 'System log | ' + settings.Title
            }
        })
            .state('admin.importmarket', {
            url: '/import-markets/:eventId/:eventName',
            views: {
                'main@admin': {
                    controller: 'importMarketCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/import-market.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_MARKET,
                title: 'Import Markets | ' + settings.Title
            }
        })
            .state('admin.markettype', {
            url: '/market-type',
            views: {
                'main@admin': {
                    controller: 'marketTypeCtrl',
                    templateUrl: settings.ThemeName + '/admin/sport/market-type.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_SETTING,
                title: 'Market Type | ' + settings.Title
            }
        })
            .state('admin.lotusmember', {
            url: '/down-member/:memberid/:usertype',
            views: {
                'main@admin': {
                    controller: 'memberCtrl',
                    templateUrl: settings.ThemeName + '/admin/banking/sa-member.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members | ' + settings.Title
            }
        })
            .state('admin.lotusmember.profile', {
            url: '/profile',
            views: {
                content: {
                    controller: 'myProfileCtrl',
                    templateUrl: settings.ThemeName + '/home/account/myprofile.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members Profile | ' + settings.Title
            }
        })
            .state('admin.lotusmember.activity', {
            url: '/activity',
            views: {
                content: {
                    controller: 'activityCtrl',
                    templateUrl: settings.ThemeName + '/master/member/activity.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Members Activity | ' + settings.Title
            }
        })
            .state('admin.lotusmember.dashboard', {
            url: '/balance',
            views: {
                content: {
                    controller: 'masterDashboardCtrl',
                    templateUrl: settings.ThemeName + '/master/account/dashboard.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Members Balance | ' + settings.Title
            }
        })
            .state('admin.lotusmember.accountstatement', {
            url: '/account-statement',
            views: {
                content: {
                    controller: 'masterStatementCtrl',
                    templateUrl: settings.ThemeName + '/master/account/master-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members | ' + settings.Title
            }
        })
            .state('admin.lotusmember.bettingpl', {
            url: '/betting-pl',
            views: {
                content: {
                    controller: 'profitLossCtrl',
                    templateUrl: settings.ThemeName + '/master/member/betting-pl.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members | ' + settings.Title
            }
        })
            .state('admin.lotusmember.fdbettingpl', {
            url: '/fd-betting-pl',
            views: {
                content: {
                    controller: 'fdProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/master/member/fd-betting-pl.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members | ' + settings.Title
            }
        })
            .state('admin.lotusmember.clientstatement', {
            url: '/cstatement',
            views: {
                content: {
                    controller: 'accountStatementCtrl',
                    templateUrl: settings.ThemeName + '/master/member/client-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members | ' + settings.Title
            }
        })
            .state('admin.lotusmember.bonusstatement', {
            url: '/bstatement',
            views: {
                content: {
                    controller: 'bonusStatementCtrl',
                    templateUrl: settings.ThemeName + '/master/member/bonus-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Members | ' + settings.Title
            }
        })
            .state('admin.lotusmember.betlist', {
            url: '/bets-list',
            views: {
                content: {
                    controller: 'lotusBetListCtrl',
                    templateUrl: settings.ThemeName + '/master/myreport/lotus-bet-list.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Members Bets | ' + settings.Title
            }
        })
            .state('admin.lotusmember.fdbetlist', {
            url: '/fd-bets-list',
            views: {
                content: {
                    controller: 'lotusFDBetListCtrl',
                    templateUrl: settings.ThemeName + '/master/myreport/lotus-fd-bet-list.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Members Bets | ' + settings.Title
            }
        })
            .state('admin.lotusmember.transfer', {
            url: '/transfer',
            views: {
                content: {
                    controller: 'memberTransferCtrl',
                    templateUrl: settings.ThemeName + '/master/member/member-transfer.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Members Profit/Loss | ' + settings.Title
            }
        })
            .state('admin.lotusmember.loginhistory', {
            url: '/loginhistory',
            views: {
                content: {
                    controller: 'loginHistoryCtrl',
                    templateUrl: settings.ThemeName + '/home/account/login-history.html',
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_LOGIN_HISTORY_MEMBER,
                title: 'View Member Login History | ' + settings.Title
            }
        })
            .state('admin.symbols', {
            url: '/symbols',
            views: {
                main: {
                    controller: 'symbolCtrl',
                    templateUrl: settings.ThemeName + '/admin/symbol/symbol.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_RUNNER,
                title: 'Manage Symbols | ' + settings.Title
            }
        })
            .state('admin.fairxpayout', {
            url: '/fairx-payout',
            views: {
                main: {
                    controller: 'fairxPayoutCtrl',
                    templateUrl: settings.ThemeName + '/admin/settings/fairx-payout.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.MANAGE_FAIRXPAY_REQUEST,
                title: 'Manage FairX Payout Request | ' + settings.Title
            }
        })
            .state('admin.managefdexposure', {
            url: '/manage-fd-exposure',
            views: {
                main: {
                    controller: 'manageFDExposureCtrl',
                    templateUrl: settings.ThemeName + '/admin/settings/manage-fd-exposure.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Videos | ' + settings.Title
            }
        })
            .state('admin.managetoken', {
            url: '/manage-token',
            views: {
                main: {
                    controller: 'manageTokenCtrl',
                    templateUrl: settings.ThemeName + '/admin/crypto/manage-token.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Tokens | ' + settings.Title
            }
        })
            .state('admin.managewallet', {
            url: '/manage-wallets',
            views: {
                main: {
                    controller: 'manageWalletsCtrl',
                    templateUrl: settings.ThemeName + '/admin/crypto/manage-wallets.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Wallets | ' + settings.Title
            }
        })
            .state('admin.managewithdrawal', {
            url: '/manage-withdrawal',
            views: {
                main: {
                    controller: 'manageWithdrawalCtrl',
                    templateUrl: settings.ThemeName + '/admin/crypto/manage-withdrawal.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Crypto Withdrawals | ' + settings.Title
            }
        })
            .state('admin.manageoffers', {
            url: '/manage-offers',
            views: {
                main: {
                    controller: 'manageOffersCtrl',
                    templateUrl: settings.ThemeName + '/admin/offers/manage-offers.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Manage Offers | ' + settings.Title
            }
        })
            .state('admin.offerlog', {
            url: '/offer-log/:id',
            views: {
                main: {
                    controller: 'offerLogCtrl',
                    templateUrl: settings.ThemeName + '/admin/offers/offer-log.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Offer Log | ' + settings.Title
            }
        })
            .state('admin.account.b2csummary', {
            url: '/b2c-summary',
            views: {
                content: {
                    controller: 'sAB2CSummaryCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-b2c-summary.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'B2C Summary | ' + settings.Title
            }
        })
            .state('admin.b2ctransactions', {
            url: '/b2c-transactions/:searchId/:reporttype',
            views: {
                main: {
                    controller: 'sAB2CTransactionCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-b2c-transactions.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            params: {
                reporttype: { squash: true, value: null }
            },
            data: {
                title: 'B2C Transactions | ' + settings.Title
            }
        })
            .state('admin.account.paymorsummary', {
            url: '/paymor-summary',
            views: {
                content: {
                    controller: 'sAPaymorSummaryCtrl',
                    templateUrl: settings.ThemeName + '/admin/account/sa-paymor-summary.html'
                }
            },
            ncyBreadcrumb: { skip: true },
            data: {
                title: 'Paymor Gateway Summary | ' + settings.Title
            }
        });
    }]);
//# sourceMappingURL=module.js.map