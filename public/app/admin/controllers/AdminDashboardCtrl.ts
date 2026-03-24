module intranet.admin {
    export interface IAdminDashboardScope extends intranet.common.IScopeBase {
        plHistoryChartOption: any;
        liveBetChartOption: any;

        marketBox: any;
        userSummary: any;
        bets: any;
        pl: any;

        userCurrentTab: any;
        topUser: any;
        topUserList: any;

        tableCurrentTab: any;
        topTable: any;
        topTableList: any;
    }

    export class AdminDashboardCtrl extends intranet.common.ControllerBase<IAdminDashboardScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IAdminDashboardScope,
            private settings: common.IBaseSettings,
            private dashboardService: services.DashboardService) {
            super($scope);

            super.init(this);
        }

        public loadInitialData(): void {
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

        private setBetHistoryChart(): void {
            this.dashboardService.getBetSummary()
                .success((response: common.messaging.IResponse<any>) => {
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
                                categories: response.data.map((r: any) => { return r.eventTypeName; }),
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
                                // backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                                shadow: false,
                                itemHoverStyle: { color: '#FFF' },
                                itemStyle: { color: '#cacaca' },
                            },
                            credits: {
                                enabled: false
                            },

                            series: [{
                                name: 'Profit & Loss',
                                data: response.data.map((r: any) => { return math.round(math.divide(r.pl, 1), 2); })
                            }, {
                                name: 'Stakes',
                                data: response.data.map((r: any) => { return math.round(math.divide(r.stake, 1), 2); })
                            }]
                        };

                    }
                });
        }

        private setLiveBetChart(): void {
            this.dashboardService.getLiveBetSummary()
                .success((response: common.messaging.IResponse<any>) => {
                    this.$scope.liveBetChartOption = {
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: 'Live bets by Sports/Games',
                            style: { color: '#FFF' }
                        },
                        xAxis: {
                            categories: response.data.map((r: any) => { return r.eventTypeName; }),
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
                            data: response.data.map((r: any) => { return r.stake }),
                            pointPadding: 0.4,
                            pointPlacement: -0.2
                        }, {
                            name: 'Total Bets',
                            color: 'rgba(186,60,61,.9)',
                            data: response.data.map((r: any) => { return r.totalBets; }),
                            //tooltip: {
                            //    valuePrefix: '$',
                            //    valueSuffix: ' M'
                            //},
                            pointPadding: 0.4,
                            pointPlacement: 0.2,
                            yAxis: 1
                        }]
                    };
                });
        }


        private setTotalMarket(): void {
            this.dashboardService.getTotalMarkets()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.marketBox.totalMarkets = response.data.totalMarkets;
                        this.$scope.marketBox.inplayMarkets = response.data.inplayMarkets;
                    }
                });
        }

        private setUserSummary(): void {
            this.dashboardService.getUserSummary()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.userSummary.totalUser = response.data.totalUser;
                        this.$scope.userSummary.liveUser = response.data.liveUser;
                    }
                });
        }

        private setLivebetTotal(): void {
            this.dashboardService.getLivebetTotal()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.bets.stake = response.data.stake;
                        this.$scope.bets.totalBets = response.data.totalBets;
                    }
                });
        }

        private setRecentProfitloss(): void {
            this.dashboardService.getRecentProfitloss()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.pl.today = response.data.today;
                        this.$scope.pl.yesterday = response.data.yesterday;
                        this.$scope.pl.week = response.data.week;
                    }
                });
        }

        private setUserCurrentTab(lbl: any) {
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

            this.$scope.topUser.fromDate = common.helpers.Utility.fromDateUTC(this.$scope.topUser.fromDate);
            this.$scope.topUser.toDate = common.helpers.Utility.toDateUTC(this.$scope.topUser.toDate);

            this.loadUserWisePL();
        }

        private loadUserWisePL() {
            this.dashboardService.getTopUserWisePL(this.$scope.topUser)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.topUserList = response.data; }
                });
        }

        private setTableCurrentTab(lbl: any) {
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

            this.$scope.topTable.fromDate = common.helpers.Utility.fromDateUTC(this.$scope.topTable.fromDate);
            this.$scope.topTable.toDate = common.helpers.Utility.toDateUTC(this.$scope.topTable.toDate);

            this.loadTableWisePL();
        }

        private loadTableWisePL() {
            this.dashboardService.getTopTableWisePL(this.$scope.topTable)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.topTableList = response.data; }
                });
        }
    }
    angular.module('intranet.admin').controller('adminDashboardCtrl', AdminDashboardCtrl);
}