var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class MemberCtrl extends intranet.common.ControllerBase {
            constructor($scope, userService, $state, $stateParams, $location) {
                super($scope);
                this.userService = userService;
                this.$state = $state;
                this.$stateParams = $stateParams;
                this.$location = $location;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.fromMember = true;
                this.$scope.userTypes = [];
                this.$scope.userTree = [];
            }
            loadInitialData() {
                this.fillUserTypes();
                this.getUserTree();
                if (this.$state.current.name == 'master.lotusmember' && this.$stateParams.memberid) {
                    this.$state.go('master.lotusmember.activity', { memberid: this.$stateParams.memberid });
                }
            }
            fillUserTypes() {
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperAdmin, name: 'SA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Admin, name: 'AD' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.SuperMaster, name: 'SM' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Master, name: 'MA' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Agent, name: 'AG' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.Player, name: 'PL' });
                this.$scope.userTypes.push({ id: intranet.common.enums.UserType.PLS, name: 'PLS' });
            }
            getUserTypeShort(usertype) {
                var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
                if (found.length > 0) {
                    return found[0].name;
                }
            }
            getUserTree() {
                if (this.$stateParams.memberid) {
                    this.userService.getParentsByUserId(this.$stateParams.memberid)
                        .success((response) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                var parent = result.parent;
                                while (parent) {
                                    this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                    if (parent.parent) {
                                        parent = parent.parent;
                                    }
                                    else {
                                        parent = null;
                                    }
                                }
                                if (this.$scope.userTree.length > 0) {
                                    this.$scope.currentUsername = this.$scope.userTree[0].name;
                                    this.$scope.userTree = this.$scope.userTree.reverse();
                                }
                            }
                        }
                    });
                }
            }
            isActive(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
            }
        }
        master.MemberCtrl = MemberCtrl;
        angular.module('intranet.master').controller('memberCtrl', MemberCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MemberCtrl.js.map