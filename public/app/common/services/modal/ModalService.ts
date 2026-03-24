namespace intranet.common.services {

    export class ModalService {

        private options: ModalOptions;
        private defaults: ModalDefaults;

        /* @ngInject */
        constructor(private $uibModal: ng.ui.bootstrap.IModalService, private settings: IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper) {
            this.options = new ModalOptions();
            this.options.header = 'Proceed?';
            this.options.body = 'Do you really want to proceed?';


            this.defaults = new ModalDefaults();
            this.defaults.backdrop = this.settings.ThemeName == 'dimd2' ? true : false;
            this.defaults.keyboard = true;
            this.defaults.modalFade = true;

            this.getDefault();
        }

        private getDefault(): void {
            var userType = 0;
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result && result.user) {
                userType = result.user.userType;
            }
            if (this.settings.ThemeName != 'betfair') {
                if (this.settings.ThemeName == 'sports') {
                    this.defaults.templateUrl = 'app/common/services/modal/sports-modal.html';
                }
                else if (this.settings.ThemeName == 'dimd2') {
                    this.defaults.templateUrl = 'app/common/services/modal/dimd2-modal.html';
                }
                else if (userType == common.enums.UserType.Admin || userType == common.enums.UserType.SuperMaster
                    || userType == common.enums.UserType.Master || userType == common.enums.UserType.Agent) {
                    this.defaults.templateUrl = 'app/common/services/modal/lotus-modal-master.html';
                } else {
                    this.defaults.templateUrl = 'app/common/services/modal/lotus-modal.html';
                }
            }

            else {
                this.defaults.templateUrl = 'app/common/services/modal/betfair-modal.html';
            }
        }

        public show(options?: ModalOptions, defaults?: ModalDefaults): ng.IPromise<ModalResult> {
            this.getDefault();
            var tempDefaults = angular.extend({}, this.defaults, defaults);
            var tempOptions = angular.extend({}, this.options, options);

            if (!tempDefaults.controller) {
                tempDefaults.controller = ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                    $scope.modalOptions = tempOptions;
                    $scope.modalOptions.ok = result => {
                        $uibModalInstance.close(ModalResult.OK);
                    };
                    $scope.modalOptions.close = result => {
                        $uibModalInstance.close(ModalResult.Cancel);
                    };
                }];
            }

            return this.$uibModal.open(tempDefaults).result;
        }

        public showWithOptions(options?: ModalOptions, defaults?: ModalDefaults): ng.IPromise<ModalResult> {
            this.getDefault();
            var tempDefaults = angular.extend({}, this.defaults, defaults);
            var tempOptions = angular.extend({}, this.options, options);

            if (!tempDefaults.controller) {
                tempDefaults.controller = ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
                    $scope.modalOptions = tempOptions;
                    $scope.modalOptions.ok = result => {
                        $uibModalInstance.close({ data: tempOptions, button: ModalResult.OK });
                    };
                    $scope.modalOptions.close = result => {
                        $uibModalInstance.close({ data: null, button: ModalResult.Cancel });
                    };
                }];
            }

            return this.$uibModal.open(tempDefaults).result;
        }


        public showConfirmations(messages: intranet.common.messaging.ResponseMessage[], confirmTitle?: string, confirmActionTitle?: string, confirmCancelTitle?: string): ng.IPromise<ModalResult> {

            var confirmationMessages = messages
                .filter((m) => m.responseMessageType === intranet.common.messaging.ResponseMessageType.Confirmation)
                .map((m) => m.text)
                .join(' <br /> ');

            var options = new ModalOptions();
            options.closeButton = confirmCancelTitle || 'common.button.no';
            options.actionButton = confirmActionTitle || 'common.button.yes';
            options.header = confirmTitle || 'Proceed?';
            options.bodyHtml = confirmationMessages;
            options.icon = 'save';

            return this.show(options);
        }

        public showConfirmation(message: any, confirmTitle?: string): ng.IPromise<ModalResult> {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Confirm';
            modal.bodyHtml = message;
            modal.options.actionButton = 'Proceed';
            modal.options.closeButton = 'Reject';
            modal.controller = 'rulesModalCtrl';
            modal.SetModal();


            return this.show(modal.options, modal.modalDefaults);
        }

        public showDeleteConfirmation(): ng.IPromise<ModalResult> {

            var options = new ModalOptions();
            options.closeButton = 'common.button.no';
            options.actionButton = 'common.button.yes';
            options.header = 'common.header.deleteconfirmation';
            options.body = 'common.deleteitem.message';
            options.icon = '';

            return this.show(options);
        }

        public showMessages(messages: intranet.common.messaging.ResponseMessage[]): ng.IPromise<ModalResult> {
            var msgs = messages
                .map((m) => m.text)
                .join(' <br /> ');
            if (msgs.length > 0) {
                var options = new ModalOptions();
                options.actionButton = 'common.button.ok';
                options.closeButton = '';
                options.header = 'common.confirmdialog.errors';
                options.bodyHtml = msgs;
                options.icon = 'exclamation';

                return this.show(options);
            }
        }
    }

    angular.module('intranet.common.services').service('modalService', ModalService);
}