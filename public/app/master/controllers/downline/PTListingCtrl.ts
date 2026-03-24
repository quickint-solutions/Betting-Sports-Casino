module intranet.master {

    export interface IPTListingScope extends intranet.common.IScopeBase {
        userTree: any[];
        parentId: any;
        parentUserType: any;

        downlineList: any[];
        uplineList: any[];
        uplineTree: any[];
        ptConfigList: any[];

        allSelected: boolean;

        promiseItem: any;
        userList: any[];
        search: any;

        ptCodes: any[];
    }

    export class PTListingCtrl extends intranet.common.ControllerBase<IPTListingScope>
        implements common.init.IInit {
        constructor($scope: IPTListingScope,
            private settings: common.IBaseSettings,
            private userService: services.UserService,
            private modalService: common.services.ModalService,
            private $state: any,
            private commonDataService: common.services.CommonDataService,
            private $stateParams: any,
            private $location: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userTree = [];
            this.$scope.downlineList = [];
            this.$scope.uplineList = [];
            this.$scope.uplineTree = [];
            this.$scope.parentId = this.$stateParams.memberid ? this.$stateParams.memberid : this.$rootScope.current.userId;
            this.$scope.userList = [];
            this.$scope.search = {};
            this.$scope.ptConfigList = [];
        }

        public loadInitialData(): void {
            var code: any = common.enums.PTCode;
            this.$scope.ptCodes = common.helpers.Utility.enumToArray<common.enums.PTCode>(code);

            if (this.$stateParams.memberid) this.getUserTree();

            this.getParentUserPT();
            this.getDownlinePt();
        }

        private getPTName(code: any): string {
            var result = '';
            var index = common.helpers.Utility.IndexOfObject(this.$scope.ptCodes, 'id', code);
            if (index >= 0) { result = this.$scope.ptCodes[index].name; }
            return result;
        }

        private haveChild(id: any): any {
            return id < common.enums.UserType.Player;
        }

        private shortname(usertype: any): any {
            return super.getUserTypesShort(usertype);
        }

        private getUserTree(): void {
            var promise: ng.IHttpPromise<any>;
            promise = this.userService.getParentsByUserId(this.$scope.parentId);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    var result = response.data;
                    if (result) {
                        this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType, short: super.getUserTypesShort(result.userType) });
                        var parent = result.parent;
                        while (parent) {
                            this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType, short: super.getUserTypesShort(parent.userType) });
                            if (parent.parent) { parent = parent.parent; }
                            else { parent = null; }
                        }
                        this.$scope.userTree = this.$scope.userTree.reverse();
                        //this.$scope.userTree.splice(0, 1);

                    }
                }
            });
        }

        private getParentUserPT(): void {
            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser && loggeduser.id == this.$scope.parentId && loggeduser.ptConfigs) {
                this.$scope.parentUserType = loggeduser.userType;
                angular.forEach(loggeduser.ptConfigs, (pt: any) => {
                    var obj = {
                        code: pt.code,
                        name: this.getPTName(pt.code),
                        maxpt: pt.givePt
                    };
                    this.$scope.ptConfigList.push(obj);
                });
            } else {
                this.userService.getUserById(this.$scope.parentId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success && response.data) {
                            this.$scope.parentUserType = response.data.userType;
                            angular.forEach(response.data.ptConfigs, (pt: any) => {
                                var obj = {
                                    code: pt.code,
                                    name: this.getPTName(pt.code),
                                    maxpt: pt.givePt
                                };
                                this.$scope.ptConfigList.push(obj);
                            });
                        }
                    });
            }
        }

        private setUplineTree(): void {
            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser) {
                this.$scope.uplineTree = super.getUserTypeForPT(loggeduser.userType);
            }
        }

        public getDownlinePt(): void {
            this.$scope.downlineList.splice(0);
            this.setUplineTree();
            var promise: ng.IHttpPromise<any>;
            promise = this.userService.getDownlinePt(this.$scope.parentId, (this.$stateParams.userid ? this.$stateParams.userid : 0));
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (response.data && response.data.downline) {
                        this.$scope.downlineList = response.data.downline;
                        if (response.data.upline) {
                            this.$scope.uplineList = response.data.upline;
                        }
                    }
                }
            });
        }

        private allMemberSelectionChanged(all: boolean = false): void {
            if (all) {
                this.$scope.downlineList.forEach((a: any) => { a.selected = this.$scope.allSelected; });
            }
            else {
                var result = this.$scope.downlineList.every((a: any) => { return a.selected == true; });
                this.$scope.allSelected = result;
            }
        }

        private editBulkPT(): void {
            var downlineList = this.$scope.downlineList.filter((d: any) => { return d.selected == true; })

            var modal = new common.helpers.CreateModal();
            modal.data = {
                parentId: this.$scope.parentId,
                readonly: false,
                bulkEdit: true,
                downlineList: downlineList,
                userType: this.$scope.parentUserType
            }

            var usertype = this.$rootScope.current.usertype;
            if (this.$scope.userTree.length > 0) { usertype = this.$scope.userTree[this.$scope.userTree.length - 1].userType; }
            var usershort = super.getUserTypesShort(usertype + 1);

            modal.header = downlineList.length + " " + usershort + (downlineList.length > 1 ? 's' : '') + " selected";

            modal.bodyUrl = this.settings.ThemeName + '/master/downline/bulk-edit-pt-modal.html';
            modal.controller = 'editPTModalCtrl';
            modal.size = 'lg';
            if (modal.data.readonly) modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getDownlinePt();
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
                        this.$scope.userList = response.data || [];
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
                this.$state.go('master.ptlist', { memberid: this.$scope.search.selectedUser.parentId, userid: this.$scope.search.selectedUser.id });
            }
        }
    }
    angular.module('intranet.master').controller('pTListingCtrl', PTListingCtrl);
}