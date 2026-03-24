var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MobileFDBetHistoryCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, ExportFactory, $filter, fdService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.ExportFactory = ExportFactory;
                this.$filter = $filter;
                this.fdService = fdService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    roundId: '',
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.$scope.memberList = [];
                this.$scope.member = {};
            }
            loadInitialData() {
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            getHistoryBets(params) {
                var searchQuery = {
                    roundId: this.$scope.search.roundId,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.member.selectedMember && this.$scope.member.selectedMember.userId) {
                    searchQuery.sourceUserId = this.$scope.member.selectedMember.userId;
                }
                if (this.$scope.search.userId) {
                    searchQuery.sourceUserId = this.$scope.search.userId;
                }
                if (this.$scope.search.platformUserId) {
                    searchQuery.platformUserId = this.$scope.search.platformUserId;
                }
                if (this.$stateParams.memberid) {
                    return this.fdService.getBetHistory({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.fdService.getBetHistory({ searchQuery: searchQuery, params: params });
                }
            }
            exportBetHistory(params, exportType) {
                var searchQuery = {
                    roundId: this.$scope.search.roundId,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.member.selectedMember && this.$scope.member.selectedMember.userId) {
                    searchQuery.sourceUserId = this.$scope.member.selectedMember.userId;
                }
                if (this.$scope.search.userId) {
                    searchQuery.sourceUserId = this.$scope.search.userId;
                }
                if (this.$stateParams.memberid) {
                    this.fdService.getBetHistoryExport({ exportType: exportType, searchQuery: searchQuery, params: params, id: this.$stateParams.memberid })
                        .success((response) => {
                        if (response.success) {
                            this.exportData(response.data);
                        }
                    });
                }
                else {
                    this.fdService.getBetHistoryExport({ exportType: exportType, searchQuery: searchQuery, params: params })
                        .success((response) => {
                        if (response.success) {
                            this.exportData(response.data);
                        }
                    });
                }
            }
            exportData(gridData) {
                if (gridData) {
                    var table = '';
                    var headerTD = '';
                    var contentTD = '';
                    var contentTR = '';
                    angular.forEach(gridData, (g, gindex) => {
                        if (gindex == 0) {
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("BetId");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("User");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Round Id");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Market");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Runner");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Side");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Price");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Size");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("PL");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Created On");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Remote Ip");
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                        }
                        contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.betId);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user.username);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.roundId);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.tableName);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runner);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.side == 1 ? 'Back' : 'Lay');
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.price);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.pl));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.remoteIp);
                        contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                    table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = intranet.common.helpers.CommonHelper.wrapTable(table);
                    this.ExportFactory.tableStringToExcel(table, 'FD Bet-History');
                }
            }
        }
        home.MobileFDBetHistoryCtrl = MobileFDBetHistoryCtrl;
        angular.module('intranet.home').controller('mobileFDBetHistoryCtrl', MobileFDBetHistoryCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileFDBetHistoryCtrl.js.map