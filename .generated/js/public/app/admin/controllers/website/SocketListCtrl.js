var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SocketListCtrl extends intranet.common.ControllerBase {
            constructor($scope, $rootScope, $filter, $timeout, WSSocketService) {
                super($scope);
                this.$rootScope = $rootScope;
                this.$filter = $filter;
                this.$timeout = $timeout;
                this.WSSocketService = WSSocketService;
                this.$scope.originalList = [];
                this.$scope.filterList = [];
                this.$scope.props = [];
                this.$scope.search = {};
                var wsListnerSockets = this.$rootScope.$on("ws-listsocket-changed", (event, response) => {
                    if (response.success) {
                        this.$scope.originalList = response.data;
                        angular.copy(response.data, this.$scope.filterList);
                        this.$scope.props = [];
                        if (this.$scope.originalList.length > 0)
                            angular.forEach(Object.keys(this.$scope.originalList[0]), (p) => {
                                this.$scope.props.push({ name: p, search: '' });
                            });
                    }
                });
                this.$scope.$on('$destroy', () => { wsListnerSockets(); });
                super.init(this);
            }
            loadInitialData() {
                this.$timeout(() => {
                    this.refreshSocket();
                }, 2000);
            }
            refreshSocket() {
                this.WSSocketService.sendMessage({ messageType: intranet.common.enums.WSMessageType.ListSocket });
            }
            searchChanged() {
                this.$scope.filterList.splice(0);
                angular.forEach(this.$scope.originalList, (ol) => {
                    var isvalid = true;
                    angular.forEach(this.$scope.props, (p) => {
                        if (p.search && p.search.length > 0) {
                            if (angular.isNumber(ol[p.name])) {
                                if (p.search != ol[p.name].toString()) {
                                    isvalid = false;
                                }
                            }
                            else if (!isNaN(Date.parse(ol[p.name]))) {
                                if (this.$filter('date')(ol[p.name], 'dd-MM-yyyy HH:mm:ss').toString().indexOf(p.search) < 0) {
                                    isvalid = false;
                                }
                            }
                            else if (ol[p.name].toString().indexOf(p.search) < 0) {
                                isvalid = false;
                            }
                        }
                    });
                    if (isvalid) {
                        this.$scope.filterList.push(ol);
                    }
                });
            }
        }
        admin.SocketListCtrl = SocketListCtrl;
        angular.module('intranet.admin').controller('socketListCtrl', SocketListCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SocketListCtrl.js.map