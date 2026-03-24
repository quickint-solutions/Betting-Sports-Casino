angular.module('intranet.help', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, settings, permissionTypes) => {
        $stateProvider
            .state('help', {
            url: '/help/:user',
            views: {
                main: {
                    controller: 'baseHelpCtrl',
                    templateUrl: settings.ThemeName + '/help/help-base.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: settings.Title
            }
        })
            .state('help.agency_management', {
            url: '/agency_management',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/agency_management.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.creating_agency_user', {
            url: '/creating_agency_user',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/creating_agency_user.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.unlocking_account', {
            url: '/unlocking_account',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/unlocking_account.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.changing_agency_status', {
            url: '/changing_agency_status',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/changing_agency_status.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.closing_agency_user', {
            url: '/closing_agency_user',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/closing_agency_user.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.changing_credit_limit', {
            url: '/changing_credit_limit',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/changing_credit_limit.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.position_taking', {
            url: '/position_taking',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/position_taking.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.pt_management', {
            url: '/pt_management',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/pt_management.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.viewing_downline_summary', {
            url: '/viewing_downline_summary',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/viewing_downline_summary.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.risk_management', {
            url: '/risk_management',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/risk_management.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.net_exposure', {
            url: '/net_exposure',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/net_exposure.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.bet_ticker', {
            url: '/bet_ticker',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/bet_ticker.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.transfer', {
            url: '/transfer',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/transfer.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.undo_transfer', {
            url: '/undo_transfer',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/undo_transfer.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.reports', {
            url: '/reports',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/reports.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.profit_and_loss_by_market', {
            url: '/profit_and_loss_by_market',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/profit_and_loss_by_market.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.profit_and_loss_by_agent', {
            url: '/profit_and_loss_by_agent',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/profit_and_loss_by_agent.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.bet_list', {
            url: '/bet_list',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/bet_list.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.account_statement', {
            url: '/account_statement',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/account_statement.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.user_management', {
            url: '/user_management',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/user_management.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.creating_user', {
            url: '/creating_user',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/creating_user.html'
                }
            }, ncyBreadcrumb: { skip: true },
        })
            .state('help.setting_up_access_rights', {
            url: '/setting_up_access_rights',
            views: {
                'help-right': {
                    templateUrl: settings.ThemeName + '/help/setting_up_access_rights.html'
                }
            }, ncyBreadcrumb: { skip: true },
        });
    }]);
//# sourceMappingURL=module.js.map