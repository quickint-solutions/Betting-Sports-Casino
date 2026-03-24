module intranet.admin {
    export interface ISocketListScope extends intranet.common.IScopeBase {
        originalList: any[];
        filterList: any[];
        props: any[];
        search: any;
    }

    export class SocketListCtrl extends intranet.common.ControllerBase<ISocketListScope>
        implements common.init.ILoadInitialData {
        constructor($scope: ISocketListScope,
            protected $rootScope: any,
            private $filter: ng.IFilterService,
            private $timeout: any,
            private WSSocketService: any) {
            super($scope);

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
                        angular.forEach(Object.keys(this.$scope.originalList[0]), (p: any) => {
                            this.$scope.props.push({ name: p, search: '' });
                        });

                }
            });

            this.$scope.$on('$destroy', () => { wsListnerSockets(); });

            super.init(this);
        }

        public loadInitialData(): void {
            this.$timeout(() => {
                this.refreshSocket();
            }, 2000);
        }

        private refreshSocket(): void {
            this.WSSocketService.sendMessage({ messageType: common.enums.WSMessageType.ListSocket });
        }

        private searchChanged(): void {
            this.$scope.filterList.splice(0);
            angular.forEach(this.$scope.originalList, (ol: any) => {
                var isvalid = true;
                angular.forEach(this.$scope.props, (p: any) => {
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
                if (isvalid) { this.$scope.filterList.push(ol); }
            });
        }
    }

    angular.module('intranet.admin').controller('socketListCtrl', SocketListCtrl);
}