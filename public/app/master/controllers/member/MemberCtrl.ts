module intranet.master {

    export interface IMemberScope extends intranet.common.IScopeBase {
        fromMember: boolean;
        userTypes: any[];
        userTree: any[];
        currentUsername: string;
    }

    export class MemberCtrl extends intranet.common.ControllerBase<IMemberScope>
        implements common.init.IInit {
        constructor($scope: IMemberScope,
            private userService: services.UserService,
            private $state: any,
            private $stateParams: any,
            private $location: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.fromMember = true;
            this.$scope.userTypes = [];
            this.$scope.userTree = [];
        }

        public loadInitialData(): void {
            this.fillUserTypes();
            this.getUserTree();

            if (this.$state.current.name == 'master.lotusmember' && this.$stateParams.memberid) {
                this.$state.go('master.lotusmember.activity', { memberid: this.$stateParams.memberid });
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

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
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
    angular.module('intranet.master').controller('memberCtrl', MemberCtrl);
}