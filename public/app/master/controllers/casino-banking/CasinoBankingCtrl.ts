module intranet.master {

    export interface ICasinoBankingScope extends intranet.common.IScopeBase {
        userTypes: any[];
        userid: any;
        password: any;

        userStatus: any[];
        search: any;

        transactionType: any[];
        gridItems: any[];
    }

    export class CasinoBankingCtrl extends intranet.common.ControllerBase<ICasinoBankingScope>
        implements common.init.IInit {
        constructor($scope: ICasinoBankingScope,
            private commonDataService: common.services.CommonDataService,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private exportService: services.ExportService,
            private settings: common.IBaseSettings,
            private $stateParams: any,
            private $filter: any,
            protected $rootScope: any,
            private accountService: services.AccountService) {
            super($scope);

            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-seven-banking-grid' || e.targetScope.gridId === 'kt-banking-grid') {
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
                            item.chips = (item.chips);
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
            this.$scope.userTypes = [];
            this.$scope.transactionType = [];
            this.$scope.search = { status: "2", name: '', username: '' };
        }

        public loadInitialData(): void {
            if (this.$stateParams.memberid) {
                this.$scope.userid = this.$stateParams.memberid
            }
            else {
                this.getUserId();
            }
            this.fillUserTypes();
            this.loadTransactionTypes();

            var status: any = common.enums.UserStatus;
            this.$scope.userStatus = common.helpers.Utility.enumToArray<common.enums.UserStatus>(status);
            this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });
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
            this.$scope.userTypes.push({ id: common.enums.UserType.SuperAdmin, name: 'SA' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Admin, name: 'AD' });
            this.$scope.userTypes.push({ id: common.enums.UserType.SuperMaster, name: 'SM' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Master, name: 'MA' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Agent, name: 'AG' });
            this.$scope.userTypes.push({ id: common.enums.UserType.Player, name: 'PL' });
            this.$scope.userTypes.push({ id: common.enums.UserType.PLS, name: 'PLS' });
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
                return found[0].name;
            }
        }

        private getUserStatus(status: any): string {
            return common.enums.UserStatus[status];
        }

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
                    this.refreshGrid();
                }
            });
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
            };
            var model = { params: params, id: this.$scope.userid, searchQuery: searchModel };
            return this.accountService.getCasinoMembersForBanking(model);
        }

        public exportBanking(params: any, exportType: any): any {
            var searchModel = {
                name: this.$scope.search.name,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
            };
            var model = { params: params, id: this.$scope.userid, exportType: exportType, searchQuery: searchModel };
            return this.exportService.getCasinoChildBalanceinfo(model);
        }

        private submitDW(): void {
            var gridItems: any[] = [];
            angular.copy(this.$scope.gridItems, gridItems);
            var dw = gridItems.filter((a: any) => { return a.chips && a.chips != 0 });
            dw.forEach((c: any) => {
                if (c.chips.length > 0) {
                    c.chips = parseFloat(c.chips.replaceAll(',', ''));
                }
                c.chips = (c.chips);
            });
            var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
            if (model) {
                this.accountService.DWForCasino(model)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.password = '';
                            this.$scope.$broadcast('refreshGridStayOnPage');
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                    });
            }
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
                    this.$scope.$broadcast('refreshGridStayOnPage');
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
                    t.chips = (t.chips);
                });
                var dw = tf.filter((t: any) => { return t.chips && t.chips != 0; });
                var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
                if (model) {
                    this.accountService.DWForCasino(model)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.password = '';
                                this.$scope.$broadcast('refreshGridStayOnPage');
                            }
                            this.toasterService.showMessages(response.messages, 3000);
                        });
                }
            }
        }

        public resetCriteria(): void {
            this.$scope.search = { status: "2", name: '', username: '', };
            this.refreshGrid();
        }
    }

    angular.module('intranet.master').controller('casinoBankingCtrl', CasinoBankingCtrl);
}