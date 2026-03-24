angular.module('intranet.tradex', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', "$httpProvider", 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, $httpProvider, settings, permissionTypes) => {
        $stateProvider
            .state('tradex', {
            url: '/tradex',
            views: {
                main: {
                    controller: 'tradexHomeCtrl',
                    templateUrl: settings.ThemeName + '/home/tradex/home.html',
                }
            }, ncyBreadcrumb: { skip: true },
        });
    }]);
//# sourceMappingURL=module.js.map