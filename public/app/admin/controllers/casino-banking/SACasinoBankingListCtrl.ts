module intranet.admin {

    export interface ISACasinoBankingListScope extends intranet.common.IScopeBase {
        userTypes: any[];
        userid: any;
        password: any;

        userStatus: any[];
        websites: any[];
        search: any;

        transactionType: any[];
        gridItems: any[];
    }

    export class SACasinoBankingListCtrl extends intranet.common.ControllerBase<ISACasinoBankingListScope>
        implements common.init.IInit {
        constructor($scope: ISACasinoBankingListScope,
            private commonDataService: common.services.CommonDataService,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private exportService: services.ExportService,
            private websiteService: services.WebsiteService,
            private settings: common.IBaseSettings,
            private $stateParams: any,
            private $state: any,
            private $filter: any,
            protected $rootScope: any,
            private accountService: services.AccountService) {
            super($scope);

            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-banking-grid') {
                    if (data && data.result.length > 0) {
                        data.result.forEach((item: any) => {
                            item.chips = math.round(math.subtract((item.totalCasinoBalance + item.casinoBalance), item.casinoCreditLimit ? item.casinoCreditLimit : 0), 2);
                            if (item.chips < 0) {
                                item.dwType = 'D';
                                item.chips = item.chips * -1;
                            }
                            else {
                                item.dwType = 'W';
                            }
                        });
                    }
                }
            });

            this.$scope.$on('$destroy', () => {
                newPageLoader();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = { status: "2", name: '', username: '', websiteId: '-1' };
            this.$scope.userTypes = [];
            this.$scope.transactionType = [];
        }

        public loadInitialData(): void {
            if (this.$stateParams.memberid) {
                this.$scope.userid = this.$stateParams.memberid
            }
            else {
                this.getUserId();
            }
            this.fillUserTypes();
            this.loadUserStatus();
            this.loadWebsites();
            this.loadTransactionTypes();
        }

        private loadUserStatus(): void {
            var status: any = common.enums.UserStatus;
            this.$scope.userStatus = common.helpers.Utility.enumToArray<common.enums.UserStatus>(status);
            this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });
        }

        private loadWebsites(): void {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        this.$scope.websites.splice(0, 0, { id: -1, name: '-- Select Website --' });
                    }
                });
        }

        private haveChild(id: any): any {
            return id < common.enums.UserType.Player;
        }

        private getUserId(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.userid = result.id;
            }
        }

        private loadTransactionTypes(): void {
            this.$scope.transactionType.push({ id: 'D', name: 'D' });
            this.$scope.transactionType.push({ id: 'W', name: 'W' });
        }

        private fillUserTypes(): void {
            this.$scope.userTypes = super.getUserTypes();
        }

        private goBack(): void {
            this.$state.go("admin.casinobanking.list", { memberid: null });
        }


        private getUserStatus(status: any): string {
            return common.enums.UserStatus[status];
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
                return found[0].name;
            }
        }


        // callback : used to load grid
        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchModel = {
                name: this.$scope.search.name,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
                websiteId: this.$scope.search.websiteId,
            };
            var model = { params: params, id: this.$scope.userid, searchQuery: searchModel };
            return this.accountService.getCasinoMembersForBanking(model);
        }

        public exportBanking(params: any, exportType: any): any {
            var searchModel = {
                name: this.$scope.search.name,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
                websiteId: this.$scope.search.websiteId,
            };
            var model = { params: params, id: this.$scope.userid, exportType: exportType, searchQuery: searchModel };
            return this.exportService.getCasinoChildBalanceinfo(model);
        }

        private updateCreditRef(userid, creditRef, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.header = this.$filter('translate')('creditref.update.modal.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.data = {
                current: creditRef,
                userId: userid,
                isCasino: true
            }
            modal.bodyUrl = this.settings.ThemeName + '/master/credit-reference-modal.html';
            modal.controller = 'creditReferenceModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                }
            });
        }

        private transferChip(gritem: any): void {
            var item: any = {};
            angular.copy(gritem, item);
            item.isCasino = true;

            var modal = new common.helpers.CreateModal();
            modal.header = this.$filter('translate')('transfer.update.modal.header');
            if (item.user.username) { modal.header = modal.header + " - " + item.user.username; }
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/transfer-modal.html';
            modal.controller = 'transferModalCtrl';
            modal.options.actionButton = 'Transfer';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$rootScope.$emit('admin-balance-changed');
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                }
            });
        }

        private transferAllChip(): void {
            var gridItems: any[] = [];
            angular.copy(this.$scope.gridItems, gridItems);
            var tf = gridItems.filter((a: any) => { return a.isTransfer });
            if (tf.length > 0) {
                tf.forEach((t: any) => {
                    if (t.chips.length > 0) {
                        t.chips = parseFloat(t.chips.replaceAll(',', ''));
                    }
                });
                var dw = tf.filter((t: any) => { return t.chips && t.chips != 0; });
                var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
                if (model) {
                    this.accountService.DWForCasino(model)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.password = '';
                                this.$rootScope.$emit('admin-balance-changed');
                                this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                            }
                            this.toasterService.showMessages(response.messages, 3000);
                        });
                }
            }
        }

        public resetCriteria(): void {
            this.$scope.search = { status: "2", name: '', username: '', websiteId: '-1' };
            this.refreshGrid();
        }

        // action buttons
        private changeUserStatus(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'member.change.status.modal.header';
            modal.data = {
                userId: item.userId,
                userType: item.user.userType,
                status: item.user.status,
                name: item.user.username
            }
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/change-status-modal.html';
            modal.controller = 'changeStatusModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-banking-grid');
                }
            });
        }

        private updateBetConfig(userid, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.options.extraButton = 'common.button.applyall';
            modal.header = this.$filter('translate')('betconfig.update.modal.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.data = userid;
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/bet-config-modal.html';
            modal.controller = 'betConfigModalCtrl';
            modal.size = 'lg';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private setCommission(userId: any, username: string): void {
            var modal = new common.helpers.CreateModal();
            modal.data = { userId: userId, username: username, onlyCommission: false };
            modal.size = 'lg';
            modal.header = 'admin.user.set.commission.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/user-commission-modal.html';
            modal.controller = 'userCommissionModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }
    }

    angular.module('intranet.admin').controller('sACasinoBankingListCtrl', SACasinoBankingListCtrl);
}