namespace intranet.common.directives {
    class KTMessagesController extends ControllerBase<IKTMessagesScope>
    {
        constructor($scope: IKTMessagesScope, private settings: intranet.common.IBaseSettings) {
            super($scope);

            this.$scope.themeName = this.settings.ThemeName;
        }

        public hasMessages(): boolean {
            return (this.$scope.messages && this.$scope.messages.length > 0);
        }

        public hasSuccessMessages(): boolean {
            return this.hasMessagesForType(messaging.ResponseMessageType.Success);
        }

        public hasInfoMessages(): boolean {
            return this.hasMessagesForType(messaging.ResponseMessageType.Info);
        }

        public hasWarningMessages(): boolean {
            return this.hasMessagesForType(messaging.ResponseMessageType.Warning);
        }

        public hasValidationMessages(): boolean {
            return this.hasMessagesForType(messaging.ResponseMessageType.Validation);
        }

        public hasErrorMessages(): boolean {
            return this.hasMessagesForType(messaging.ResponseMessageType.Error);
        }
        public hasConfirmMessages(): boolean {
            return this.hasMessagesForType(messaging.ResponseMessageType.Confirmation);
        }

        private hasMessagesForType(typeMessage: messaging.ResponseMessageType): boolean {
            return this.hasMessages() && this.$scope.messages.filter(r => r.responseMessageType === typeMessage).length > 0;
        }
    }

    angular.module('kt.components')
        .controller('KTMessagesController', KTMessagesController);

    angular.module('kt.components')
        .directive('ktMessages', () => {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    messages: '=?'
                },
                templateUrl: 'app/common/components/messages/messages.html',
                controller: 'KTMessagesController'
            };
        });
}