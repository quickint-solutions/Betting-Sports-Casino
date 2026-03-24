angular.module('intranet.tradex', ['ui.router'])
    .config(['$urlRouterProvider', '$stateProvider',"$httpProvider", 'settings', 'permissionTypes',
        ($urlRouterProvider: ng.ui.IUrlRouterProvider, $stateProvider: ng.ui.IStateProvider, $httpProvider: ng.IHttpProvider,
            settings: intranet.common.IBaseSettings,
            permissionTypes: intranet.common.security.IPermissionTypes) => {
            $stateProvider
                .state('tradex', {
                    url: '/tradex',
                    views: {
                        main: {
                            controller: 'tradexHomeCtrl',
                            templateUrl: settings.ThemeName + '/home/tradex/home.html',
                        }
                    }, ncyBreadcrumb: { skip: true },
                    //data: {
                    //    role: permissionTypes.ADMIN_AREA,
                    //    title: 'Admin | ' + settings.Title
                    //},

                })
            
        }]);
