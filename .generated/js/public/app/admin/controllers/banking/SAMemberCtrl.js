var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAMemberCtrl extends intranet.common.ControllerBase {
            constructor($scope, userService, $stateParams, $location) {
                super($scope);
                this.userService = userService;
                this.$stateParams = $stateParams;
                this.$location = $location;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.fromSA = true;
                this.$scope.userTypes = [];
                this.$scope.userTree = [];
            }
            loadInitialData() {
                this.fillUserTypes();
                this.getUserTree();
            }
            fillUserTypes() {
                this.$scope.userTypes = super.getUserTypes();
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
        admin.SAMemberCtrl = SAMemberCtrl;
        angular.module('intranet.admin').controller('sAMemberCtrl', SAMemberCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAMemberCtrl.js.map