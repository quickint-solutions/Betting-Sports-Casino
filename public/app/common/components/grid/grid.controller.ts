namespace intranet.common.directives {
    class KTGridController extends intranet.common.ControllerBase<IKTGrid> {
        private sortingCacheKey: string = 'sorting';
        private currentPageCacheKey: string = 'currentPage';

        /* @ngInject */
        constructor($scope: IKTGrid,
            ngTableParams: any,
            private $state: ng.ui.IStateService,
            private modalService: intranet.common.services.ModalService,
            private commonDataService: common.services.CommonDataService,
            private fileService: common.services.FileService,
            private settings: common.IBaseSettings,
            private $window: any,
            private localStorageHelper: intranet.common.helpers.LocalStorageHelper,
            private localCacheHelper: intranet.common.helpers.LocalCacheHelper) {
            super($scope);

            var currentUserType = -1;
            var userresult = this.commonDataService.getLoggedInUserData();
            if (userresult) {
                currentUserType = userresult.userType;
            }


            this.$scope.spinnerImg = this.commonDataService.spinnerImg;

            this.$scope.showEmptyMsg = true;
            //if (this.settings.ThemeName == 'lotus') {
            //    this.$scope.showEmptyMsg = false;
            //}

            if (!this.$scope.emptyMsg) {
                this.$scope.emptyMsg = 'No records found for selected filter and time period.';
            }

            if (!this.$scope.totalRowMsg) {
                this.$scope.totalRowMsg = 'grid.totalrows';
            }

            if (!angular.isDefined($scope.canILoad)) {
                $scope.canILoad = true;
            } else {
                $scope.$watch('canILoad', (newItem, oldItem) => {
                    if (newItem && !oldItem) {
                        //reload grid
                        this.refreshGrid(null);
                    }
                });
            }

            var cachedPage = this.getFromCache(this.currentPageCacheKey);
            var cachedSorting = this.getFromCache(this.sortingCacheKey);
            var initialTime = true;
            $scope.tableParams = new ngTableParams(
                {
                    //page: 1,
                    page: cachedPage ? cachedPage : 1,
                    count: $scope.pageSize > 0 ? $scope.pageSize : 50,
                    sorting: cachedSorting ? cachedSorting : {},
                    filter: {},
                },
                {
                    total: 0,
                    getData: ($defer, params) => {
                        if ($scope.canILoad) {
                            this.$scope.page = this.$scope.tableParams.page();
                            this.$scope.pageSize = this.$scope.tableParams.$params.count;

                            this.$scope.msgs = [];

                            var receivedData = (response: any) => {
                                this.$scope.isLoading = false;
                                var data = undefined;
                                if (response.data && response.data.data) {
                                    data = response.data.data;
                                    params.total(data.total);
                                }
                                if (response && response.pagingRows) {
                                    data = response.pagingRows;
                                    data.pageSize = data.pageSize ? data.pageSize : 50;
                                    data.total = data.totalPages * data.pageSize;
                                    params.total(data.total);
                                }
                                if (data != undefined) {
                                    if (data && data.ids) {
                                        this.$scope.ids = data.ids;
                                    }

                                    if (this.$scope.dateGroup) {
                                        if (this.$scope.noPaging) {
                                            var grouped = common.helpers.CommonHelper.groupByDate(data, this.$scope.groupField);
                                            this.$scope.items = grouped;
                                            $defer.resolve(grouped);
                                        }
                                        else {
                                            var grouped = common.helpers.CommonHelper.groupByDate(data.result, this.$scope.groupField);
                                            this.$scope.items = grouped;
                                            $defer.resolve(grouped);
                                        }
                                    }
                                    else {
                                        this.$scope.items = data.result;
                                        $defer.resolve(data.result);
                                    }
                                    this.$scope.total = data.total;
                                    if (this.$scope.itemToSelect) {
                                        this.$scope.goToDetail(this.$scope.itemToSelect, false);
                                        this.$scope.itemToSelect = undefined;
                                    }
                                    else if (this.$scope.selectFirstLine === 'true' && data.result) {
                                        if (data.result.length > 0) {
                                            this.$scope.goToDetail(data.result[0], true);
                                        }
                                    }
                                    this.$scope.$emit('newPageLoaded', data);
                                } else {
                                    $defer.resolve();
                                }
                            };
                            var receivedDataFailed = (response: any) => {
                                this.$scope.isLoading = false;
                                if (response.data) {
                                    params.total(0);
                                    $defer.resolve(null);
                                    this.$scope.total = 0;
                                    this.$scope.ids = null;
                                    this.$scope.items = null;
                                    this.$scope.msgs = response.data.messages;
                                }
                                this.$scope.$emit('newPageLoadedFailed', response);
                            };

                            var specifiedParams: intranet.common.IParamsGrid = {
                                pageSize: params.$params.count,
                                groupBy: params.$params.groupBy || '',
                                page: params.$params.page,
                                orderBy: '',
                                orderByDesc: false
                            };
                            var paramFilters = params.filter();
                            for (var propertyname in paramFilters) {
                                specifiedParams[propertyname] = paramFilters[propertyname];
                            }

                            var keys = Object.keys(params.$params.sorting);
                            if (keys.length > 0) {
                                var keyName = keys[0];
                                var orderBy = params.$params.sorting[keyName];
                                specifiedParams.orderBy = keyName;
                                specifiedParams.orderByDesc = (orderBy === 'desc' ? true : false);
                            }
                            if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                                this.$scope.promiseItem.cancel();
                            }
                            this.$scope.isLoading = true;
                            this.$scope.promiseItem = this.$scope.loadItems({ params: specifiedParams });

                            var promiseItem = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                            if (this.settings.ThemeName == 'lotus') this.commonDataService.addPromise(promiseItem);
                            promiseItem.then(receivedData, receivedDataFailed);

                            this.$scope.exportParams = specifiedParams;

                            //update cache
                            this.updateCache(this.currentPageCacheKey, specifiedParams.page);
                            this.updateCache(this.sortingCacheKey, params.$params.sorting);

                            //hide filter automatically when filter toggle is available
                            if (this.$scope.isToggleFiltersEnabled && initialTime) {
                                initialTime = false;
                                this.$scope.tableParams.settings().$scope.show_filter = false;
                            }
                        }
                    },

                    $scope: { $data: {} },
                    defaultSort: 'asc'
                });
            if (this.settings.ThemeName == 'lotus' && currentUserType != common.enums.UserType.SuperAdmin) {
                $scope.tableParams.settings().counts = 0;
            }
            else {
                $scope.tableParams.settings().counts = $scope.counts || $scope.tableParams.settings().counts;
            }

            if ($scope.maxItems) {
                $scope.tableParams.$params.count = parseInt($scope.maxItems, 10);
            }

            $scope.tableParams.selectedCount = $scope.tableParams.$params.count.toString();


            $scope.paginationUrl = 'app/common/components/grid/sky-pagination.html';
            $scope.noPaginationUrl = 'app/commmon/components/grid/no-pagination.html';

            if (this.settings.ThemeName == 'lotus') {
                $scope.paginationUrl = 'app/common/components/grid/default-pagination.html';
            }
            else if (this.settings.ThemeName == 'dimd2') {
                $scope.paginationUrl = 'app/common/components/grid/dimd2-pagination.html';
            }

            $scope.goToDetail = (item, dontAutoscroll) => this.goToDetail(item, dontAutoscroll);
            $scope.changeSelection = (item) => this.changeSelection(item);
            $scope.selectedRow = (index) => this.selectedRow(index);

            if ($scope.defaultFilter) {
                $scope.tableParams.$params.filter = $scope.defaultFilter;
            }

            $scope.$on('refreshGrid', (e, data) => {
                this.refreshGrid(data);
            });

            $scope.$on('refreshGrid_' + this.$scope.gridId, (e, data) => {
                this.refreshGrid(data);
            });

            $scope.$on('clearGrid', (e) => {
                if (this.$scope.defaultState) {
                    this.$state.go(this.$scope.defaultState);
                }
            });

            $scope.$on('refreshGridWithoutSorting', (data) => {
                this.$scope.tableParams.$params.orderBy = '';
                this.$scope.tableParams.$params.orderByDesc = false;
                this.$scope.tableParams.sorting({});

                this.clearCache();

                this.refreshGrid(data);
            });

            $scope.$on('refreshGridStayOnPage', (e, data) => {
                this.refreshGridStayOnPage(data);
            });

            $scope.$on('refreshGridStayOnPage_' + this.$scope.gridId, (e, data) => {
                this.refreshGridStayOnPage(data);
            });

            // Controller cleanup logic
            this.$scope.$on('$destroy', () => {
                this.clearCache();
                this.$scope.selectedItem = null;
                if (this.$state.current && this.$state.current.data) {
                    this.$state.current.data.undo = null;
                }
            });
        }

        public goToNew(): void {
            if (this.$scope.newState !== undefined && this.$state.current.name !== this.$scope.newState) {
                this.$scope.selectedItem = null;
                this.$state.go(this.$scope.newState);
            } else if (this.$scope.goToNewStateEnabled && this.$scope.goToNewState !== undefined) {
                this.$scope.goToNewState();
            }
        }

        public removeSelectedItems(): void {
            if (this.$scope.selectedItem) {
                var options = new intranet.common.services.ModalOptions();
                options.closeButton = 'common.button.no';
                options.actionButton = 'common.button.yes';
                options.header = 'common.header.deleteconfirmation';
                options.body = 'common.deleteitem.message';
                options.icon = 'remove';

                if (this.$scope.preDelete) {
                    var preDeletePromise = this.$scope.preDelete();
                    if (preDeletePromise) {
                        preDeletePromise.then((result) => {
                            if (result === intranet.common.services.ModalResult.OK) {
                                this.primaryDelete();
                            }
                        });
                    } else {
                        this.modalService.show(options).then(result => {
                            if (result === intranet.common.services.ModalResult.OK) {
                                this.primaryDelete();
                            }
                        });
                    }
                } else {
                    this.modalService.show(options).then(result => {
                        if (result === intranet.common.services.ModalResult.OK) {
                            this.primaryDelete();
                        }
                    });
                }

            }
            else {
                console.log('selected item is empty');
            }
        }

        private primaryDelete(): void {
            if (this.$scope.removeItems) {
                this.$scope.removeItems()
                    .success((response: intranet.common.messaging.IResponse<any>) => this.itemsRemoved(response.data))
                    .error((response: intranet.common.messaging.IResponse<any>) => this.itemsRemovedFailed(response.data));
            }
        }

        public clickExportToExcel(): void {
            if (this.$scope.selfExport) {
                this.$scope.exportToExcel({ params: this.$scope.exportParams });
            }
            else if (this.$scope.exportToExcel) {
                var promise = this.$scope.exportToExcel({ params: this.$scope.exportParams });
                promise.success((response, status, headers: ng.IHttpHeadersGetter) => {
                    var contentType = headers("content-type");
                    // var filename = headers("content-filename");

                    var contentDisposition = headers('Content-Disposition');
                    var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

                    if (contentType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && filename) {
                        // set name from header
                        this.fileService.downloadFileData(response, contentType, filename);
                    }
                    else {
                        var filepath = response.data;
                        if (filepath !== null && filepath != '') {
                            this.fileService.downloadFile(filepath);
                        }
                    }
                });
            }
        }

        public clickCopy(): void {
            this.$scope.$emit('CopyItem');
        }

        public clickExportToPdf(): void {
            if (this.$scope.exportToPdf) {
                var promise = this.$scope.exportToPdf({ params: this.$scope.exportParams });
                promise.success((response) => {
                    var filepath = response.data;
                    if (filepath !== null && filepath != '') {
                        this.fileService.downloadFile(filepath);
                    }
                });
            }
        }

        public showHideFilter(): void {
            this.$scope.tableParams.settings().$scope.show_filter = !this.$scope.tableParams.settings().$scope.show_filter;
        }

        private refreshGrid(data: any): void {
            if (data && this.$scope.selectFirstLine !== 'false') {
                this.$scope.itemToSelect = data.data;
                this.$scope.message = data.message;
            }

            this.$scope.tableParams.$params.page = 1;
            this.$scope.tableParams.reload();
        }

        private refreshGridWithId(data: any): void {
            if (data == this.$scope.gridId) {
                this.$scope.tableParams.$params.page = 1;
                this.$scope.tableParams.reload();
            }
        }

        private refreshGridStayOnPage(data: any): void {
            if (data) {
                this.$scope.itemToSelect = data.data;
                this.$scope.message = data.message;
            }
            this.$scope.tableParams.reload();
        }

        private itemsRemoved(result): void {
            console.debug('item succesfull removed');
            this.$scope.tableParams.reload();
            if (this.$scope.defaultState) {
                this.$state.go(this.$scope.defaultState);
            }
        }

        private itemsRemovedFailed(error): void {
            if (error) { console.error(error); }
        }

        private changeSelection(item: any): void {
            this.$scope.selectedItem = item;
        }

        private selectedRow(index: any): void {
            this.$scope.selectedIndex = index;
        }

        private goToDetail(item: any, dontAutoscroll: boolean): void {
            if (!angular.isUndefined(item)) {
                var options = {};

                options[this.$scope.nameParam] = item[this.$scope.nameValueProperty];

                // TODO: check with Alexander why this undo logic was introduced (keeps a reference to the form after form exit -> memory leak)
                // var currentSelection = this.$scope.selectedItem;
                this.$scope.selectedItem = item;

                //this.$state.current.data.undo = () => {
                //    this.$scope.selectedItem = currentSelection;
                //};
            }

            if (!dontAutoscroll) {
                this.$scope.autoscroll = true;
            } else {
                this.$scope.autoscroll = false;
            }

            // Custom detail state handling
            if (this.$scope.goToDetailStateEnabled
                && angular.isDefined(this.$scope.goToDetailState)) {
                this.$scope.goToDetailState({ item: item });
            }
            else if (angular.isDefined(this.$scope.detailState)) {
                this.$state.go(this.$scope.detailState, options);
            }
        }

        private getFromCache(key: string): any {
            var fullKey = this.$scope.cacheKey + '_' + key;
            return this.localCacheHelper.get(fullKey);
        }

        private updateCache(key: string, value: any): void {
            if (this.$scope.cacheKey) {
                var fullKey = this.$scope.cacheKey + '_' + key;
                this.localCacheHelper.put(fullKey, value);
            }

        }

        private clearCache(): void {
            if (this.$scope.cacheKey) {
                var fullKeyPaging = this.$scope.cacheKey + '_' + this.currentPageCacheKey;
                this.localCacheHelper.remove(fullKeyPaging);
                var fullKeySorting = this.$scope.cacheKey + '_' + this.sortingCacheKey;
                this.localCacheHelper.remove(fullKeySorting);
            }
        }
    }

    angular.module('kt.components')
        .controller('KTGridController', KTGridController);

    angular.module('kt.components')
        .directive('ktGrid', (settings: IBaseSettings) => {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    loadItems: '&',
                    preDelete: '&?',
                    exportToExcel: '&?',
                    selfExport: '&?',
                    selectedItem: '=?',
                    removeItems: '&?',
                    selectFirstLine: '@?',
                    detailState: '@?',
                    newState: '@?',
                    defaultState: '@?',
                    nameParam: '@?',
                    nameValueProperty: '@?',
                    maxItems: '@?',
                    defaultFilter: '=?',
                    options: '=?',
                    listNewItems: '=?',
                    page: '=?',
                    total: '=?',
                    counts: '=?',
                    pageSize: '=?',
                    canILoad: '=?',
                    copy: '@?',
                    autoscroll: '=?',
                    newButtonLabel: '@?',
                    cacheKey: '@?',
                    exportToPdf: '&?',
                    editMode: '=',
                    toggleFilters: '@',
                    goToNewState: '&?',
                    emptyMsg: '@?',
                    ids: '=?',
                    hasNewRights: '=?',
                    hasRemoveRights: '=?',
                    items: '=?',
                    gridId: '@?',
                    goToDetailState: '&?',
                    totalRowMsg: '@?',
                    dateGroup: '@?',
                    groupField: '@?',
                    noPaging: '@?',
                    tableParentClass: '@?'
                },
                templateUrl:
                    settings.ThemeName == 'betfair' ? 'app/common/components/grid/grid-betfair.html' :
                        (settings.ThemeName == 'dimd2' ? 'app/common/components/grid/grid-dimd2.html' :
                            'app/common/components/grid/grid.html'),
                controller: 'KTGridController',
                link: (scope: IKTGrid, elm, attr: any, ctrl, transclude) => {
                    var transcludedDiv = elm.find('.myTranscludedContent');
                    transclude(scope, (transElem, transScope: any) => {
                        transcludedDiv.append(transElem);

                        scope.$on('$destroy', () => {

                            scope.tableParams = null;

                            transScope.$destroy();
                            transScope = null;
                            transcludedDiv.remove();
                            transcludedDiv = null;

                        });

                        if (!attr.nameValueProperty) {
                            attr.nameValueProperty = 'id';
                            transScope.nameValueProperty = 'id';
                        } else {
                            transScope.nameValueProperty = attr.nameValueProperty;
                        }

                        if (attr.goToNewState !== undefined) {
                            transScope.goToNewStateEnabled = true;
                        }

                        if (attr.goToDetailState !== undefined) {
                            transScope.goToDetailStateEnabled = true;
                        }

                        transScope.isCopy = (attr.copy === 'true');
                        transScope.selfExport = (attr.selfExport === 'true');

                        transScope.newButtonLabelProperty = attr.newButtonLabel || 'grid.action';

                        if (attr.showTotal === 'false') {
                            transScope.isShowTotal = false;
                        } else {
                            transScope.isShowTotal = true;
                        }

                        if (attr.dateGroup == 'true') { transScope.dateGroup = true; } else { transScope.dateGroup = false; }
                        if (attr.noPaging == 'true') { transScope.noPaging = true; } else { transScope.noPaging = false; }

                        transScope.isToggleFiltersEnabled = attr.toggleFilters === 'true';

                        if (!angular.isDefined(attr.hasNewRights)) { transScope.hasNewRights = true; }
                        if (!angular.isDefined(attr.hasRemoveRights)) { transScope.hasRemoveRights = true; }

                        // make outer scope available to transcluded content to avoid $parent.$parent.$parent...
                        transScope.$outer = scope.$parent;
                    });
                }
            };
        });
}