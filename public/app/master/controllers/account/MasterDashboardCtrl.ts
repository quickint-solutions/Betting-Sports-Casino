module intranet.master {

    export interface IMasterDashboardScope extends intranet.common.IScopeBase {
        balanceInfo: any;
        balanceTree: any[];

        currentUserType: any;
        currentUserId: any;

        plHistoryChartOption: any;
        liveBetChartOption: any;

        marketBox: any;
        userSummary: any;
        bets: any;
        pl: any;

        referral: any;
        showReferral: boolean;

        userCurrentTab: any;
        topUser: any;
        topUserList: any;

        tableCurrentTab: any;
        topTable: any;
        topTableList: any;
    }

    export class MasterDashboardCtrl extends intranet.common.ControllerBase<IMasterDashboardScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IMasterDashboardScope,
            private $filter: any,
            private modalService: common.services.ModalService,
            private $stateParams: any,
            private settings: common.IBaseSettings,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private dashboardService: services.DashboardService,
            private accountService: services.AccountService) {
            super($scope);

            super.init(this);
        }

        public loadInitialData(): void {
            this.$scope.referral = {};
            this.$scope.balanceInfo = {};
            this.$scope.currentUserType = this.$rootScope.current.usertype;
            this.$scope.currentUserId = this.$rootScope.current.userId;
            if (this.$stateParams.usertype) { this.$scope.currentUserType = this.$stateParams.usertype; }
            if (this.$stateParams.memberid) { this.$scope.currentUserId = this.$stateParams.memberid; }

            this.$scope.balanceTree = [];
            this.getBalance();

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

            if (!this.$stateParams.memberid) {
                if (this.$rootScope.current.usertype == common.enums.UserType.Agent) {
                    this.getLink();
                }

                this.setBetHistoryChart();
                this.setLiveBetChart();
                this.setTotalMarket();
                this.setUserSummary();
                this.setLivebetTotal();
                this.setRecentProfitloss();
            }
        }

        private getBalance(): void {
            var promise: ng.IHttpPromise<any>;
            this.$scope.balanceInfo.isBalanceLoaded = false;
            this.$scope.balanceTree.splice(0);

            promise = this.accountService.getMasterBalanceDetail(this.$scope.currentUserId);

            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.$scope.balanceInfo = response.data;
                }
            }).finally(() => { this.$scope.balanceInfo.isBalanceLoaded = true; });
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
                                    text: '',
                                    align: 'high'
                                },
                                labels: {
                                    overflow: 'justify', style: { color: '#FFF', }
                                }
                            },
                            tooltip: {
                                valueSuffix: '', style: { color: '#FFF', }
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
                                data: response.data.map((r: any) => { return math.round(math.divide(this.$filter('toRateOnly')(r.pl), 1), 2); })
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
                            data: response.data.map((r: any) => { return this.$filter('toRateOnly')(r.stake); }),
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
                    if (response.success) {
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

        // referral setting
        private referralSetting() {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Update Referral Settings';
            modal.data = { id: this.$scope.currentUserId };
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/refer-modal.html';
            modal.controller = 'referModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = 'Close';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.Cancel) {
                    this.getLink();
                }
            });
        }

        public copyCode() {
            this.commonDataService.copyText(this.$scope.referral.link);
        }

        public copyReferLink() {
            this.commonDataService.copyText(this.$scope.referral.refeLink);
        }

        private getLink() {
            var baseUrl;
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    baseUrl = data.url + '#';
                    this.$scope.showReferral = data.isRegisterEnabled;
                    if (this.$scope.showReferral) {
                        var uData = this.commonDataService.getLoggedInUserData();
                        if (uData) {
                            this.$scope.referral.link = uData.referralCode;
                            this.$scope.referral.refeLink = baseUrl + '?code=' + this.$scope.referral.link;
                        }
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
    angular.module('intranet.master').controller('masterDashboardCtrl', MasterDashboardCtrl);
}