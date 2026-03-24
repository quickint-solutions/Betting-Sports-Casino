module intranet.common.directives {

    class KTTreeViewController extends common.ControllerBase<IKTTreeViewScope> {
        constructor($scope: IKTTreeViewScope,
            private $filter: any,
            private promiseTracker: any,
            private $timeout: ng.ITimeoutService) {

            super($scope);
            super.init(this);

            $scope.$on('refreshTree', (event,args) => {
                if (args.treename && args.treename == this.$scope.treeName) {
                    this.loadInitialData();
                }
            });
        }

        /// initScopeValues is responsible for initializing scope variables
        public initScopeValues(): void {
            this.$scope.serachText = null;
        }

        // loadInitialData is used to load intial data
        private loadInitialData(): void {
            if (this.$scope.intialData) {
                this.$scope.list = this.$scope.intialData;
            }
            else if (this.$scope.intialDataService) {
                var promise = this.$scope.intialDataService();
                if (promise) {
                    promise.success((resposne: any) => {
                        this.$scope.list = resposne.data;
                        this.loadDataCompleted();
                    });
                }
            }
        }

        /// searchByText is responsible for making api call as per search text and bind updated tree
        private searchByText(_serachText: any) {

            if (_serachText == '' || _serachText == null) {
                this.loadInitialData();
            }
            else {
                if (this.$scope.searchService) {
                    var promise = this.$scope.searchService({ serachText: _serachText });
                    if (promise) {
                        promise.success((resposne: any) => {
                            this.$scope.list = resposne.data;
                            this.loadDataCompleted();
                        });
                    }
                }
            }
        }


        // loadDataCompleted is used to notify that initial data loading complete
        private loadDataCompleted(): void {
            if (this.$scope.intialDataLoaded) {
                this.$scope.intialDataLoaded();
            }
        }

        // changeChildren is used to load child data in background and also apply check/uncheck property to all childs
        private changeChildren(item: any): void {
            if (item && !item.loaded && item.hasChildren) {
                this.stateChange(item, false);
            }
        }

        // changeParent is used to apply check/upcheck property to parent nodes
        private changeParent(parentScope) {
        }

        // animateTree is used to apply animation while opening/closing node
        private animateTree(id: any): void {
            var abc = '#' + 'tr_' + this.$scope.treeName + '_' + id;
            if ($(abc).is(':visible')) {
                $(abc).slideUp('5000');
            }
            else {
                $(abc).fadeIn('5000');
            }
        }

        // stateChange is used to load child nodes from API also opening the current node
        private stateChange(item: any, animation_needed: boolean = true): void {
            if (animation_needed) {
                this.animateTree(item.id);
            }

            if (this.$scope.treeService && item && !item.loaded && item.nextService) {
                item.isLoading = true;
                var promise = this.$scope.treeService({ servicename: item.nextService, parentid: item.id });
                if (promise) {
                    promise.success((resposne: any) => {
                        if (resposne.data.length > 0) {
                            item.childrens = resposne.data;
                            item.loaded = true;
                        }
                        else {
                            item.hasChildren = false;
                        }
                        this.$timeout(() => { item.isLoading = false; }, 500);
                    });
                }
            }
        }

        private actionClicked(item: any): void {
            if (this.$scope.actionCallback) {
                this.$scope.actionCallback({ item: item });
            }
        }
    }

    angular.module('kt.components').controller('KTTreeViewController', KTTreeViewController);

    angular.module('kt.components')
        .directive('ktTreeView', () => {
            return {
                transclude: true,
                templateUrl: 'app/common/components/tree-view/tree-view.html',
                controller: 'KTTreeViewController',
                scope: {
                    intialData: '=?',
                    treeService: '&?',
                    intialDataService: '&?',
                    intialDataLoaded: '&?',
                    searchRequired: '@?',
                    searchService: '&?',
                    btnTitle: '@?',
                    actionCallback: '&?',
                    btnIcon: '@?',
                    btnClass: '@?',
                    treeName: '@?'
                },
                restrict: 'E',
                replace: true,
                compile: (elem, attr: any) => {
                    return {
                        pre: (scope, elem, attrs) => {
                        }
                    };
                }
            };
        });
}