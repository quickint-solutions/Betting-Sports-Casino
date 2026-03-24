var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class BetfairAccountCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, betfairService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.betfairService = betfairService;
            }
            addEditBetfairAccount(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'admin.betfairaccount.edit.modal.header';
                    modal.data = {
                        id: item.id,
                        username: item.username,
                        password: item.password,
                        balance: item.balance,
                        isActive: item.isActive,
                        betfairAccountType: item.betfairAccountType,
                        appKey: item.appKey,
                        websiteId: item.websiteId
                    };
                }
                else {
                    modal.header = 'admin.betfairaccount.add.modal.header';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/betfair/add-betfair-account-modal.html';
                modal.controller = 'addBetfairAccountModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteBetfairAccount(id) {
                this.betfairService.deleteBetfairAccount(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getBetfairAccountType(accountType) {
                return intranet.common.enums.BetfairAccountType[accountType];
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.betfairService.getBetfairAccountList(model);
            }
        }
        admin.BetfairAccountCtrl = BetfairAccountCtrl;
        angular.module('intranet.admin').controller('betfairAccountCtrl', BetfairAccountCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetfairAccountCtrl.js.map