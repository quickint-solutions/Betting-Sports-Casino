var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class PaymentService {
            constructor(baseService, $filter) {
                this.baseService = baseService;
                this.$filter = $filter;
            }
            paytmDeposit(data) {
                return this.baseService.post('payment/paytmdeposit', data);
            }
            paytmWithdrawal(data) {
                data.amount = this.$filter('toGLC')(data.amount);
                return this.baseService.post('payment/paytmwithdrawal', data);
            }
            getPaytmWithdrawal(data) {
                return this.baseService.post('payment/getpaytmwithdrawal', data);
            }
            availableToWithdraw() {
                return this.baseService.get('payment/getwithdrawalamount');
            }
            getAllPaytmWithdrawal(data) {
                return this.baseService.post('payment/getallpaytmwithdrawal', data);
            }
            confirmPaytmWithdrawal(data) {
                return this.baseService.post('payment/paytmwithdrawalconfirm', data);
            }
            addBankDetails(data) {
                return this.baseService.post('payment/addbankdetails', data);
            }
            updateBankDetails(data) {
                return this.baseService.post('payment/updatebankdetails', data);
            }
            getBankDetails() {
                return this.baseService.get('payment/getbankdetails');
            }
            deleteBankDetails(id) {
                return this.baseService.get('payment/deletebankdetails/' + id);
            }
            changeBankStatus(id, isActive) {
                return this.baseService.get('payment/changeactivebank/' + id + '/' + isActive);
            }
            initgameokpay(data) {
                return this.baseService.post('payment/initgameokpay', data, { timeout: this.baseService.reportTime });
            }
            initgameokpayout(data) {
                return this.baseService.post('payment/initgameokpayout', data, { timeout: this.baseService.reportTime });
            }
            addGameOkPayment(data) {
                return this.baseService.post('payment/addgameokpay', data);
            }
            rollbackDeposit(requestid) {
                return this.baseService.get('payment/rollbackdeposit/' + requestid);
            }
        }
        services.PaymentService = PaymentService;
        angular.module('intranet.services').service('paymentService', PaymentService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PaymentNumberService.js.map