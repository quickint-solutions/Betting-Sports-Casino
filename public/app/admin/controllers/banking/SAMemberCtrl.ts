module intranet.admin {

    export interface ISAMemberScope extends intranet.common.IScopeBase {
        fromSA: boolean;
        userTypes: any[];
        userTree: any[];
        currentUsername: string;
    }

    export class SAMemberCtrl extends intranet.common.ControllerBase<ISAMemberScope>
        implements common.init.IInit {
        constructor($scope: ISAMemberScope,
            private userService: services.UserService,
            private $stateParams: any,
            private $location: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.fromSA = true;
            this.$scope.userTypes = [];
            this.$scope.userTree = [];
        }

        public loadInitialData(): void {
            this.fillUserTypes();
            this.getUserTree();
        }

        private fillUserTypes(): void {
            this.$scope.userTypes = super.getUserTypes();
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length>0) {
                return found[0].name;
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
                                var parent = result.parent;
                                while (parent) {
                                    this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                    if (parent.parent) { parent = parent.parent; }
                                    else { parent = null; }
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

        private isActive(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
        }

    }
    angular.module('intranet.admin').controller('sAMemberCtrl', SAMemberCtrl);
}