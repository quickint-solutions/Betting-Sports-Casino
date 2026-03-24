module intranet.services {

    export class PaymentService {
        constructor(private baseService: common.services.BaseService,
            private $filter: any) {
        }



        public paytmDeposit(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/paytmdeposit', data);
        }

        public paytmWithdrawal(data: any): ng.IHttpPromise<any> {
            data.amount = this.$filter('toGLC')(data.amount);
            return this.baseService.post('payment/paytmwithdrawal', data);
        }

        public getPaytmWithdrawal(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getpaytmwithdrawal', data);
        }
        public availableToWithdraw(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getwithdrawalamount');
        }

        public getAllPaytmWithdrawal(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getallpaytmwithdrawal', data);
        }

        public confirmPaytmWithdrawal(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/paytmwithdrawalconfirm', data);
        }

        public addBankDetails(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/addbankdetails', data);
        }

        public updateBankDetails(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/updatebankdetails', data);
        }
        public getBankDetails(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getbankdetails');
        }
        public deleteBankDetails(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('payment/deletebankdetails/' + id);
        }
        public changeBankStatus(id: any, isActive: any): ng.IHttpPromise<any> {
            return this.baseService.get('payment/changeactivebank/' + id + '/' + isActive);
        }

        public initgameokpay(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/initgameokpay', data,{ timeout: this.baseService.reportTime });
        }
        public initgameokpayout(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/initgameokpayout', data, { timeout: this.baseService.reportTime });
        }

        public addGameOkPayment(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/addgameokpay', data);
        }

        public rollbackDeposit(requestid: any): ng.IHttpPromise<any> {
            return this.baseService.get('payment/rollbackdeposit/' + requestid);
        }
    }

    angular.module('intranet.services').service('paymentService', PaymentService);
}