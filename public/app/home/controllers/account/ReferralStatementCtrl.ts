module intranet.home {

    export interface IReferralStatementScope extends intranet.common.IScopeBase {
        userid: any;
        search: any;

        referralUsers: any;
        referralObj: any;

        viewTypeList: any[];
        viewType: any;//1=referrals,2=statement
        canILoad: any;
    }

    export class ReferralStatementCtrl extends intranet.common.ControllerBase<IReferralStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: IReferralStatementScope,
            private $stateParams: any,
            private commonDataService: common.services.CommonDataService,
            private toasterService: common.services.ToasterService,
            private accountService: services.AccountService,
            private userService: services.UserService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues() {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm")),
                viewType: '1'
            };
            this.setDates(-3, 'M');
            this.$scope.referralObj = {};
            this.$scope.canILoad = false;
            this.$scope.viewTypeList = [];
        }

        public loadInitialData() {
            this.$scope.viewTypeList.push({ id: 1, name: 'Get Referral Users' });
            this.$scope.viewTypeList.push({ id: 2, name: 'Get Referral Statement' });
            this.getUserId();
        }

        private refreshGrid(): void {
            if (this.$scope.search.viewType == 1) {
                this.getMyReferrals();
            } else {
                this.$scope.viewType = 2;
                this.$scope.canILoad = true;
                this.$scope.$broadcast('refreshGrid');
            }
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private getUserId(): void {
            if (this.$stateParams.memberid) {
                this.$scope.userid = this.$stateParams.memberid;
            }
            else {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                }
            }
            this.getReferralBalance();
            this.getReferralLink();
            this.getMyReferrals();
        }

        private getReferralLink() {
            var baseUrl;
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    baseUrl = data.url + '#';
                    var uData = this.commonDataService.getLoggedInUserData();
                    if (uData) {
                        var code = uData.referralCode;
                        this.$scope.referralObj.link = baseUrl + '?code=' + code;
                    }
                });
        }

        private getMyReferrals() {
            this.$scope.viewType = 1;
            this.$scope.canILoad = false;
            var promise: any;
            if (this.$stateParams.memberid) {
                promise = this.userService.getMyReferralMember(this.$stateParams.memberid);
            } else {
                promise = this.userService.getMyReferral();
            }
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.$scope.referralUsers = response.data;
                }
            });
        }

        private getReferralBalance() {
            this.accountService.getReferralBalance(this.$scope.userid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.referralObj.balance = response.data.referralBalance;
                        this.$scope.referralObj.minWithdrawalAmount = response.data.minWithdrawalAmount;
                        this.$scope.referralObj.minimumBalanceRequired = response.data.minimumBalanceRequired;
                    }
                });
        }

        private showReferralStatement() {

        }

        private getReferralStatement(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.accountService.getReferralStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private copytext(item) {
            this.commonDataService.copyText(item);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Referral link Copied.", 2000);
        }

        private withdrawBalance() {
            this.accountService.withdrawalReferralLedger()
                .success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages);
                    if (response.success) {
                        this.getReferralBalance();
                        this.refreshGrid();
                    }
                });
        }

    }
    angular.module('intranet.home').controller('referralStatementCtrl', ReferralStatementCtrl);
}