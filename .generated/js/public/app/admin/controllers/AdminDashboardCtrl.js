var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AdminDashboardCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, dashboardService) {
                super($scope);
                this.settings = settings;
                this.dashboardService = dashboardService;
                super.init(this);
            }
            loadInitialData() {
                this.$scope.marketBox = {};
                this.$scope.userSummary = {};
                this.$scope.bets = {};
                this.$scope.pl = {};
                this.$scope.topUser = { sorting: true };
                this.setUserCurrentTab('Day');
                this.$scope.topUserList = [];
                this.$scope.topTable = { sorting: true };
                this.setTableCurrentTab('Day');
                this.$scope.topTableList = [];
                if (this.settings.ThemeName == 'sky') {
                    this.setBetHistoryChart();
                    this.setLiveBetChart();
                    this.setTotalMarket();
                    this.setUserSummary();
                    this.setLivebetTotal();
                    this.setRecentProfitloss();
                }
            }
            setBetHistoryChart() {
                this.dashboardService.getBetSummary()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.plHistoryChartOption = {
                            chart: {
                                type: 'bar',
                            },
                            title: {
                                text: 'Historic P&L by Sports/Games',
                                style: { color: '#FFF' }
                            },
                            subtitle: {
                                style: { color: '#FFF' }
                            },
                            xAxis: {
                                categories: response.data.map((r) => { return r.eventTypeName; }),
                                title: {
                                    text: null
                                },
                                labels: {
                                    style: { color: '#FFF', }
                                }
                            },
                            yAxis: {
                                title: {
                                    text: 'Range in GLC',
                                    align: 'high'
                                },
                                labels: {
                                    overflow: 'justify', style: { color: '#FFF', }
                                }
                            },
                            tooltip: {
                                valueSuffix: ' GLC', style: { color: '#FFF', }
                            },
                            plotOptions: {
                                bar: {
                                    dataLabels: {
                                        enabled: true,
                                        format: '{y} G',
                                        style: { color: '#FFF' }
                                    }
                                }
                            },
                            legend: {
                                layout: 'vertical',
                                align: 'right',
                                verticalAlign: 'top',
                                x: 0,
                                y: 20,
                                floating: true,
                                borderWidth: 1,
                                shadow: false,
                                itemHoverStyle: { color: '#FFF' },
                                itemStyle: { color: '#cacaca' },
                            },
                            credits: {
                                enabled: false
                            },
                            series: [{
                                    name: 'Profit & Loss',
                                    data: response.data.map((r) => { return math.round(math.divide(r.pl, 1), 2); })
                                }, {
                                    name: 'Stakes',
                                    data: response.data.map((r) => { return math.round(math.divide(r.stake, 1), 2); })
                                }]
                        };
                    }
                });
            }
            setLiveBetChart() {
                this.dashboardService.getLiveBetSummary()
                    .success((response) => {
                    this.$scope.liveBetChartOption = {
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: 'Live bets by Sports/Games',
                            style: { color: '#FFF' }
                        },
                        xAxis: {
                            categories: response.data.map((r) => { return r.eventTypeName; }),
                            labels: {
                                style: { color: '#FFF', }
                            }
                        },
                        yAxis: [{
                                min: 0,
                                title: {
                                    text: 'Stake'
                                },
                                labels: {
                                    style: { color: '#FFF', }
                                }
                            }, {
                                title: {
                                    text: 'Total Bets'
                                },
                                opposite: true,
                                labels: {
                                    style: { color: '#FFF', }
                                }
                            }],
                        legend: {
                            shadow: false,
                            itemHoverStyle: { color: '#FFF' },
                            itemStyle: { color: '#cacaca' },
                        },
                        tooltip: {
                            shared: true,
                            style: { color: '#FFF', }
                        },
                        plotOptions: {
                            column: {
                                grouping: false,
                                shadow: false,
                                borderWidth: 0,
                                style: { color: '#FFF' }
                            }
                        },
                        series: [{
                                name: 'Stake',
                                color: 'rgba(126,86,134,.9)',
                                data: response.data.map((r) => { return r.stake; }),
                                pointPadding: 0.4,
                                pointPlacement: -0.2
                            }, {
                                name: 'Total Bets',
                                color: 'rgba(186,60,61,.9)',
                                data: response.data.map((r) => { return r.totalBets; }),
                                pointPadding: 0.4,
                                pointPlacement: 0.2,
                                yAxis: 1
                            }]
                    };
                });
            }
            setTotalMarket() {
                this.dashboardService.getTotalMarkets()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.marketBox.totalMarkets = response.data.totalMarkets;
                        this.$scope.marketBox.inplayMarkets = response.data.inplayMarkets;
                    }
                });
            }
            setUserSummary() {
                this.dashboardService.getUserSummary()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.userSummary.totalUser = response.data.totalUser;
                        this.$scope.userSummary.liveUser = response.data.liveUser;
                    }
                });
            }
            setLivebetTotal() {
                this.dashboardService.getLivebetTotal()
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.bets.stake = response.data.stake;
                        this.$scope.bets.totalBets = response.data.totalBets;
                    }
                });
            }
            setRecentProfitloss() {
                this.dashboardService.getRecentProfitloss()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.pl.today = response.data.today;
                        this.$scope.pl.yesterday = response.data.yesterday;
                        this.$scope.pl.week = response.data.week;
                    }
                });
            }
            setUserCurrentTab(lbl) {
                this.$scope.userCurrentTab = lbl;
                if (lbl == 'Day') {
                    this.$scope.topUser.fromDate = new Date(moment().format("DD MMM YYYY"));
                    this.$scope.topUser.toDate = new Date(moment().format("DD MMM YYYY"));
                }
                else if (lbl == 'Week') {
                    let wnumber = moment().weekday() - 1;
                    this.$scope.topUser.fromDate = new Date(moment().add(wnumber * -1, 'd').format("DD MMM YYYY"));
                    this.$scope.topUser.toDate = new Date(moment().format("DD MMM YYYY"));
                }
                else if (lbl == 'Month') {
                    let wnumber = moment().get('date') - 1;
                    this.$scope.topUser.fromDate = new Date(moment().add(wnumber * -1, 'd').format("DD MMM YYYY"));
                    this.$scope.topUser.toDate = new Date(moment().format("DD MMM YYYY"));
                }
                else if (lbl == 'LastMonth') {
                    var x = new Date();
                    x.setDate(1);
                    x.setMonth(x.getMonth() - 1);
                    this.$scope.topUser.fromDate = new Date(x.getFullYear(), x.getMonth(), x.getDate());
                    let y = new Date();
                    y.setDate(0);
                    this.$scope.topUser.toDate = new Date(y.getFullYear(), y.getMonth(), y.getDate());
                }
                this.$scope.topUser.fromDate = intranet.common.helpers.Utility.fromDateUTC(this.$scope.topUser.fromDate);
                this.$scope.topUser.toDate = intranet.common.helpers.Utility.toDateUTC(this.$scope.topUser.toDate);
                this.loadUserWisePL();
            }
            loadUserWisePL() {
                this.dashboardService.getTopUserWisePL(this.$scope.topUser)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.topUserList = response.data;
                    }
                });
            }
            setTableCurrentTab(lbl) {
                this.$scope.tableCurrentTab = lbl;
                if (lbl == 'Day') {
                    this.$scope.topTable.fromDate = new Date(moment().format("DD MMM YYYY"));
                    this.$scope.topTable.toDate = new Date(moment().format("DD MMM YYYY"));
                }
                else if (lbl == 'Week') {
                    let wnumber = moment().weekday() - 1;
                    this.$scope.topTable.fromDate = new Date(moment().add(wnumber * -1, 'd').format("DD MMM YYYY"));
                    this.$scope.topTable.toDate = new Date(moment().format("DD MMM YYYY"));
                }
                else if (lbl == 'Month') {
                    let wnumber = moment().get('date') - 1;
                    this.$scope.topTable.fromDate = new Date(moment().add(wnumber * -1, 'd').format("DD MMM YYYY"));
                    this.$scope.topTable.toDate = new Date(moment().format("DD MMM YYYY"));
                }
                else if (lbl == 'LastMonth') {
                    var x = new Date();
                    x.setDate(1);
                    x.setMonth(x.getMonth() - 1);
                    this.$scope.topTable.fromDate = new Date(x.getFullYear(), x.getMonth(), x.getDate());
                    let y = new Date();
                    y.setDate(0);
                    this.$scope.topTable.toDate = new Date(y.getFullYear(), y.getMonth(), y.getDate());
                }
                this.$scope.topTable.fromDate = intranet.common.helpers.Utility.fromDateUTC(this.$scope.topTable.fromDate);
                this.$scope.topTable.toDate = intranet.common.helpers.Utility.toDateUTC(this.$scope.topTable.toDate);
                this.loadTableWisePL();
            }
            loadTableWisePL() {
                this.dashboardService.getTopTableWisePL(this.$scope.topTable)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.topTableList = response.data;
                    }
                });
            }
        }
        admin.AdminDashboardCtrl = AdminDashboardCtrl;
        angular.module('intranet.admin').controller('adminDashboardCtrl', AdminDashboardCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AdminDashboardCtrl.js.map