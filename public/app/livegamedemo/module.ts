angular.module('intranet.livegamedemo', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider', 'settings', 'permissionTypes',
        ($urlRouterProvider: ng.ui.IUrlRouterProvider, $stateProvider: ng.ui.IStateProvider,
            settings: intranet.common.IBaseSettings,
            permissionTypes: intranet.common.security.IPermissionTypes) => {
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
                })
               
        }]);