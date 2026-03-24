module intranet.services {

    export class AccountService {
        constructor(private baseService: common.services.BaseService) {
        }

        public IN(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/in', data, { timeout: this.baseService.reportTime });
        }
        public OUT(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/out', data, { timeout: this.baseService.reportTime });
        }

        public transferIn(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/transferin', data, { timeout: this.baseService.reportTime });
        }
        public transferOut(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/transferout', data, { timeout: this.baseService.reportTime });
        }

        public getMembersForBanking(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getchildbalanceinfo', data, { timeout: this.baseService.reportTime });
        }

        public getDownline(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/downline', data, { timeout: this.baseService.reportTime });
        }
        public getDownlineExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/downlineexport', data, { timeout: this.baseService.reportTime });
        }
        public getTransfer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/transfer', data, { timeout: this.baseService.reportTime });
        }

        public updateCreditRef(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/updatecreditref', data);
        }

        public getBalance(): ng.IHttpPromise<any> {
            return this.baseService.get('account/getbalance', { timeout: this.baseService.reportTime });
        }

        public getAccountStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getaccountstatement', data, { timeout: this.baseService.reportTime });
        }
        public getAccountStatementExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getaccountstatementexport', data, { timeout: this.baseService.reportTime });
        }

        public getBonusStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getbonusstatement', data, { timeout: this.baseService.reportTime });
        }
        public getSettleSccountStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getsettleaccountstatement', data, { timeout: this.baseService.reportTime });
        }

        public getTransferStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/gettransferstatement', data, { timeout: this.baseService.reportTime });
        }
        public getTransferStatementExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/gettransferstatementexport', data, { timeout: this.baseService.reportTime });
        }
        public getCreditStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getCreditstatement', data, { timeout: this.baseService.reportTime });
        }
        public getPLStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getplstatement', data, { timeout: this.baseService.reportTime });
        }

        public getMasterBalanceDetail(userId: any): ng.IHttpPromise<any> {
            return this.baseService.get('account/getbalancedetail/' + userId, { timeout: this.baseService.reportTime });
        }


        public updateCasinoCreditRef(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/updatecasinocreditref', data, { timeout: this.baseService.reportTime });
        }

        public getCasinoMembersForBanking(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getcasinochildbalanceinfo', data, { timeout: this.baseService.reportTime });
        }
        public getCasinoMasterBalanceDetail(): ng.IHttpPromise<any> {
            return this.baseService.get('account/getcasinobalancedetail', { timeout: this.baseService.reportTime });
        }

        public DWForCasino(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/dwc', data, { timeout: this.baseService.reportTime });
        }
        public DWForCasinoBySA(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/dwwac', data, { timeout: this.baseService.reportTime });
        }

        public getCasinoStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getcasinostatement', data, { timeout: this.baseService.reportTime });
        }
        public getSettleCasinoStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getsettlecasinostatement', data, { timeout: this.baseService.reportTime });
        }

        public getB2CSummary(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getb2csummary', data, { timeout: this.baseService.reportTime });
        }
        public getB2CTransactions(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getdwtransaction', data, { timeout: this.baseService.reportTime });
        }
        public getBonusTransaction(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getbonustransaction', data, { timeout: this.baseService.reportTime });
        }

        public getInOutActivity(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('account/getinoutactivity/' + userid, { timeout: this.baseService.reportTime });
        }
        public getCasinoActivity(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('account/getcasinoactivity/' + userid, { timeout: this.baseService.reportTime });
        }

        public getParentStatus(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('account/getparentstatus/' + userid, { timeout: this.baseService.reportTime });
        }

        public removeLedger(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('account/removeledger/' + id);
        }

        public getReferralBalance(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('account/getreferralbalance/' + id);
        }

        public getReferralStatement(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('account/getreferralstatement', data, { timeout: this.baseService.reportTime });
        }

        public withdrawalReferralLedger(): ng.IHttpPromise<any> {
            return this.baseService.get('account/withdrawalreferralledger');
        }


        public startFairexPayment(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/fairxpay', { timeout: this.baseService.reportTime });
        }
        public startFairexPayout(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/addoffpayoutrequest', data, { timeout: this.baseService.reportTime });
        }
        public addOffPayInRequest(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/addoffpayinrequest', data, { timeout: this.baseService.reportTime });
        }
        public getOffPayout(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getoffpayout', data, { timeout: this.baseService.reportTime });
        }
        public getPaymorPayout(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getpaymorpayout ', data, { timeout: this.baseService.reportTime });
        }
        public getFairexPayin(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getfairxpayin', data, { timeout: this.baseService.reportTime });
        }
        public validateDepositOffer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/validatedepositoffer', data, { timeout: this.baseService.reportTime });
        }


        public changeOffPayoutRequestStatus(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/changeoffpayoutrequeststatus', data, { timeout: this.baseService.reportTime });
        }

        public changeOffPayinRequestStatus(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/changeoffpayinrequeststatus', data, { timeout: this.baseService.reportTime });
        }

        public startSkrillPayment(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/skrillpay', data, { timeout: this.baseService.reportTime });
        }

        public startNetellerPayment(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/netellerpay', data, { timeout: this.baseService.reportTime });
        }
        public startNetellerPayout(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/netellerpayout', data, { timeout: this.baseService.reportTime });
        }

        public getOffPayIn(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getoffpayin', data, { timeout: this.baseService.reportTime });
        }
        public getOffPayInExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getoffpayinexport', data, { timeout: this.baseService.reportTime });
        }
        public getOffPayOutExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getoffpayoutexport', data, { timeout: this.baseService.reportTime });
        }
        public getPinWalletPayIn(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getpinwalletpayin', data, { timeout: this.baseService.reportTime });
        }
        public getGameokTransactions(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getgameokpayin', data, { timeout: this.baseService.reportTime });
        }

        public getUserBankDetails(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getuserbankdetails', { timeout: this.baseService.reportTime });
        }

        public getRecentOffPayIn(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentoffpayin', { timeout: this.baseService.reportTime });
        }
        public getRecentOffPayOut(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentoffpayout', { timeout: this.baseService.reportTime });
        }
        public getPayInOutSlip(imageid: any): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getpayinoutslip/' + imageid, { timeout: this.baseService.reportTime });
        }
        public getRecentNowPaymentIn(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentnowpayin', { timeout: this.baseService.reportTime });
        }
        public getOnRampPaymentIn(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentgameokpay/true', { timeout: this.baseService.reportTime });
        }
        public getOnRampPaymentOut(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentgameokpay/false', { timeout: this.baseService.reportTime });
        }
        public getRecentPaymorPayin(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentpaymorpayin', { timeout: this.baseService.reportTime });
        }
       
        public getRecentPaymorPayout(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentpaymorpayout', { timeout: this.baseService.reportTime });
        }

        public cancelOfflineWIthdrawal(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('payment/cancelpayoutrequest/' + id, { timeout: this.baseService.reportTime });
        }
        public getRecentPinWalletPayIn(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getrecentpinwalletpayin', { timeout: this.baseService.reportTime });
        }

        public completeNetellerPayment(data: any, headers: any): ng.IHttpPromise<any> {
            var url = 'https://api.paysafe.com/paymenthub/v1/payments'
            return this.baseService.outsidePost(url, data, headers);
        }

        public getPendingPayInOutCount(): ng.IHttpPromise<any> {
            return this.baseService.get('payment/getpendingpayinoutcount', { timeout: this.baseService.reportTime });
        }

        public initNowPayment(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/initnowpay', data, { timeout: this.baseService.reportTime });
        }

        public pinWalletPayIn(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/pinwalletpayin', data, { timeout: this.baseService.reportTime });
        }

        public processPinWalletWithdrawal(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/processpinwalletwithdrawal', data, { timeout: this.baseService.reportTime });
        }

        public processPaymorPayout(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/processpaymorpayout', data, { timeout: this.baseService.reportTime });
        }

        public paymorPayin(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/paymorpayin', data, { timeout: this.baseService.reportTime });
        }
        public paymorPayOut(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/paymorpayout', data, { timeout: this.baseService.reportTime });
        }
        public getPaymorSummary(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('payment/getpaymorpayinbyagent', data, { timeout: this.baseService.reportTime });
        }

        public validateIFSC(ifsc: any): ng.IHttpPromise<any> {
            var url = "https://bank-apis.justinclicks.com/API/V1/IFSC/" + ifsc;
            return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
        }
    }

    angular.module('intranet.services').service('accountService', AccountService);
}