var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SystemLogCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, systemLogService, settingService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.systemLogService = systemLogService;
                this.settingService = settingService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    logLevel: '-1',
                    serverName: '',
                    fromDate: new Date(),
                    toDate: new Date(new Date().setDate(new Date().getDate() + 1))
                };
            }
            loadInitialData() {
                var levels = intranet.common.enums.LogLevel;
                this.$scope.logLevels = intranet.common.helpers.Utility.enumToArray(levels);
                this.$scope.logLevels.splice(0, 0, { id: -1, name: '-- Select Log Level --' });
            }
            getLogLevel(level) {
                return intranet.common.enums.LogLevel[level];
            }
            viewLog(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'System Logs';
                modal.data = item;
                modal.size = 'lg';
                modal.options.actionButton = '';
                modal.bodyUrl = this.settings.ThemeName + '/admin/website/view-system-log.html';
                modal.controller = 'viewSystemLogModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            clearLog() {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.systemLogService.clearLog()
                            .success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            getItems(params, filters) {
                var searchquery = {};
                if (this.$scope.search.logLevel > 0) {
                    searchquery.logLevel = this.$scope.search.logLevel;
                }
                if (this.$scope.search.serverName) {
                    searchquery.serverName = this.$scope.search.serverName;
                }
                searchquery.fromDate = this.$scope.search.fromDate;
                searchquery.toDate = this.$scope.search.toDate;
                var model = { params: params, filters: filters, searchQuery: searchquery };
                return this.systemLogService.getLogList(model);
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search.logLevel = '-1';
                this.$scope.search.serverName = undefined;
                this.$scope.search.fromDate = new Date();
                this.$scope.search.toDate = new Date(new Date().setDate(new Date().getDate() + 1));
                this.refreshGrid();
            }
        }
        admin.SystemLogCtrl = SystemLogCtrl;
        angular.module('intranet.admin').controller('systemLogCtrl', SystemLogCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SystemLog.js.map