angular.module('intranet.mobile.account', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, settings, permissionTypes) => {
        $stateProvider
            .state('mobile.base.profile', {
            url: '/profile',
            views: {
                center: {
                    controller: 'mobileMyProfileCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/myprofile.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Profile | ' + settings.Title
            }
        })
            .state('mobile.base.accountstatement', {
            url: '/accountstatement',
            views: {
                center: {
                    controller: 'mobileAccountStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/account-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account Statements | ' + settings.Title
            }
        })
            .state('mobile.base.bonusstatement', {
            url: '/bonusstatement',
            views: {
                center: {
                    controller: 'bonusStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/bonus-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bonus Statements | ' + settings.Title
            }
        })
            .state('mobile.base.referralstatement', {
            url: '/referral-statement',
            views: {
                center: {
                    controller: 'referralStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/referral-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Referral Statements | ' + settings.Title
            }
        })
            .state('mobile.base.casinostatement', {
            url: '/casinostatement',
            views: {
                center: {
                    controller: 'mobileCasinoStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/casino-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account Statements | ' + settings.Title
            }
        })
            .state('mobile.base.currentbets', {
            url: '/currentbets',
            views: {
                center: {
                    controller: 'mobileCurrentBetCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/current-bet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Current Bets | ' + settings.Title
            }
        })
            .state('mobile.base.bethistory', {
            url: '/bethistory',
            views: {
                center: {
                    controller: 'mobileBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('mobile.base.fdbethistory', {
            url: '/fd-bethistory',
            views: {
                center: {
                    controller: 'mobileFDBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/fd-bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'FD Bet History | ' + settings.Title
            }
        })
            .state('mobile.base.profitloss', {
            url: '/profitloss',
            views: {
                center: {
                    controller: 'mobileProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Profit/Loss | ' + settings.Title
            }
        })
            .state('mobile.base.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                center: {
                    controller: 'mobileFDProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('mobile.base.loginhistory', {
            url: '/loginhistory',
            views: {
                center: {
                    controller: 'mobileLoginHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/login-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_LOGIN_HISTORY,
                title: 'My Login History | ' + settings.Title
            }
        })
            .state('mobile.base.wallet', {
            url: '/wallet',
            views: {
                center: {
                    controller: 'mobileMyWalletCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/mywallet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Wallet | ' + settings.Title
            }
        })
            .state('mobile.base.transferonline', {
            url: '/transfer-online/:tab',
            views: {
                center: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/payment-gateway.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                tab: { squash: true, value: null },
            },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'Deposit/Withdraw Money Online | ' + settings.Title
            }
        })
            .state('mobile.base.deposit', {
            url: '/deposit-online',
            views: {
                center: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/payment-deposit.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'Deposit Money Online | ' + settings.Title
            }
        })
            .state('mobile.base.withdrawal', {
            url: '/withdraw-online',
            views: {
                center: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/payment-withdraw.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'Withdraw Money Online | ' + settings.Title
            }
        })
            .state('mobile.base.depositcrypto', {
            url: '/deposit-crypto',
            views: {
                center: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/payment-deposit-crypto.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'Deposit Crypto Online | ' + settings.Title
            }
        })
            .state('mobile.base.passwordchange', {
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
            .state('mobile.base.bets', {
            url: '/bets',
            views: {
                center: {
                    controller: 'myBetsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/mybets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'Change Password | ' + settings.Title
            }
        })
            .state('mobile.base.bets.currentbets', {
            url: '/currentbets',
            views: {
                betsreport: {
                    controller: 'mobileCurrentBetCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/current-bet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Current Bets | ' + settings.Title
            }
        })
            .state('mobile.base.bets.bethistory', {
            url: '/bethistory',
            views: {
                betsreport: {
                    controller: 'mobileBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('mobile.base.bets.profitloss', {
            url: '/profitloss',
            views: {
                betsreport: {
                    controller: 'mobileProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Profitloss | ' + settings.Title
            }
        })
            .state('mobile.base.bets.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                betsreport: {
                    controller: 'mobileFDProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('mobile.seven.base.accountstatement', {
            url: '/accountstatement',
            views: {
                center: {
                    controller: 'mobileAccountStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/account-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account Statements | ' + settings.Title
            }
        })
            .state('mobile.seven.base.transferstatement', {
            url: '/transferstatement',
            views: {
                center: {
                    controller: 'mobileAccountStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/transfer-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Transfer Statements | ' + settings.Title
            }
        })
            .state('mobile.seven.base.bonusstatement', {
            url: '/bonusstatement',
            views: {
                center: {
                    controller: 'bonusStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/bonus-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bonus Statements | ' + settings.Title
            }
        })
            .state('mobile.seven.base.referralstatement', {
            url: '/referralstatement',
            views: {
                center: {
                    controller: 'referralStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/referral-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bonus Statements | ' + settings.Title
            }
        })
            .state('mobile.seven.base.casinostatement', {
            url: '/casinostatement',
            views: {
                center: {
                    controller: 'mobileCasinoStatementCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/casino-statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Account Statements | ' + settings.Title
            }
        })
            .state('mobile.seven.base.profitloss', {
            url: '/profitloss',
            views: {
                center: {
                    controller: 'mobileProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Profit/Loss | ' + settings.Title
            }
        })
            .state('mobile.seven.base.fdprofitloss', {
            url: '/fd-profitloss',
            views: {
                center: {
                    controller: 'mobileFDProfitLossCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/fd-profit-loss.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'FD Profit/Loss | ' + settings.Title
            }
        })
            .state('mobile.seven.base.wallet', {
            url: '/wallet',
            views: {
                center: {
                    controller: 'mobileMyWalletCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/mywallet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: 'My Wallet | ' + settings.Title
            }
        })
            .state('mobile.seven.base.mybets', {
            url: '/bets',
            views: {
                center: {
                    controller: 'myBetsCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/mybets.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_BET,
                title: 'My Bets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.mybets.currentbets', {
            url: '/currentbets',
            views: {
                betsreport: {
                    controller: 'mobileCurrentBetCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/current-bet.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Current Bets | ' + settings.Title
            }
        })
            .state('mobile.seven.base.mybets.bethistory', {
            url: '/bethistory',
            views: {
                betsreport: {
                    controller: 'mobileBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('mobile.seven.base.mybets.fdbethistory', {
            url: '/fd-bethistory',
            views: {
                betsreport: {
                    controller: 'mobileFDBetHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/fd-bet-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Bet History | ' + settings.Title
            }
        })
            .state('mobile.seven.base.profile', {
            url: '/profile',
            views: {
                center: {
                    controller: 'mobileMyProfileCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/myprofile.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'My Profile | ' + settings.Title
            }
        })
            .state('mobile.seven.base.loginhistory', {
            url: '/loginhistory',
            views: {
                center: {
                    controller: 'mobileLoginHistoryCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/login-history.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.VIEW_LOGIN_HISTORY,
                title: 'My Login History | ' + settings.Title
            }
        })
            .state('mobile.seven.base.transferonline', {
            url: '/transfer-online/:tab',
            views: {
                center: {
                    controller: 'paymentGatewayCtrl',
                    templateUrl: settings.ThemeName + '/mobile/account/payment-gateway.html'
                }
            }, ncyBreadcrumb: { skip: true },
            params: {
                tab: { squash: true, value: null },
            },
            data: {
                role: permissionTypes.VIEW_ACCOUNTING,
                title: 'Deposit/Withdraw Money Online | ' + settings.Title
            }
        });
    }]);
//# sourceMappingURL=module.js.map