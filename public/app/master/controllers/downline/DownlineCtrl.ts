module intranet.master {

    export interface IDownlineScope extends intranet.common.IScopeBase {
        userTypes: any[];
        parentId: any;
        gridItems: any[];

        currentUserType: any;
        loggedUserType: any;

        balance: any;

        userStatus: any[];
        search: any;

        editUser: any;
        userTree: any[];
        userList: any[];
        promiseItem: any;
        ptCodes: any[];

        haveFullAccess: boolean;
        showReferral: boolean;

        newMemberShortName: string;

        isBetfair: boolean;
        parentStatusList: any[];
    }

    export class DownlineCtrl extends intranet.common.ControllerBase<IDownlineScope>
        implements common.init.IInit {
        constructor($scope: IDownlineScope,
            private toasterService: intranet.common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private modalService: common.services.ModalService,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private ExportFactory: any,
            private $stateParams: any,
            private authorizationService: common.services.AuthorizationService,
            private $state: any,
            private permissionTypes: common.security.IPermissionTypes,
            private userService: services.UserService,
            private $filter: any,
            protected $rootScope: any,
            private settings: common.IBaseSettings) {
            super($scope);

            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-lotus-downline-grid') {
                    if (data && data.result.length > 0) {
                        //data.result.forEach((item: any) => {
                        //    item.ptConfigs = this.filterPTConfig(item.ptConfigs);
                        //});
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
            this.$scope.search = {
                status: '-1',
                userCode: '',
                username: '',
                userId: this.$stateParams.userid
            };
            this.$scope.editUser = {};
            this.$scope.userList = [];
            this.$scope.parentStatusList = [];
        }

        public loadInitialData(): void {
            this.$scope.haveFullAccess = this.hasFullAccess();
            this.$scope.userTree = [];

            this.commonDataService.getEventTypes();
            this.fillUserTypes();
            this.getLoggedUserId();

            if (this.$stateParams.memberid) {
                this.$scope.parentId = this.$stateParams.memberid;
                this.getUserTree();
            }
            else {
                this.getLoggedUserId(false);
                this.$scope.newMemberShortName = this.$rootScope.child.short;
            }

            var status: any = common.enums.UserStatus;
            this.$scope.userStatus = common.helpers.Utility.enumToArray<common.enums.UserStatus>(status);
            this.$scope.userStatus.splice(0, 0, { id: -1, name: '-- Select User Status --' });

            var code: any = common.enums.PTCode;
            this.$scope.ptCodes = common.helpers.Utility.enumToArray<common.enums.PTCode>(code);

            this.loadSupportDetail();
            this.getParentStatus();
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
                                this.$scope.newMemberShortName = this.getUserTypeShort(result.userType + 1);
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

        private getParentStatus() {
            this.accountService.getParentStatus(this.$scope.parentId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        angular.forEach(response.data, (d: any) => {
                            this.$scope.parentStatusList.push({
                                short: this.getUserTypeShort(d.userType),
                                status: d.status,
                                isLocked: d.bettingLock != 2
                            });
                        });
                    }
                });
        }

        private getLoggedUserId(onlyUserType: boolean = true): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                if (!onlyUserType) {
                    this.$scope.parentId = result.id;
                    this.$scope.currentUserType = result.userType;
                }
                this.$scope.loggedUserType = result.userType;
            }
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

        private haveChild(id: any): any {
            return id < common.enums.UserType.Player;
        }

        private loadSupportDetail() {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.commonDataService.getSupportDetails()
                    .then((data: any) => {
                        this.$scope.isBetfair = data.isBetfair;
                        this.$scope.showReferral = data.isRegisterEnabled && result.userType == common.enums.UserType.Master && this.$scope.currentUserType == common.enums.UserType.Master;
                    });
            }
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchModel = {
                userCode: this.$scope.search.userCode,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
                userId: this.$scope.search.userId,
            };
            var model = { params: params, id: this.$scope.parentId, searchQuery: searchModel };
            return this.accountService.getDownline(model);
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-lotus-downline-grid');
        }

        private changeBettingLock(item: any): void {
            var newLock = item.bettingLock == 2 ? true : false;
            this.modalService.showConfirmation("Are you sure you want to " + (newLock ? 'lock ' : 'unlock ') + item.userCode.toUpperCase() + " ?")
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        var modal = { userId: item.id, bettingLock: newLock };
                        this.userService.changeBettingLock(modal)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.$scope.$broadcast('refreshGridStayOnPage_kt-lotus-downline-grid');
                                }
                                this.toasterService.showMessages(response.messages);
                            });
                    }
                });
        }

        public resetCriteria(): void {
            this.$scope.search = {};
            if (this.$stateParams.memberid)
                this.userSelected();
            else
                this.refreshGrid();
        }

        private setBT(userId: any, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            if (this.$scope.currentUserType < common.enums.UserType.Agent) {
                modal.options.extraButton = 'common.button.applyall';
            }
            modal.data = userId;
            modal.header = this.$filter('translate')('admin.user.set.bt.modal.header');
            if (username) { modal.header = modal.header + " - " + username; }
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/bt-modal.html';
            modal.controller = 'bTModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }



        // lotus special
        private addMember(): void {
            this.$state.go('master.addmember', { parentid: this.$scope.parentId });
        }

        private editMember(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                userId: item.id,
                userType: item.userType,
                parentId: this.$scope.parentId,
            }

            modal.bodyUrl = this.settings.ThemeName + '/master/downline/edit-member-modal.html';
            modal.templateUrl = 'app/common/services/modal/lotus-modal-trans.html';
            modal.controller = 'editMemberModalCtrl';
            modal.size = 'md';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }

        private hasFullAccess(): boolean {
            if (this.commonDataService.isCPLogin()) { return this.authorizationService.hasClaimBoolean(this.permissionTypes.MANAGE_DOWNLINE_FULLACCESS); }
            else {
                return true;
            }
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
                this.$state.go('master.memberlist', { memberid: this.$scope.search.selectedUser.parentId, userid: this.$scope.search.selectedUser.id });
            } else {
                this.$state.go('master.memberlist', { memberid: '', userid: '' });
            }
        }

        private exportToExcel(): void {
            var searchModel = {
                name: this.$scope.search.name,
                username: this.$scope.search.username,
                status: this.$scope.search.status,
                userId: this.$scope.search.userId,
            };
            var model = { id: this.$scope.parentId, searchQuery: searchModel };
            var promise = this.accountService.getDownlineExport(model);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    var gridData = response.data;
                    if (gridData) {
                        var table: string = '';
                        var headerTD: string = '';
                        var contentTD: string = '';
                        var contentTR: string = '';

                        gridData.forEach((g: any, index: any) => {
                            if (index == 0) {
                                headerTD += common.helpers.CommonHelper.wrapTD("Login Name");
                                headerTD += common.helpers.CommonHelper.wrapTD("ID");
                                headerTD += common.helpers.CommonHelper.wrapTD("Betting Status");
                                headerTD += common.helpers.CommonHelper.wrapTD("Status");
                                headerTD += common.helpers.CommonHelper.wrapTD("Net Exposure");
                                headerTD += common.helpers.CommonHelper.wrapTD("Take");
                                headerTD += common.helpers.CommonHelper.wrapTD("Give");
                                headerTD += common.helpers.CommonHelper.wrapTD("Balance");
                                headerTD += common.helpers.CommonHelper.wrapTD("Credit Limit");
                                if (this.$scope.currentUserType != 4) headerTD += common.helpers.CommonHelper.wrapTD("Available Credit");
                                headerTD += common.helpers.CommonHelper.wrapTD("Created");
                                headerTD += common.helpers.CommonHelper.wrapTD("Last Login");
                                headerTD += common.helpers.CommonHelper.wrapTD("Last IP");
                                headerTD += common.helpers.CommonHelper.wrapTD("UTM Source");
                                table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                            }

                            contentTD = common.helpers.CommonHelper.wrapTD(g.username);
                            contentTD += common.helpers.CommonHelper.wrapTD(g.mobile ? g.mobile : g.userCode);
                            contentTD += common.helpers.CommonHelper.wrapTD(g.bettingLock == 2 ? 'Unlocked' : 'Locked');
                            if (g.status == 2) contentTD += common.helpers.CommonHelper.wrapTD('ACTIVE');
                            if (g.status == 3) contentTD += common.helpers.CommonHelper.wrapTD('INACTIVE');
                            if (g.status == 4) contentTD += common.helpers.CommonHelper.wrapTD('SUSPENDED');
                            if (g.status == 5) contentTD += common.helpers.CommonHelper.wrapTD('CLOSED');
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.exposure));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.take));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.give));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.balance));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.creditLimit));
                            if (this.$scope.currentUserType != 4) contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balanceInfo.availableCredit));

                            contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                            contentTD += common.helpers.CommonHelper.wrapTD(moment(g.lastLogin).format('DD/MM/YYYY HH:mm'));
                            contentTD += common.helpers.CommonHelper.wrapTD(g.lastLoginIp);
                            contentTD += common.helpers.CommonHelper.wrapTD(g.utmSource);
                            contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                        });
                        table += common.helpers.CommonHelper.wrapTBody(contentTR);
                        table = common.helpers.CommonHelper.wrapTable(table);

                        this.ExportFactory.tableStringToExcel(table, 'Agency Management - ' + this.$rootScope.child.short + ' Listing');
                    }
                }
            });
        }


        //referral
        private openReferralSetting(item) {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Update Referral Settings';
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/refer-modal.html';
            modal.controller = 'referModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = 'Close';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {

                }
            });
        }

        private openUserSetting(item) {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Settings';
            modal.data = { userId: item.id };
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/user-setting-modal.html';
            modal.controller = 'userSettingModalCtrl';
            modal.options.closeButton = 'Close';
            if (this.$scope.currentUserType != common.enums.UserType.Agent) {
                modal.options.extraButton = "Apply All";
            }

            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {

                }
            });
        }


        // older methods ****************
        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
                return found[0].name;
            }
        }

        private getUserStatus(status: any): string {
            return common.enums.UserStatus[status];
        }

        private setCommission(userId: any, username: string): void {
            var modal = new common.helpers.CreateModal();
            modal.data = { userId: userId, username: username, onlyCommission: true };
            modal.header = 'admin.user.set.commission.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/user-commission-modal.html';
            modal.controller = 'userCommissionModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private addPlayer(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'master.player.add.modal.header';
            modal.data = {
                userId: this.$scope.parentId,
            }

            modal.bodyUrl = this.settings.ThemeName + '/master/downline/add-player-modal.html';
            modal.controller = 'addPlayerModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }

        private updatePT(userid, pt, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.header = this.$filter('translate')('pt.update.modal.header');
            if (username) { modal.header = modal.header + " - " + username }
            modal.data = {
                current: pt,
                userId: userid,
            }
            modal.bodyUrl = this.settings.ThemeName + '/bookmaker/downline/change-pt-modal.html';
            modal.controller = 'changePTModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-downline-grid');
                }
            });
        }

        private addDW(userId: any, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.header = "Credit";
            if (username) { modal.header = modal.header + " - " + username }
            modal.data = { userId: userId, forMaster: true };
            modal.bodyUrl = this.settings.ThemeName + '/admin/user/dw-modal.html';
            modal.controller = 'dwModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-lotus-downline-grid');
                }
            });
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
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-downline-grid');
                }
            });
        }

        private changeUserStatus(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'member.change.status.modal.header';
            modal.data = {
                userId: item.id,
                userType: item.userType,
                status: item.status,
                name: item.username
            }
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/change-status-modal.html';
            modal.controller = 'changeStatusModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-downline-grid');
                    this.$scope.$broadcast('refreshGridStayOnPage_kt-lotus-downline-grid');
                }
            });
        }

        private updateBetConfig(userid, username: any = ''): void {
            var modal = new common.helpers.CreateModal();
            modal.options.extraButton = 'common.button.applyall';
            modal.header = this.$filter('translate')('betconfig.update.modal.header');
            if (username) { modal.header = modal.header + " - " + username }
            modal.data = userid;
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/bet-config-modal.html';
            modal.controller = 'betConfigModalCtrl';
            modal.size = 'lg';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private editPT(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                userId: item.user.id,
                username: item.user.username,
                userType: item.user.userType,
                name: item.user.name,
                parentId: this.$scope.parentId,
                readonly: this.$stateParams.memberid && this.$stateParams.memberid > 0 ? true : false
            }
            modal.header = "View/Update PT";
            if (item.user.username) { modal.header = modal.header + " - " + item.user.username }
            modal.bodyUrl = this.settings.ThemeName + '/master/downline/edit-pt-modal.html';
            modal.controller = 'editPTModalCtrl';
            modal.size = modal.data.readonly ? '' : 'lg';
            if (modal.data.readonly) modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }


    }

    angular.module('intranet.master').controller('downlineCtrl', DownlineCtrl);
}