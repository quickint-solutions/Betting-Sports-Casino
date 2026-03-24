angular.module('intranet.master', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider: ng.ui.IUrlRouterProvider, $stateProvider: ng.ui.IStateProvider,
            settings: intranet.common.IBaseSettings,
            permissionTypes: intranet.common.security.IPermissionTypes) => {
            $stateProvider
                .state('master', {
                    url: '/master',
                    views: {
                        main: {
                            controller: 'masterCtrl',
                            templateUrl: settings.ThemeName + '/master/master.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.MASTER_AREA,
                        title: 'Welcome to Master Area of ' + settings.Title,
                        can_access: settings.WebSiteIdealFor == 1 || settings.WebSiteIdealFor == 3
                    }
                })
                .state('positionviewer', {
                    url: '/position-viewer/:marketid/:bettingtype/:runner/:name',
                    views: {
                        'main': {
                            controller: 'positionViewerCtrl',
                            templateUrl: settings.ThemeName + '/master/position/position-viewer.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: settings.Title
                    }
                })
                .state('master.dashboard', {
                    url: '/dashboard',
                    views: {
                        'main@master': {
                            controller: 'masterDashboardCtrl',
                            templateUrl: settings.ThemeName + '/master/account/dashboard.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Balance overview | ' + settings.Title
                    }
                })
                .state('master.memberlist', {
                    url: '/members/:memberid/:userid',
                    views: {
                        'main@master': {
                            controller: 'downlineCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/downline.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        memberid: { squash: true, value: null },
                        userid: { squash: true, value: null },
                    },
                    data: {
                        title: 'Manage Downline Members | ' + settings.Title
                    }
                })
                .state('master.betlist', {
                    url: '/betlist',
                    views: {
                        'main@master': {
                            controller: 'betHistoryCtrl',
                            templateUrl: settings.ThemeName + '/home/account/bet-history.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Bets | ' + settings.Title
                    }
                })
                .state('master.downlinereport', {
                    url: '/agent-report/:memberid/:usertype',
                    views: {
                        'main@master': {
                            controller: 'downlineReportCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/downline-report.html'
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
                .state('master.downlinesummary', {
                    url: '/agent-summary/:memberid/:usertype',
                    views: {
                        'main@master': {
                            controller: 'downlineSummaryCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/downline-summary.html'
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
                .state('master.marketreport', {
                    url: '/market-report',
                    views: {
                        'main@master': {
                            controller: 'marketReportCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/market-report.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My reports by market | ' + settings.Title
                    }
                })
                .state('master.fdgamereport', {
                    url: '/fd-game-report',
                    views: {
                        'main@master': {
                            controller: 'fdGameReportCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/fd-game-report.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'FD reports by game | ' + settings.Title
                    }
                })
                .state('master.livebets', {
                    url: '/livebets',
                    views: {
                        'main@master': {
                            controller: 'liveBetsCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/livebets.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.LIVE_BETS,
                        title: 'View Live Bets | ' + settings.Title
                    }
                })
                .state('master.fdlivebets', {
                    url: '/fd-livebets',
                    views: {
                        'main@master': {
                            controller: 'fDLiveBetsCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/fd-live-bets.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.LIVE_BETS,
                        title: 'View FD Live Bets | ' + settings.Title
                    }
                })
                .state('master.banking', {
                    url: '/banking/:memberid/:userid',
                    views: {
                        'main@master': {
                            controller: 'bankingCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/banking.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        memberid: { squash: true, value: null },
                    },
                    data: {
                        role: permissionTypes.DW,
                        title: 'Manage Deposit/Withdrawal | ' + settings.Title
                    }
                })
                .state('master.casinobanking', {
                    url: '/casino-banking',
                    views: {
                        'main@master': {
                            controller: 'casinoBankingCtrl',
                            templateUrl: settings.ThemeName + '/master/casino-banking/casino-banking.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.DW,
                        title: 'Manage Deposit/Withdrawal of Casino | ' + settings.Title
                    }
                })
                .state('master.liveusers', {
                    url: '/liveusers',
                    views: {
                        'main@master': {
                            controller: 'liveUsersCtrl',
                            templateUrl: settings.ThemeName + '/master/account/live-users.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.VIEW_LOGIN_HISTORY_MEMBER,
                        title: 'View live users | ' + settings.Title
                    }
                })
                .state('master.member', {
                    url: '/member/:memberid',
                    views: {
                        'main@master': {
                            controller: 'memberCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/member.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Members | ' + settings.Title
                    }
                })
                .state('master.member.profile', {
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

                .state('master.member.bethistory', {
                    url: '/bethistory',
                    views: {
                        content: {
                            controller: 'betHistoryCtrl',
                            templateUrl: settings.ThemeName + '/home/account/bet-history.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.VIEW_BET_BY_ID,
                        title: 'View Member Bet History | ' + settings.Title
                    }
                })
                .state('master.member.profitloss', {
                    url: '/profitloss',
                    views: {
                        content: {
                            controller: 'profitLossCtrl',
                            templateUrl: settings.ThemeName + '/home/account/profit-loss.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.VIEW_BET_BY_ID,
                        title: 'View Member Profit/Loss | ' + settings.Title
                    }
                })

                .state('master.lotusstatement', {
                    url: '/statement',
                    views: {
                        'main@master': {
                            controller: 'masterStatementCtrl',
                            templateUrl: settings.ThemeName + '/master/account/master-statement.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Account Statement | ' + settings.Title
                    }
                })
                .state('master.lotustransferstatement', {
                    url: '/transfer-statement',
                    views: {
                        'main@master': {
                            controller: 'memberTransferCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/master-transfer.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Transfer Statement | ' + settings.Title
                    }
                })
                .state('master.lotusmember', {
                    url: '/down-member/:memberid/:usertype',
                    views: {
                        'main@master': {
                            controller: 'memberCtrl',
                            templateUrl: settings.ThemeName + '/master/member/member.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Members | ' + settings.Title
                    }
                })
                .state('master.lotusmember.activity', {
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
                .state('master.lotusmember.dashboard', {
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
                .state('master.lotusmember.accountstatement', {
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
                .state('master.lotusmember.bettingpl', {
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
                .state('master.lotusmember.fdbettingpl', {
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
                .state('master.lotusmember.clientstatement', {
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
                .state('master.lotusmember.bonusstatement', {
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
                .state('master.lotusmember.referralstatement', {
                    url: '/referralstatement',
                    views: {
                        content: {
                            controller: 'referralStatementCtrl',
                            templateUrl: settings.ThemeName + '/master/member/referral-statement.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Members | ' + settings.Title
                    }
                })
                .state('master.lotusmember.betlist', {
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
                .state('master.lotusmember.fdbetlist', {
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

                .state('master.lotusmember.transfer', {
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
                .state('master.lotusmember.loginhistory', {
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
                .state('master.lotusmember.exposure', {
                    url: '/exposure',
                    views: {
                        content: {
                            controller: 'netExposureCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/net-exposure.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Member Net Exposure | ' + settings.Title
                    }
                })
                .state('master.lotusmember.exposuredetail', {
                    url: '/exposure-detail/:marketid',
                    views: {
                        'main@master': {
                            controller: 'exposureDetailCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/exposure-detail.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Full detail of net exposure | ' + settings.Title
                    }
                })
                .state('master.lotusmember.livegameexposuredetail', {
                    url: '/livegame-exposure-detail/:eventid',
                    views: {
                        'main@master': {
                            controller: 'liveGameExposureDetailCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/livegame-exposure-detail.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Full detail of live games exposure | ' + settings.Title
                    }
                })
                .state('master.account', {
                    url: '/myaccount',
                    views: {
                        'main@master': {
                            controller: 'masterMyAccountCtrl',
                            templateUrl: settings.ThemeName + '/master/account/myaccount.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Account | ' + settings.Title
                    }
                })
                .state('master.account.profile', {
                    url: '/profile',
                    views: {
                        content: {
                            controller: 'myProfileCtrl',
                            templateUrl: settings.ThemeName + '/master/account/myprofile.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Profile | ' + settings.Title
                    }
                })
                //.state('master.accountprofile', {
                //    url: '/profile',
                //    views: {
                //        'main@master': {
                //            controller: 'myProfileCtrl',
                //            templateUrl: settings.ThemeName + '/home/account/myprofile.html'
                //        }
                //    }, ncyBreadcrumb: { skip: true },
                //    data: {
                //        title: 'My Profile | ' + settings.Title
                //    }
                //})
                .state('master.account.statement', {
                    url: '/statement',
                    views: {
                        content: {
                            controller: 'accountStatementCtrl',
                            templateUrl: settings.ThemeName + '/home/account/account-statement.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Account Statement | ' + settings.Title
                    }
                })
                .state('master.account.casinostatement', {
                    url: '/casino-statement',
                    views: {
                        content: {
                            controller: 'casinoStatementCtrl',
                            templateUrl: settings.ThemeName + '/home/account/casino-statement.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Casino Statement | ' + settings.Title
                    }
                })
                .state('master.account.loginhistory', {
                    url: '/loginhistory',
                    views: {
                        content: {
                            controller: 'loginHistoryCtrl',
                            templateUrl: settings.ThemeName + '/home/account/login-history.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Login History | ' + settings.Title
                    }
                }).state('master.loginhistory', {
                    url: '/loginhistory',
                    views: {
                        'main@master': {
                            controller: 'loginHistoryCtrl',
                            templateUrl: settings.ThemeName + '/home/account/login-history.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'My Login History | ' + settings.Title
                    }
                })
                .state('master.exposure', {
                    url: '/exposure',
                    views: {
                        'main@master': {
                            controller: 'netExposureCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/net-exposure.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Net Exposure | ' + settings.Title
                    }
                })
                .state('master.betsbymarket', {
                    url: '/exposure-bets/:marketId/:marketname/:memberid',
                    views: {
                        'main@master': {
                            controller: 'liveBetByMarketCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/live-bets-by-market.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        marketname: { squash: true, value: null },
                        memberid: { squash: true, value: null },
                    },
                    data: {
                        title: 'Live bets | ' + settings.Title
                    }
                })
                .state('master.exposuredetail', {
                    url: '/exposure-detail/:marketid',
                    views: {
                        'main@master': {
                            controller: 'exposureDetailCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/exposure-detail.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Full detail of net exposure | ' + settings.Title
                    }
                })
                .state('master.livegameexposuredetail', {
                    url: '/livegame-exposure-detail/:eventid',
                    views: {
                        'main@master': {
                            controller: 'liveGameExposureDetailCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/livegame-exposure-detail.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Full detail of live games exposure | ' + settings.Title
                    }
                })
                .state('master.managesport', {
                    url: '/managesport',
                    views: {
                        'main@master': {
                            controller: 'manageSportCtrl',
                            templateUrl: settings.ThemeName + '/master/manage-sport/manage-sport.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Sports | ' + settings.Title
                    }
                })
                .state('master.betreport', {
                    url: '/bets/:marketId/:userId',
                    views: {
                        'main@master': {
                            controller: 'betListReportCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/bet-report.html'
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
                .state('master.fdbetreport', {
                    url: '/fd-bets/:roundId/:userId',
                    views: {
                        'main@master': {
                            controller: 'fdBetListReportCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/fd-bet-report.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        roundId: { squash: true, value: null },
                        userId: { squash: true, value: null },
                    },
                    data: {
                        title: 'List of bets by FD Game | ' + settings.Title
                    }
                })
                .state('master.lotusbetlist', {
                    url: '/bets-list',
                    views: {
                        'main@master': {
                            controller: 'lotusBetListCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/lotus-bet-list.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'List of bets | ' + settings.Title
                    }
                })
                .state('master.lotusfdbetlist', {
                    url: '/fd-bets-list',
                    views: {
                        'main@master': {
                            controller: 'lotusFDBetListCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/lotus-fd-bet-list.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'List of bets | ' + settings.Title
                    }
                })
                .state('master.addmember', {
                    url: '/add-member/:parentid',
                    views: {
                        'main@master': {
                            controller: 'addMemberCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/add-member.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Add Member | ' + settings.Title
                    }
                })
                .state('master.ptlist', {
                    url: '/manage-pt/:memberid/:userid',
                    views: {
                        'main@master': {
                            controller: 'pTListingCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/pt-listing.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        memberid: { squash: true, value: null },
                        userid: { squash: true, value: null },
                    },
                    data: {
                        title: 'Manage Downline PT | ' + settings.Title
                    }
                })
                .state('master.notify', {
                    url: '/notification',
                    views: {
                        'main@master': {
                            controller: 'notifyChildCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/notify-child.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Send notification to child | ' + settings.Title
                    }
                })
                .state('master.bficbanking', {
                    url: '/bfic-banking/:tab',
                    views: {
                        'main@master': {
                            controller: 'bficBankingCtrl',
                            templateUrl: settings.ThemeName + '/master/banking/bfic-banking.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        tab: { squash: true, value: null },
                    },
                    data: {
                        title: 'BFIC transactions | ' + settings.Title
                    }
                })
                .state('master.offlinebanking', {
                    url: '/banking-setup/:tab',
                    views: {
                        'main@master': {
                            controller: 'offlineBankingCtrl',
                            templateUrl: settings.ThemeName + '/master/banking/offline-banking.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        tab: { squash: true, value: null },
                    },
                    data: {
                        title: 'Setup banking detail | ' + settings.Title
                    }
                })
                .state('master.eventmgmt', {
                    url: '/event-management',
                    views: {
                        'main@master': {
                            controller: 'eventMgmtCtrl',
                            templateUrl: settings.ThemeName + '/master/exposure/event-mgmt.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Events | ' + settings.Title
                    }
                })
                .state('master.adminusers', {
                    url: '/user-listing',
                    views: {
                        'main@master': {
                            controller: 'cPUsersCtrl',
                            templateUrl: settings.ThemeName + '/master/cp-users/cp-users.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Admin Users | ' + settings.Title
                    }
                })
                .state('master.addadminuser', {
                    url: '/add-admin-user',
                    views: {
                        'main@master': {
                            controller: 'addCPUserCtrl',
                            templateUrl: settings.ThemeName + '/master/cp-users/add-cp-user.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Add Admin User | ' + settings.Title
                    }
                })
                .state('master.fairxpayout', {
                    url: '/fairx-payout',
                    views: {
                        'main@master': {
                            controller: 'fairxPayoutCtrl',
                            templateUrl: settings.ThemeName + '/master/downline/fairx-payout.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.MANAGE_FAIRXPAY_REQUEST,
                        title: 'Manage FairX Payout Request | ' + settings.Title
                    }
                })
                .state('master.fullposition', {
                    url: '/full-position/:eventid/:marketid',
                    views: {
                        'main@master': {
                            controller: 'fullPositionCtrl',
                            templateUrl: settings.ThemeName + '/master/position/full-position.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.VIEW_BET_BY_ID,
                        title: 'Position | ' + settings.Title
                    }
                })
                .state('master.position', {
                    url: '/position',
                    views: {
                        'main@master': {
                            controller: 'positionCtrl',
                            templateUrl: settings.ThemeName + '/master/position/position.html',
                        },
                        'left@master.position': {
                            controller: 'positionTreeCtrl',
                            templateUrl: settings.ThemeName + '/master/position/position-tree.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        role: permissionTypes.VIEW_BET_BY_ID,
                        title: 'Position | ' + settings.Title
                    }
                })
                .state('master.position.sport', {
                    url: '/sport/:nodetype/:id',
                    views: {
                        "left@master.position": {
                            controller: 'positionTreeCtrl',
                            templateUrl: settings.ThemeName + '/master/position/position-tree.html'
                        }
                    }, ncyBreadcrumb: { skip: true }
                })
                .state('master.b2csummary', {
                    url: '/b2c-summary',
                    views: {
                        'main@master': {
                            controller: 'b2CSummaryCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/b2c-summary.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'B2C Summary | ' + settings.Title
                    }
                })
                .state('master.b2ctransactions', {
                    url: '/b2c-transactions/:searchId/:reporttype',
                    views: {
                        'main@master': {
                            controller: 'b2CTransactionCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/b2c-transactions.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        reporttype: { squash: true, value: null }
                    },
                    data: {
                        title: 'B2C Transactions | ' + settings.Title
                    }
                })
                .state('master.manageoffers', {
                    url: '/manage-offers',
                    views: {
                        'main@master': {
                            controller: 'manageAgentOffersCtrl',
                            templateUrl: settings.ThemeName + '/master/offers/manage-offers.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Offers | ' + settings.Title
                    }
                })
                .state('master.offerlog', {
                    url: '/offer-log/:id',
                    views: {
                        'main@master': {
                            controller: 'agentOfferLogCtrl',
                            templateUrl: settings.ThemeName + '/master/offers/offer-log.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Offer log | ' + settings.Title
                    }
                })
                .state('master.managebanners', {
                    url: '/manage-banners',
                    views: {
                        'main@master': {
                            controller: 'manageAgentBannersCtrl',
                            templateUrl: settings.ThemeName + '/master/banners/manage-banners.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    data: {
                        title: 'Manage Banners | ' + settings.Title
                    }
                })
                .state('master.b2cactivity', {
                    url: '/b2c-activity/:tab',
                    views: {
                        'main@master': {
                            controller: 'b2CActivityCtrl',
                            templateUrl: settings.ThemeName + '/master/myreport/b2c-activity.html'
                        }
                    }, ncyBreadcrumb: { skip: true },
                    params: {
                        tab: { squash: true, value: null },
                    },
                    data: {
                        title: settings.Title
                    }
                })
        }]);