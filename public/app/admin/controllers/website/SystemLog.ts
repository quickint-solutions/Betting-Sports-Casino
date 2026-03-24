module intranet.admin {

    export interface ISystemLogScope extends intranet.common.IScopeBase {
        search: any;
        logLevels: any[];
    }

    export class SystemLogCtrl extends intranet.common.ControllerBase<ISystemLogScope>
        implements common.init.IInit {
        constructor($scope: ISystemLogScope,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private systemLogService: services.SystemLogService,
            private settingService: services.SettingService) {
            super($scope);


            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                logLevel: '-1',
                serverName: '',
                fromDate: new Date(),
                toDate: new Date(new Date().setDate(new Date().getDate() + 1))
            };
        }

        public loadInitialData(): void {

            var levels: any = common.enums.LogLevel;
            this.$scope.logLevels = common.helpers.Utility.enumToArray<common.enums.LogLevel>(levels);
            this.$scope.logLevels.splice(0, 0, { id: -1, name: '-- Select Log Level --' });
        }

        private getLogLevel(level: any): string {
            return common.enums.LogLevel[level];
        }

        private viewLog(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'System Logs';
            modal.data = item;
            modal.size = 'lg';
            modal.options.actionButton = '';
            modal.bodyUrl = this.settings.ThemeName + '/admin/website/view-system-log.html';
            modal.controller = 'viewSystemLogModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private clearLog(): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.systemLogService.clearLog()
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                }
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = {};
            if (this.$scope.search.logLevel > 0) { searchquery.logLevel = this.$scope.search.logLevel; }
            if (this.$scope.search.serverName) { searchquery.serverName = this.$scope.search.serverName; }
            searchquery.fromDate = this.$scope.search.fromDate;
            searchquery.toDate = this.$scope.search.toDate;

            var model = { params: params, filters: filters, searchQuery: searchquery };
            return this.systemLogService.getLogList(model);
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private resetCriteria(): void {
            this.$scope.search.logLevel = '-1';
            this.$scope.search.serverName = undefined;
            this.$scope.search.fromDate = new Date();
            this.$scope.search.toDate = new Date(new Date().setDate(new Date().getDate() + 1));
            this.refreshGrid();
        }
    }

    angular.module('intranet.admin').controller('systemLogCtrl', SystemLogCtrl);
}