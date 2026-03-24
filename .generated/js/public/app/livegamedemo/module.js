angular.module('intranet.livegamedemo', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider, $stateProvider, settings, permissionTypes) => {
        $stateProvider
            .state('lgapidemo', {
            url: '/lgapidemo',
            views: {
                main: {
                    controller: 'liveGameDemoCtrl',
                    templateUrl: settings.ThemeName + '/livegamedemo/live-game-demo.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                role: permissionTypes.CLIENT_AREA,
                title: settings.Title
            }
        })
            .state('videoframe', {
            url: '/video-frame',
            views: {
                main: {
                    controller: 'videoFrameCtrl',
                    templateUrl: settings.ThemeName + '/livegamedemo/video-frame.html'
                }
            }, ncyBreadcrumb: { skip: true },
            data: {
                title: ''
            }
        });
    }]);
//# sourceMappingURL=module.js.map