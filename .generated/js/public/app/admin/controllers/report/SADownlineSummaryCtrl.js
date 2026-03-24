var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SADownlineSummaryCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, $stateParams, $filter, commonDataService, userService, ExportFactory, betHistoryService) {
                super($scope);
                this.$state = $state;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.ExportFactory = ExportFactory;
                this.betHistoryService = betHistoryService;
                this.$scope.$on('$destroy', () => {
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.canILoad = false;
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
                };
                this.$scope.userTree = [];
            }
            loadInitialData() {
                if (!this.commonDataService.getDateFilter(this.$scope.search, 'downline-summary-date'))
                    this.setDates(0, 'd');
                else
                    this.refreshGrid();
                this.buildUserTreeForHeader();
                this.getUserTree();
            }
            buildUserTreeForHeader() {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.loginUsername = loggeduser.username;
                }
                if (this.$stateParams.usertype) {
                    this.$scope.childUsershort = super.getUserTypesShort(math.add(this.$stateParams.usertype, 1));
                    this.$scope.currentUsershort = super.getUserTypesShort(this.$stateParams.usertype);
                    this.$scope.isChildClient = math.add(this.$stateParams.usertype, 1) == intranet.common.enums.UserType.Player;
                }
                else {
                    var loggeduser = this.commonDataService.getLoggedInUserData();
                    if (loggeduser) {
                        this.$scope.childUsershort = super.getUserTypesShort(loggeduser.userType + 1);
                        this.$scope.currentUsershort = super.getUserTypesShort(loggeduser.userType);
                        this.$scope.isChildClient = math.add(loggeduser.userType, 1) == intranet.common.enums.UserType.Player;
                    }
                }
            }
            getUserTree() {
                if (this.$stateParams.memberid) {
                    this.userService.getParentsByUserId(this.$stateParams.memberid)
                        .success((response) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                var parent = result.parent;
                                while (parent) {
                                    if (parent.username != 'sa') {
                                        this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                        if (parent.parent) {
                                            parent = parent.parent;
                                        }
                                        else {
                                            parent = null;
                                        }
                                    }
                                    else {
                                        parent = null;
                                    }
                                }
                                this.$scope.userTree = this.$scope.userTree.reverse();
                            }
                        }
                    });
                }
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.canILoad = true;
                this.$scope.$broadcast('refreshGrid_kt-downline-summary-grid');
            }
            getItems(params) {
                this.commonDataService.storeDateFilter(this.$scope.search, 'downline-summary-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$stateParams.memberid) {
                    return this.betHistoryService.getDownlineSummary({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betHistoryService.getDownlineSummary({ searchQuery: searchQuery, params: params });
                }
            }
            getPLDetail(item) {
                item.show = !item.show;
                if (item.show) {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                        reportOf: this.$scope.search.reportOf
                    };
                    var request = { id: item.user.id, searchQuery: searchQuery };
                    this.betHistoryService.getDownlineSummaryDetails(request)
                        .success((response) => {
                        if (response.success) {
                            item.eventTypes = response.data;
                        }
                    });
                }
            }
        }
        admin.SADownlineSummaryCtrl = SADownlineSummaryCtrl;
        angular.module('intranet.admin').controller('sADownlineSummaryCtrl', SADownlineSummaryCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SADownlineSummaryCtrl.js.map