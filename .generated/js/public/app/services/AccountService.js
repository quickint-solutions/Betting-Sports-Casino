var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class AccountService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            IN(data) {
                return this.baseService.post('account/in', data, { timeout: this.baseService.reportTime });
            }
            OUT(data) {
                return this.baseService.post('account/out', data, { timeout: this.baseService.reportTime });
            }
            transferIn(data) {
                return this.baseService.post('account/transferin', data, { timeout: this.baseService.reportTime });
            }
            transferOut(data) {
                return this.baseService.post('account/transferout', data, { timeout: this.baseService.reportTime });
            }
            getMembersForBanking(data) {
                return this.baseService.post('account/getchildbalanceinfo', data, { timeout: this.baseService.reportTime });
            }
            getDownline(data) {
                return this.baseService.post('account/downline', data, { timeout: this.baseService.reportTime });
            }
            getDownlineExport(data) {
                return this.baseService.post('account/downlineexport', data, { timeout: this.baseService.reportTime });
            }
            getTransfer(data) {
                return this.baseService.post('account/transfer', data, { timeout: this.baseService.reportTime });
            }
            updateCreditRef(data) {
                return this.baseService.post('account/updatecreditref', data);
            }
            getBalance() {
                return this.baseService.get('account/getbalance', { timeout: this.baseService.reportTime });
            }
            getAccountStatement(data) {
                return this.baseService.post('account/getaccountstatement', data, { timeout: this.baseService.reportTime });
            }
            getAccountStatementExport(data) {
                return this.baseService.post('account/getaccountstatementexport', data, { timeout: this.baseService.reportTime });
            }
            getBonusStatement(data) {
                return this.baseService.post('account/getbonusstatement', data, { timeout: this.baseService.reportTime });
            }
            getSettleSccountStatement(data) {
                return this.baseService.post('account/getsettleaccountstatement', data, { timeout: this.baseService.reportTime });
            }
            getTransferStatement(data) {
                return this.baseService.post('account/gettransferstatement', data, { timeout: this.baseService.reportTime });
            }
            getTransferStatementExport(data) {
                return this.baseService.post('account/gettransferstatementexport', data, { timeout: this.baseService.reportTime });
            }
            getCreditStatement(data) {
                return this.baseService.post('account/getCreditstatement', data, { timeout: this.baseService.reportTime });
            }
            getPLStatement(data) {
                return this.baseService.post('account/getplstatement', data, { timeout: this.baseService.reportTime });
            }
            getMasterBalanceDetail(userId) {
                return this.baseService.get('account/getbalancedetail/' + userId, { timeout: this.baseService.reportTime });
            }
            updateCasinoCreditRef(data) {
                return this.baseService.post('account/updatecasinocreditref', data, { timeout: this.baseService.reportTime });
            }
            getCasinoMembersForBanking(data) {
                return this.baseService.post('account/getcasinochildbalanceinfo', data, { timeout: this.baseService.reportTime });
            }
            getCasinoMasterBalanceDetail() {
                return this.baseService.get('account/getcasinobalancedetail', { timeout: this.baseService.reportTime });
            }
            DWForCasino(data) {
                return this.baseService.post('account/dwc', data, { timeout: this.baseService.reportTime });
            }
            DWForCasinoBySA(data) {
                return this.baseService.post('account/dwwac', data, { timeout: this.baseService.reportTime });
            }
            getCasinoStatement(data) {
                return this.baseService.post('account/getcasinostatement', data, { timeout: this.baseService.reportTime });
            }
            getSettleCasinoStatement(data) {
                return this.baseService.post('account/getsettlecasinostatement', data, { timeout: this.baseService.reportTime });
            }
            getB2CSummary(data) {
                return this.baseService.post('account/getb2csummary', data, { timeout: this.baseService.reportTime });
            }
            getB2CTransactions(data) {
                return this.baseService.post('account/getdwtransaction', data, { timeout: this.baseService.reportTime });
            }
            getBonusTransaction(data) {
                return this.baseService.post('account/getbonustransaction', data, { timeout: this.baseService.reportTime });
            }
            getInOutActivity(userid) {
                return this.baseService.get('account/getinoutactivity/' + userid, { timeout: this.baseService.reportTime });
            }
            getCasinoActivity(userid) {
                return this.baseService.get('account/getcasinoactivity/' + userid, { timeout: this.baseService.reportTime });
            }
            getParentStatus(userid) {
                return this.baseService.get('account/getparentstatus/' + userid, { timeout: this.baseService.reportTime });
            }
            removeLedger(id) {
                return this.baseService.get('account/removeledger/' + id);
            }
            getReferralBalance(id) {
                return this.baseService.get('account/getreferralbalance/' + id);
            }
            getReferralStatement(data) {
                return this.baseService.post('account/getreferralstatement', data, { timeout: this.baseService.reportTime });
            }
            withdrawalReferralLedger() {
                return this.baseService.get('account/withdrawalreferralledger');
            }
            startFairexPayment() {
                return this.baseService.get('payment/fairxpay', { timeout: this.baseService.reportTime });
            }
            startFairexPayout(data) {
                return this.baseService.post('payment/addoffpayoutrequest', data, { timeout: this.baseService.reportTime });
            }
            addOffPayInRequest(data) {
                return this.baseService.post('payment/addoffpayinrequest', data, { timeout: this.baseService.reportTime });
            }
            getOffPayout(data) {
                return this.baseService.post('payment/getoffpayout', data, { timeout: this.baseService.reportTime });
            }
            getPaymorPayout(data) {
                return this.baseService.post('payment/getpaymorpayout ', data, { timeout: this.baseService.reportTime });
            }
            getFairexPayin(data) {
                return this.baseService.post('payment/getfairxpayin', data, { timeout: this.baseService.reportTime });
            }
            validateDepositOffer(data) {
                return this.baseService.post('payment/validatedepositoffer', data, { timeout: this.baseService.reportTime });
            }
            changeOffPayoutRequestStatus(data) {
                return this.baseService.post('payment/changeoffpayoutrequeststatus', data, { timeout: this.baseService.reportTime });
            }
            changeOffPayinRequestStatus(data) {
                return this.baseService.post('payment/changeoffpayinrequeststatus', data, { timeout: this.baseService.reportTime });
            }
            startSkrillPayment(data) {
                return this.baseService.post('payment/skrillpay', data, { timeout: this.baseService.reportTime });
            }
            startNetellerPayment(data) {
                return this.baseService.post('payment/netellerpay', data, { timeout: this.baseService.reportTime });
            }
            startNetellerPayout(data) {
                return this.baseService.post('payment/netellerpayout', data, { timeout: this.baseService.reportTime });
            }
            getOffPayIn(data) {
                return this.baseService.post('payment/getoffpayin', data, { timeout: this.baseService.reportTime });
            }
            getOffPayInExport(data) {
                return this.baseService.post('payment/getoffpayinexport', data, { timeout: this.baseService.reportTime });
            }
            getOffPayOutExport(data) {
                return this.baseService.post('payment/getoffpayoutexport', data, { timeout: this.baseService.reportTime });
            }
            getPinWalletPayIn(data) {
                return this.baseService.post('payment/getpinwalletpayin', data, { timeout: this.baseService.reportTime });
            }
            getGameokTransactions(data) {
                return this.baseService.post('payment/getgameokpayin', data, { timeout: this.baseService.reportTime });
            }
            getUserBankDetails() {
                return this.baseService.get('payment/getuserbankdetails', { timeout: this.baseService.reportTime });
            }
            getRecentOffPayIn() {
                return this.baseService.get('payment/getrecentoffpayin', { timeout: this.baseService.reportTime });
            }
            getRecentOffPayOut() {
                return this.baseService.get('payment/getrecentoffpayout', { timeout: this.baseService.reportTime });
            }
            getPayInOutSlip(imageid) {
                return this.baseService.get('payment/getpayinoutslip/' + imageid, { timeout: this.baseService.reportTime });
            }
            getRecentNowPaymentIn() {
                return this.baseService.get('payment/getrecentnowpayin', { timeout: this.baseService.reportTime });
            }
            getOnRampPaymentIn() {
                return this.baseService.get('payment/getrecentgameokpay/true', { timeout: this.baseService.reportTime });
            }
            getOnRampPaymentOut() {
                return this.baseService.get('payment/getrecentgameokpay/false', { timeout: this.baseService.reportTime });
            }
            getRecentPaymorPayin() {
                return this.baseService.get('payment/getrecentpaymorpayin', { timeout: this.baseService.reportTime });
            }
            getRecentPaymorPayout() {
                return this.baseService.get('payment/getrecentpaymorpayout', { timeout: this.baseService.reportTime });
            }
            cancelOfflineWIthdrawal(id) {
                return this.baseService.get('payment/cancelpayoutrequest/' + id, { timeout: this.baseService.reportTime });
            }
            getRecentPinWalletPayIn() {
                return this.baseService.get('payment/getrecentpinwalletpayin', { timeout: this.baseService.reportTime });
            }
            completeNetellerPayment(data, headers) {
                var url = 'https://api.paysafe.com/paymenthub/v1/payments';
                return this.baseService.outsidePost(url, data, headers);
            }
            getPendingPayInOutCount() {
                return this.baseService.get('payment/getpendingpayinoutcount', { timeout: this.baseService.reportTime });
            }
            initNowPayment(data) {
                return this.baseService.post('payment/initnowpay', data, { timeout: this.baseService.reportTime });
            }
            pinWalletPayIn(data) {
                return this.baseService.post('payment/pinwalletpayin', data, { timeout: this.baseService.reportTime });
            }
            processPinWalletWithdrawal(data) {
                return this.baseService.post('payment/processpinwalletwithdrawal', data, { timeout: this.baseService.reportTime });
            }
            processPaymorPayout(data) {
                return this.baseService.post('payment/processpaymorpayout', data, { timeout: this.baseService.reportTime });
            }
            paymorPayin(data) {
                return this.baseService.post('payment/paymorpayin', data, { timeout: this.baseService.reportTime });
            }
            paymorPayOut(data) {
                return this.baseService.post('payment/paymorpayout', data, { timeout: this.baseService.reportTime });
            }
            getPaymorSummary(data) {
                return this.baseService.post('payment/getpaymorpayinbyagent', data, { timeout: this.baseService.reportTime });
            }
            validateIFSC(ifsc) {
                var url = "https://bank-apis.justinclicks.com/API/V1/IFSC/" + ifsc;
                return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
            }
        }
        services.AccountService = AccountService;
        angular.module('intranet.services').service('accountService', AccountService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AccountService.js.map