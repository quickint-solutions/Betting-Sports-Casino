module intranet.admin {
    export interface ISaLiveUsersScope extends intranet.common.IScopeBase {
        search: any;
        websites: any[];
        userTypes: any[];
    }

    export class SaLiveUsersCtrl extends intranet.common.ControllerBase<ISaLiveUsersScope>
    {
        constructor($scope: ISaLiveUsersScope,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private websiteService: services.WebsiteService,
            private tokenService: services.TokenService) {
            super($scope);

            this.$scope.search = { username: '', ipAddress: '', iMEI: '', device: '', websiteId: '', loginMax: '' };

            super.init(this);
        }

        public loadInitialData(): void {
            this.$scope.websites = [];
            this.$scope.userTypes = [];
            this.fillUserTypes();
            this.loadWebsites();
        }

        private loadWebsites(): void {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websites = response.data.map(function (a) { return { id: a.id, name: a.name }; });
                        this.$scope.websites.splice(0, 0, { id: '-1', name: 'All' });
                        this.$scope.search.websiteId = '-1';
                    }
                });
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
            var search: any = {}
            angular.copy(this.$scope.search, search);
            if (this.$scope.search.websiteId == '-1') { search.websiteId = ''; }
            var model = { params: params, filters: filters, searchQuery: search };
            return this.tokenService.getLiveToken(model);
        }

        public removeToken(item: any) {
            this.tokenService.deleteTokenById(item.userId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.refreshGrid();
                    }
                });
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public resetCriteria(): void {
            this.$scope.search = { username: '', ipAddress: '', iMEI: '', device: '', websiteId: '-1', loginMax: '' };
            this.refreshGrid();
        }

    }

    angular.module('intranet.admin').controller('saLiveUsersCtrl', SaLiveUsersCtrl);
}