var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTTreeViewController extends common.ControllerBase {
                constructor($scope, $filter, promiseTracker, $timeout) {
                    super($scope);
                    this.$filter = $filter;
                    this.promiseTracker = promiseTracker;
                    this.$timeout = $timeout;
                    super.init(this);
                    $scope.$on('refreshTree', (event, args) => {
                        if (args.treename && args.treename == this.$scope.treeName) {
                            this.loadInitialData();
                        }
                    });
                }
                initScopeValues() {
                    this.$scope.serachText = null;
                }
                loadInitialData() {
                    if (this.$scope.intialData) {
                        this.$scope.list = this.$scope.intialData;
                    }
                    else if (this.$scope.intialDataService) {
                        var promise = this.$scope.intialDataService();
                        if (promise) {
                            promise.success((resposne) => {
                                this.$scope.list = resposne.data;
                                this.loadDataCompleted();
                            });
                        }
                    }
                }
                searchByText(_serachText) {
                    if (_serachText == '' || _serachText == null) {
                        this.loadInitialData();
                    }
                    else {
                        if (this.$scope.searchService) {
                            var promise = this.$scope.searchService({ serachText: _serachText });
                            if (promise) {
                                promise.success((resposne) => {
                                    this.$scope.list = resposne.data;
                                    this.loadDataCompleted();
                                });
                            }
                        }
                    }
                }
                loadDataCompleted() {
                    if (this.$scope.intialDataLoaded) {
                        this.$scope.intialDataLoaded();
                    }
                }
                changeChildren(item) {
                    if (item && !item.loaded && item.hasChildren) {
                        this.stateChange(item, false);
                    }
                }
                changeParent(parentScope) {
                }
                animateTree(id) {
                    var abc = '#' + 'tr_' + this.$scope.treeName + '_' + id;
                    if ($(abc).is(':visible')) {
                        $(abc).slideUp('5000');
                    }
                    else {
                        $(abc).fadeIn('5000');
                    }
                }
                stateChange(item, animation_needed = true) {
                    if (animation_needed) {
                        this.animateTree(item.id);
                    }
                    if (this.$scope.treeService && item && !item.loaded && item.nextService) {
                        item.isLoading = true;
                        var promise = this.$scope.treeService({ servicename: item.nextService, parentid: item.id });
                        if (promise) {
                            promise.success((resposne) => {
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
                actionClicked(item) {
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
                    compile: (elem, attr) => {
                        return {
                            pre: (scope, elem, attrs) => {
                            }
                        };
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=tree-view-controller.js.map