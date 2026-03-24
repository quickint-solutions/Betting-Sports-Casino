module intranet.master {
    export interface ILiveUsersScope extends intranet.common.IScopeBase {
        search: any;
        userTypes: any[];
    }

    export class LiveUsersCtrl extends intranet.common.ControllerBase<ILiveUsersScope>
    {
        constructor($scope: ILiveUsersScope,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private websiteService: services.WebsiteService,
            private tokenService: services.TokenService) {
            super($scope);

            this.$scope.search = { username: '', ipAddress: '', iMEI: '', device: '' };

            

            super.init(this);
        }

        public loadInitialData(): void {
            this.$scope.userTypes = [];
            this.fillUserTypes();
        }

        private fillUserTypes(): void {
            this.$scope.userTypes = super.getUserTypes();
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length > 0) {
                return found[0].name;
            }
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters, searchQuery: this.$scope.search };
            return this.tokenService.getLiveToken(model);
        }


        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public resetCriteria(): void {
            this.$scope.search = { Username: '', IpAddress: '', IMEI: '', Device: '',  };
            this.refreshGrid();
        }

    }

    angular.module('intranet.master').controller('liveUsersCtrl', LiveUsersCtrl);
}