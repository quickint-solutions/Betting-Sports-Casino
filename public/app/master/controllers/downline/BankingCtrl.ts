module intranet.master {

    export interface IBankingScope extends intranet.common.IScopeBase {
        userid: any;
        currentUserType: any;
        password: any;
        availableToTake: any;
        userTree: any;
        search: any;
        parentId: any;

        gridItems: any[];
        allSelected: boolean;
        anySelected: boolean;

        userList: any[];
        promiseItem: any;
    }

    export class BankingCtrl extends intranet.common.ControllerBase<IBankingScope>
        implements common.init.IInit {
        constructor($scope: IBankingScope,
            private commonDataService: common.services.CommonDataService,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private exportService: services.ExportService,
            private settings: common.IBaseSettings,
            private userService: services.UserService,
            private $stateParams: any,
            private $filter: any,
            private $q: ng.IQService,
            private $state: any,
            protected $rootScope: any,
            private accountService: services.AccountService) {
            super($scope);


            this.$scope.$on('$destroy', () => {
                // newPageLoader();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.anySelected = false;
            this.$scope.userTree = [];
            this.$scope.userList = [];

            this.$scope.search = {
                userId: this.$stateParams.userid
            };

        }

        public loadInitialData(): void {
            if (this.$stateParams.memberid) {
                this.$scope.parentId = this.$stateParams.memberid;
                this.getUserTree();
            }
            else {
                this.getUserData();
            }
        }

        private haveChild(id: any): any {
            return id < common.enums.UserType.Player;
        }

        private getUserData(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                //this.$scope.userid = result.id;
                this.$scope.parentId = result.id;
                this.$scope.currentUserType = result.userType;
            }
        }

        private getUserTree(): void {
            if (this.$stateParams.memberid) {
                this.userService.getParentsByUserId(this.$stateParams.memberid)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                this.$scope.currentUserType = result.userType;
                                this.$scope.userid = result.id;
                                var parent = result.parent;
                                while (parent) {
                                    this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                    if (parent.parent) { parent = parent.parent; }
                                    else { parent = null; }
                                }
                                this.$scope.userTree = this.$scope.userTree.reverse();
                                //this.$scope.userTree.splice(0, 1);
                            }
                        }
                    });
            }
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchModel = {
                name: this.$scope.search.name,
                username: this.$scope.search.username,
                userId: this.$scope.search.userId,
            };
            var model = {
                params: params,
                searchQuery: searchModel,
                id: this.$scope.parentId
            };
            var defer = this.$q.defer();
            this.accountService.getTransfer(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.availableToTake = response.data.availableToTake;
                        defer.resolve(response.data);
                    } else { defer.reject(); }
                }).error(() => { defer.reject(); });
            return defer.promise;
        }

        public exportBanking(params: any, exportType: any): any {
            var model = { params: params, id: this.$scope.userid, exportType: exportType };
            return this.exportService.downline(model);
        }

        private transferChip(gritem: any): void {
            var item: any = {};
            angular.copy(gritem, item);
            if (item.balanceInfo.take > 0) { item.dwType = 'D'; item.chips = this.$filter('toRate')(item.balanceInfo.take); }
            if (item.balanceInfo.give > 0) { item.dwType = 'W'; item.chips = this.$filter('toRate')(item.balanceInfo.give); }


            var modal = new common.helpers.CreateModal();
            modal.header = this.$filter('translate')('transfer.update.modal.header');
            if (item.username) { modal.header = "Transfer for " + item.username; }
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

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.userService.findMembers(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.userList = response.data;
                        if (this.$scope.userList && this.$scope.userList.length > 0) {
                            this.$scope.userList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.userList.splice(0);
            }
        }

        private userSelected(): void {
            if (this.$scope.search.selectedUser) {
                this.$state.go('master.banking', { memberid: this.$scope.search.selectedUser.parentId, userid: this.$scope.search.selectedUser.id });
            } else {
                this.$state.go('master.banking', { memberid: '', userid: '' });
            }
        }

        private updateCreditRef(userid, creditRef): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'creditref.update.modal.header';
            modal.data = {
                current: creditRef,
                userId: userid,
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

        //private submitDW(): void {
        //    var gridItems: any[] = [];
        //    angular.copy(this.$scope.gridItems, gridItems);
        //    var dw = gridItems.filter((a: any) => { return a.chips && a.chips != 0 });
        //    dw.forEach((c: any) => {
        //        if (c.chips.length > 0) {
        //            c.chips = parseFloat(c.chips.replaceAll(',', ''));
        //        }
        //        c.chips = this.$filter('toGLC')(c.chips);
        //    });
        //    var model = { isTransfer: true, password: this.$scope.password, requestList: dw };
        //    if (model) {
        //        this.accountService.DW(model)
        //            .success((response: common.messaging.IResponse<any>) => {
        //                if (response.success) {
        //                    this.$scope.password = '';
        //                    this.$scope.$broadcast('refreshGridStayOnPage');
        //                }
        //                this.toasterService.showMessages(response.messages, 3000);
        //            });
        //    }
        //}

        private allMemberSelectionChanged(all: boolean = false): void {
            if (all) {
                this.$scope.gridItems.forEach((a: any) => {
                    if (a.balanceInfo.take > 0 || a.balanceInfo.give > 0)
                        a.selected = this.$scope.allSelected;
                });
            }
            else {
                var result = this.$scope.gridItems.filter((b: any) => { return b.balanceInfo.take > 0 || b.balanceInfo.give > 0; }).every((a: any) => { return a.selected == true; });
                this.$scope.allSelected = result;
            }
            this.$scope.anySelected = this.$scope.gridItems.some((a: any) => { return a.selected == true; });
        }

        private transferAllChip(): void {
            var transferIds = this.$scope.gridItems.filter((a: any) => { return a.selected; }).map((a: any) => { return a.id; });
            var modal = new common.helpers.CreateModal();
            modal.header = 'Bulk Transfer';
            modal.size = 'sm';
            modal.data = transferIds;
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/transfer-all-modal.html';
            modal.controller = 'transferAllModalCtrl';
            modal.options.actionButton = 'Bulk Transfer';
            modal.options.modalClass = 'center';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    var response: any[] = result.data;
                    if (response && response.length > 0) {
                        var isAllDone = response.every((a: any) => { return a.status == true });
                        if (isAllDone) {
                            this.toasterService.showToastMessage(common.helpers.ToastType.Success, "Transfer Successfully!", 2000);
                        }
                        else {
                            this.showTransferFailed(response);
                        }
                    }
                    this.$scope.$broadcast('refreshGridStayOnPage');
                }
            });

        }

        private showTransferFailed(data: any[]): void {
            if (data.length > 0) {
                var bodyHtml = '';
                data.forEach((d: any) => {
                    if (!d.status) {
                        bodyHtml += ("<div>" + d.name + " - " + d.message + "</div><br/>");
                    }
                });

                var modal = new common.helpers.CreateModal();
                modal.header = 'Bulk Transfer';
                modal.size = 'sm';
                modal.bodyHtml = bodyHtml;
                modal.options.actionButton = '';
                modal.options.closeButton = '';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
        }

        public resetCriteria(): void {
            this.$scope.search = {};
            if (this.$stateParams.memberid)
                this.userSelected();
            else
                this.refreshGrid();
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
    }

    angular.module('intranet.master').controller('bankingCtrl', BankingCtrl);
}