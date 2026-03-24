var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTMessagesController extends common.ControllerBase {
                constructor($scope, settings) {
                    super($scope);
                    this.settings = settings;
                    this.$scope.themeName = this.settings.ThemeName;
                }
                hasMessages() {
                    return (this.$scope.messages && this.$scope.messages.length > 0);
                }
                hasSuccessMessages() {
                    return this.hasMessagesForType(common.messaging.ResponseMessageType.Success);
                }
                hasInfoMessages() {
                    return this.hasMessagesForType(common.messaging.ResponseMessageType.Info);
                }
                hasWarningMessages() {
                    return this.hasMessagesForType(common.messaging.ResponseMessageType.Warning);
                }
                hasValidationMessages() {
                    return this.hasMessagesForType(common.messaging.ResponseMessageType.Validation);
                }
                hasErrorMessages() {
                    return this.hasMessagesForType(common.messaging.ResponseMessageType.Error);
                }
                hasConfirmMessages() {
                    return this.hasMessagesForType(common.messaging.ResponseMessageType.Confirmation);
                }
                hasMessagesForType(typeMessage) {
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
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=messages-controller.js.map