var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class PTListingCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, userService, modalService, $state, commonDataService, $stateParams, $location) {
                super($scope);
                this.settings = settings;
                this.userService = userService;
                this.modalService = modalService;
                this.$state = $state;
                this.commonDataService = commonDataService;
                this.$stateParams = $stateParams;
                this.$location = $location;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userTree = [];
                this.$scope.downlineList = [];
                this.$scope.uplineList = [];
                this.$scope.uplineTree = [];
                this.$scope.parentId = this.$stateParams.memberid ? this.$stateParams.memberid : this.$rootScope.current.userId;
                this.$scope.userList = [];
                this.$scope.search = {};
                this.$scope.ptConfigList = [];
            }
            loadInitialData() {
                var code = intranet.common.enums.PTCode;
                this.$scope.ptCodes = intranet.common.helpers.Utility.enumToArray(code);
                if (this.$stateParams.memberid)
                    this.getUserTree();
                this.getParentUserPT();
                this.getDownlinePt();
            }
            getPTName(code) {
                var result = '';
                var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.ptCodes, 'id', code);
                if (index >= 0) {
                    result = this.$scope.ptCodes[index].name;
                }
                return result;
            }
            haveChild(id) {
                return id < intranet.common.enums.UserType.Player;
            }
            shortname(usertype) {
                return super.getUserTypesShort(usertype);
            }
            getUserTree() {
                var promise;
                promise = this.userService.getParentsByUserId(this.$scope.parentId);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        var result = response.data;
                        if (result) {
                            this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType, short: super.getUserTypesShort(result.userType) });
                            var parent = result.parent;
                            while (parent) {
                                this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType, short: super.getUserTypesShort(parent.userType) });
                                if (parent.parent) {
                                    parent = parent.parent;
                                }
                                else {
                                    parent = null;
                                }
                            }
                            this.$scope.userTree = this.$scope.userTree.reverse();
                        }
                    }
                });
            }
            getParentUserPT() {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser && loggeduser.id == this.$scope.parentId && loggeduser.ptConfigs) {
                    this.$scope.parentUserType = loggeduser.userType;
                    angular.forEach(loggeduser.ptConfigs, (pt) => {
                        var obj = {
                            code: pt.code,
                            name: this.getPTName(pt.code),
                            maxpt: pt.givePt
                        };
                        this.$scope.ptConfigList.push(obj);
                    });
                }
                else {
                    this.userService.getUserById(this.$scope.parentId)
                        .success((response) => {
                        if (response.success && response.data) {
                            this.$scope.parentUserType = response.data.userType;
                            angular.forEach(response.data.ptConfigs, (pt) => {
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
            setUplineTree() {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.uplineTree = super.getUserTypeForPT(loggeduser.userType);
                }
            }
            getDownlinePt() {
                this.$scope.downlineList.splice(0);
                this.setUplineTree();
                var promise;
                promise = this.userService.getDownlinePt(this.$scope.parentId, (this.$stateParams.userid ? this.$stateParams.userid : 0));
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
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
            allMemberSelectionChanged(all = false) {
                if (all) {
                    this.$scope.downlineList.forEach((a) => { a.selected = this.$scope.allSelected; });
                }
                else {
                    var result = this.$scope.downlineList.every((a) => { return a.selected == true; });
                    this.$scope.allSelected = result;
                }
            }
            editBulkPT() {
                var downlineList = this.$scope.downlineList.filter((d) => { return d.selected == true; });
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    parentId: this.$scope.parentId,
                    readonly: false,
                    bulkEdit: true,
                    downlineList: downlineList,
                    userType: this.$scope.parentUserType
                };
                var usertype = this.$rootScope.current.usertype;
                if (this.$scope.userTree.length > 0) {
                    usertype = this.$scope.userTree[this.$scope.userTree.length - 1].userType;
                }
                var usershort = super.getUserTypesShort(usertype + 1);
                modal.header = downlineList.length + " " + usershort + (downlineList.length > 1 ? 's' : '') + " selected";
                modal.bodyUrl = this.settings.ThemeName + '/master/downline/bulk-edit-pt-modal.html';
                modal.controller = 'editPTModalCtrl';
                modal.size = 'lg';
                if (modal.data.readonly)
                    modal.options.actionButton = '';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.getDownlinePt();
                    }
                });
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.userList = response.data || [];
                            if (this.$scope.userList && this.$scope.userList.length > 0) {
                                this.$scope.userList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.userList.splice(0);
                }
            }
            userSelected() {
                if (this.$scope.search.selectedUser) {
                    this.$state.go('master.ptlist', { memberid: this.$scope.search.selectedUser.parentId, userid: this.$scope.search.selectedUser.id });
                }
            }
        }
        master.PTListingCtrl = PTListingCtrl;
        angular.module('intranet.master').controller('pTListingCtrl', PTListingCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PTListingCtrl.js.map