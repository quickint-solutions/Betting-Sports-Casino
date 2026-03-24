var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PaymentGatewayCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, accountService, websiteService, $rootScope, paymentService, toasterService, isMobile, $timeout, $location, $sce, modalService, $stateParams, $state, $window, commonDataService, $filter) {
                super($scope);
                this.settings = settings;
                this.accountService = accountService;
                this.websiteService = websiteService;
                this.$rootScope = $rootScope;
                this.paymentService = paymentService;
                this.toasterService = toasterService;
                this.isMobile = isMobile;
                this.$timeout = $timeout;
                this.$location = $location;
                this.$sce = $sce;
                this.modalService = modalService;
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.$window = $window;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.depositFairxpayMessage = [];
                this.$scope.depositSkrillMessage = [];
                this.$scope.depositNetellerMessage = [];
                this.$scope.payoutFairexpayMessage = [];
                this.$scope.payoutNetellerMessage = [];
                this.$scope.payoutMode = [];
                this.$scope.offlineWithdrawalMessage = [];
                this.$scope.offlineDepositMessage = [];
                this.$scope.offerMessages = [];
                this.$scope.cryptoDepositMessage = [];
                this.$scope.onRampDepositMessage = [];
                this.$scope.onRampWithdrawalMessage = [];
                this.$scope.fairxpay = {};
                this.$scope.fairxpayPayout = {};
                this.$scope.fairxpayPayoutCash = {};
                this.$scope.skrill = {};
                this.$scope.neteller = {};
                this.$scope.netellerPayout = {};
                this.$scope.offlineDeposit = { conditionAgree: true };
                this.$scope.offlineWithdrawal = { type: 1, conditionAgree: true };
                this.$scope.offlineDWLimits = {};
                this.$scope.cryptoDeposit = {};
                this.$scope.onRampDeposit = {};
                this.$scope.onRampWithdrawal = {};
                this.$scope.loadderTemplate = this.commonDataService.mobile_market_loader_template;
                this.$scope.isLoaderActive = false;
                this.$scope.isPayoutLoaderActive = false;
                this.$scope.paymorDeposit = { conditionAgree: true };
                this.$scope.paymorDepositMessage = [];
                this.$scope.paymorWithdrawal = {};
                this.$scope.paymorWithdrawalMessage = [];
                this.$scope.onlyWhatsapp = this.settings.WebApp == 'punjab99';
                this.$scope.statusBaseUrl = this.$location.$$absUrl.split('#')[0];
                if (this.settings.WebApp == 'baazibook') {
                    this.$scope.depositStakeButtons = [500, 1000, 2500, 5000, 25000, 100000];
                }
                else {
                    this.$scope.depositStakeButtons = [100, 500, 1000, 5000, 10000, 50000];
                }
                this.$scope.currentWebApp = this.settings.WebApp;
            }
            loadInitialData() {
                this.$scope.payoutMode.push({ id: '', name: 'Select Payout Mode' });
                this.$scope.payoutMode.push({ id: 'imps', name: 'IMPS' });
                this.$scope.payoutMode.push({ id: 'neft', name: 'NEFT' });
                this.$scope.payoutMode.push({ id: 'rtgs', name: 'RTGS' });
                this.getSupportDetail();
            }
            setOCRScanner() {
                var self = this;
                const inputFile = document.querySelector('#utr-receipt');
                inputFile.addEventListener('change', () => {
                    self.$scope.offlineDeposit.scannedUTR = '';
                    self.$timeout(() => {
                        self.$scope.offlineDeposit.progress = 0;
                        let img = document.querySelector('#utr-img');
                        Tesseract.recognize(img, 'eng', { logger: m => this.utrScanningProgress(m, self) }).then((res) => res).then(({ data }) => {
                            if (data.text.length > 0) {
                                var utrid = data.text.match(/(\s([0-9]{12})\s)/);
                                if (utrid && utrid.length > 0) {
                                    self.$scope.offlineDeposit.scannedUTR = utrid[0];
                                }
                                else {
                                    self.$scope.offlineDeposit.scannedUTR = -1;
                                }
                            }
                            else {
                                self.$scope.offlineDeposit.scannedUTR = -1;
                            }
                            self.$scope.$apply();
                        });
                    }, 1000);
                });
            }
            utrScanningProgress(m, self) {
                self.$scope.offlineDeposit.progressText = 'Scanning';
                if (m.status === 'recognizing text') {
                    self.$scope.offlineDeposit.progress = Math.round(m.progress * 100);
                    self.$scope.offlineDeposit.progressText = 'Recognizing';
                    if (m.progress >= 1) {
                        self.$scope.offlineDeposit.progressText = 'Scanning complete';
                    }
                }
                self.$scope.$apply();
            }
            getPGinfo() {
                this.websiteService.getPGInfo()
                    .success((response) => {
                    if (response.success) {
                        if (this.$stateParams.tab) {
                            this.$scope.selectedPaymentTab = this.$stateParams.tab;
                        }
                        if (this.commonDataService.isOBD()) {
                            this.$scope.selectedPaymentTab = 5;
                        }
                        if (response.data) {
                            angular.copy(response.data.fairEx, this.$scope.fairxpay);
                            angular.copy(response.data.fairEx, this.$scope.fairxpayPayout);
                            angular.copy(response.data.skrill, this.$scope.skrill);
                            angular.copy(response.data.neteller, this.$scope.neteller);
                            angular.copy(response.data.neteller, this.$scope.netellerPayout);
                            angular.copy(response.data.nowPayment, this.$scope.cryptoDeposit);
                            angular.copy(response.data.gameOkCrypto, this.$scope.onRampDeposit);
                            angular.copy(response.data.offlinePaymentConfig, this.$scope.offlineDWLimits);
                            angular.copy(response.data.paymor, this.$scope.paymorDeposit);
                            if (response.data.isEnabledNeteller) {
                                this.$scope.selectedPaymentTab = 3;
                            }
                            if (response.data.isEnabledSkrill) {
                                this.$scope.selectedPaymentTab = 2;
                            }
                            if (response.data.isEnabledFairEx) {
                                this.$scope.selectedPaymentTab = 0;
                            }
                            if (response.data.isEnabledPinWallet) {
                                this.$scope.isPinWalletEnabled = true;
                                this.$scope.pinWalletDepositDObj = response.data.pinWallet;
                            }
                            if (response.data.isEnabledGameOkCrypto) {
                                this.$scope.selectedPaymentTab = 6;
                            }
                            if (response.data.isEnabledPaymor) {
                                this.$scope.selectedPaymentTab = 7;
                            }
                        }
                    }
                }).finally(() => {
                    if (this.commonDataService.isOBD()) {
                        this.getOfflineDetail();
                        this.loadUserBankDetails();
                        this.setOCRScanner();
                    }
                });
            }
            getSupportDetail() {
                this.commonDataService.getSupportDetails().then((res) => {
                    if (res.supportDetails && res.supportDetails.length > 3) {
                        var d = JSON.parse(res.supportDetails);
                        this.$scope.whatsapp = d.pwhatsapp;
                        if (d.fairxpay_d_whatsapp) {
                            this.$scope.fairxpayWhatsapp = {};
                            this.$scope.fairxpayWhatsapp.dwhatsapp = d.fairxpay_d_whatsapp;
                        }
                        if (d.fairxpay_w_whatsapp) {
                            if (!this.$scope.fairxpayWhatsapp) {
                                this.$scope.fairxpayWhatsapp = {};
                            }
                            this.$scope.fairxpayWhatsapp.wwhatsapp = d.fairxpay_w_whatsapp;
                        }
                    }
                    if (res.isB2C || this.$scope.currentWebApp == 'sportsbar11') {
                        this.$scope.offlineWithdrawal.type = 2;
                        this.$scope.offlineOnlyBankWithdrawal = true;
                    }
                    else {
                        this.$scope.offlineWithdrawal.type = 1;
                    }
                }).finally(() => { this.getPGinfo(); });
            }
            clearObjects() {
                this.$scope.skrill = {};
                this.$scope.neteller = {};
                this.$scope.netellerPayout = {};
                this.$scope.cryptoDeposit = {};
                this.$scope.isLoaderActive = false;
                this.$scope.isPayoutLoaderActive = false;
            }
            watchPopup(wnd) {
                var startChecking = (p) => {
                    if (p.closed) {
                        console.log('closed');
                        this.$scope.isLoaderActive = false;
                        this.$scope.isPayoutLoaderActive = false;
                        this.$timeout(() => {
                            this.$rootScope.$emit("balance-changed");
                        }, 3000);
                    }
                    else {
                        this.$timeout(() => { startChecking(p); }, 1000);
                    }
                };
                startChecking(wnd);
            }
            statusReceived(data) {
                this.$scope.depositFairxpayMessage.splice(0);
                this.$scope.depositSkrillMessage.splice(0);
                this.$scope.depositNetellerMessage.splice(0);
                this.$scope.cryptoDepositMessage.splice(0);
                this.$scope.isLoaderActive = false;
                this.$scope.isPayoutLoaderActive = false;
                var msg = '';
                if (data.status == 1) {
                    this.clearObjects();
                    msg = new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Deposit was success, check your balance.', null);
                }
                else {
                    msg = new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Deposit failed, contact your payment provider or upline.', null);
                }
                if (this.$scope.selectedPaymentTab == 0) {
                    this.$scope.depositFairxpayMessage.push(msg);
                }
                if (this.$scope.selectedPaymentTab == 2) {
                    this.$scope.depositSkrillMessage.push(msg);
                }
                if (this.$scope.selectedPaymentTab == 3) {
                    this.$scope.depositNetellerMessage.push(msg);
                }
                if (this.$scope.selectedPaymentTab == 4) {
                    this.$scope.cryptoDepositMessage.push(msg);
                }
            }
            depositFairxpayNow() {
                this.accountService.startFairexPayment()
                    .success((response) => {
                    if (response.success) {
                        var url = 'https://fairxpay.io/?apikey=' + response.data.apiKey + '&data=' + response.data.data;
                        var body = document.getElementsByTagName('body')[0];
                        var payment = this.$window.open(this.$sce.trustAsUrl(url), "Deposit", "width=800px,height=600px,left=150,top=50");
                        this.watchPopup(payment);
                    }
                });
            }
            withdrawFairexpayNow() {
                this.$scope.payoutFairexpayMessage.splice(0);
                if (this.$scope.fairxpayPayout.upiId == '' && (this.$scope.fairxpayPayout.acNo == '' ||
                    this.$scope.fairxpayPayout.ifscCode == '' ||
                    this.$scope.fairxpayPayout.acName == '' ||
                    this.$scope.fairxpayPayout.bankName == '') && (this.$scope.fairxpayPayoutCash.cashNote == '')) {
                    this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Please fill up CASH NOTE or UPI or BANK ACCOUNT detail.', null));
                }
                else if (this.$scope.fairxpayPayout.amount <= 0) {
                    this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Withdrawal amount must be greater than 0', null));
                }
                else {
                    this.$scope.isPayoutLoaderActive = true;
                    var model = {};
                    angular.copy(this.$scope.fairxpayPayout, model);
                    model.amount = this.$filter('toGLC')(model.amount);
                    this.accountService.startFairexPayout(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your withdrawal request registered.', null));
                            this.$scope.fairxpayPayout = {};
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isPayoutLoaderActive = false;
                    });
                }
            }
            withdrawCashFairexpayNow() {
                this.$scope.payoutFairexpayMessage.splice(0);
                if (this.$scope.fairxpayPayoutCash.cashNote == '') {
                    this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Please fill up CASH NOTE or UPI or BANK ACCOUNT detail.', null));
                }
                else if (this.$scope.fairxpayPayoutCash.amount <= 0) {
                    this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Withdrawal amount must be greater than 0', null));
                }
                else {
                    this.$scope.isPayoutLoaderActive = true;
                    var model = {};
                    angular.copy(this.$scope.fairxpayPayoutCash, model);
                    model.amount = this.$filter('toGLC')(model.amount);
                    this.accountService.startFairexPayout(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your withdrawal request registered.', null));
                            this.$scope.fairxpayPayoutCash = {};
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.payoutFairexpayMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isPayoutLoaderActive = false;
                    });
                }
            }
            depositSkrillNow() {
                this.$scope.skrill.returnUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived', { status: 1 });
                this.$scope.skrill.returnUrlTarget = '_blank';
                this.$scope.skrill.returnUrlText = 'Return to ' + this.settings.Title;
                this.$scope.skrill.cancelUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived', { status: 0 });
                this.$scope.skrill.cancelUrlTarget = '_blank';
                this.$scope.skrill.logoUrl = this.$scope.statusBaseUrl + 'images/' + this.settings.WebApp + '/logo.png';
                this.$scope.isLoaderActive = true;
                this.accountService.startSkrillPayment(this.$scope.skrill)
                    .success((response) => {
                    if (response.success) {
                        this.openSkrillPage(response.data);
                    }
                }).error(() => { this.$scope.isLoaderActive = false; });
            }
            openSkrillPage(data) {
                var url = data.skrillUrl + '/?sid=' + data.sessionId;
                var payment = this.$window.open(this.$sce.trustAsUrl(url), "Skrill Checkout", "width=600,height=650,left=400,top=50");
                this.$window.setData = ((data) => {
                    console.log(data);
                    this.statusReceived(data);
                });
                this.watchPopup(payment);
            }
            depositNetellerNow() {
                this.$scope.isLoaderActive = true;
                this.$scope.neteller.defaultUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived');
                this.accountService.startNetellerPayment(this.$scope.neteller)
                    .success((response) => {
                    if (response.success) {
                        if (response.data.action == 'REDIRECT') {
                            this.sendRequestToNeteller(response.data);
                        }
                        else {
                            this.$scope.depositNetellerMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Something went wrong, please contact provider.', null));
                            this.$scope.isLoaderActive = false;
                        }
                    }
                }).error(() => { this.$scope.isLoaderActive = false; });
            }
            sendRequestToNeteller(data) {
                var url = data.links[0].href;
                var payment = this.$window.open(this.$sce.trustAsUrl(url), "Neteller Checkout", "width=600,height=650,left=400,top=50");
                this.$window.setData = ((data) => {
                    this.statusReceived(data);
                });
                this.watchPopup(payment);
            }
            withdrawNetellerNow() {
                this.$scope.isPayoutLoaderActive = true;
                this.$scope.netellerPayout.defaultUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived');
                this.accountService.startNetellerPayout(this.$scope.netellerPayout)
                    .success((response) => {
                    if (response.success) {
                        if (response.data.action == 'REDIRECT') {
                            this.sendRequestToNeteller(response.data);
                        }
                        else if (response.data.transactionType == 'STANDALONE_CREDIT') {
                            this.$scope.payoutNetellerMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your withdrawal request accepted with ref # ' + response.data.merchantRefNum, null));
                            this.$scope.isPayoutLoaderActive = false;
                        }
                        else {
                            this.$scope.payoutNetellerMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Info, 'Something went wrong, please contact provider.', null));
                            this.$scope.isPayoutLoaderActive = false;
                        }
                    }
                }).error(() => { this.$scope.isPayoutLoaderActive = false; });
            }
            getOfflineDetail() {
                this.paymentService.getBankDetails()
                    .success((response) => {
                    if (this.$scope.isPinWalletEnabled) {
                        response.data.splice(0, 0, { detailType: 999 });
                    }
                    this.$scope.offlineBankDetails = response.data;
                    this.$scope.selectedBankDetail = response.data[0];
                });
            }
            addStakes(s, obj) {
                if (!obj.amount) {
                    obj.amount = 0;
                }
                obj.amount = math.add(obj.amount, s);
                this.removeOffer();
            }
            depositOfflineNow() {
                this.$scope.offlineDepositMessage.splice(0);
                if ((!this.$scope.offlineDeposit.utrNo || this.$scope.offlineDeposit.utrNo == '')
                    && !this.$scope.offlineDeposit.payInSlip) {
                    this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Please fill up UTR detail or upload receipt.', null));
                }
                else if (this.$scope.offlineDeposit.amount <= 0) {
                    this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Deposit amount must be greater than 0', null));
                }
                else {
                    this.$scope.isLoaderActive = true;
                    var model = {};
                    if (this.$scope.offlineDeposit.utrNo) {
                        this.$scope.offlineDeposit.utrNo = this.$scope.offlineDeposit.utrNo.trim();
                    }
                    this.$scope.offlineDeposit.id = this.$scope.selectedBankDetail.id;
                    this.$scope.offlineDeposit.acNo = this.$scope.selectedBankDetail.acNo;
                    this.$scope.offlineDeposit.acHolder = this.$scope.selectedBankDetail.acHolder;
                    this.$scope.offlineDeposit.detailType = this.$scope.selectedBankDetail.detailType;
                    if (this.$scope.offlineDeposit.offer.id) {
                        this.$scope.offlineDeposit.offerId = this.$scope.offlineDeposit.offer.id;
                        this.$scope.offlineDeposit.bonusCode = this.$scope.offlineDeposit.offer.bonusCode;
                    }
                    angular.copy(this.$scope.offlineDeposit, model);
                    model.amount = this.$filter('toGLC')(model.amount);
                    this.accountService.addOffPayInRequest(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your deposit request registered.', null));
                            this.$scope.offlineDeposit = { conditionAgree: true };
                            this.$scope.offerMessages.splice(0);
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isLoaderActive = false;
                    });
                }
            }
            copyTxt(t) {
                this.commonDataService.copyText(t);
                this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Copied", 2000);
            }
            openUPILink() {
                var url = 'upi://pay?pa=' + this.$scope.selectedBankDetail.acNo + '&am=' + this.$scope.offlineDeposit.amount;
                var safeUrl = this.$sce.trustAsResourceUrl(url);
                var $a = $('<a>', {
                    href: safeUrl,
                    target: '_blank',
                });
                $(document.body).append($a);
                $a[0].click();
                $a.remove();
            }
            selectOfferFromModal(obj) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.settings.Title + ' Offers';
                modal.data = {
                    forSelection: 1
                };
                modal.options.actionButton = '';
                modal.bodyUrl = this.settings.ThemeName + '/home/account/select-offer-modal.html';
                modal.controller = 'selectOfferModalCtrl';
                modal.size = 'lg';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        obj.offer = result.data;
                        this.validateOffer(obj);
                    }
                });
            }
            removeOffer() {
                this.$scope.offlineDeposit.offer = {};
                this.$scope.cryptoDeposit.offer = {};
                this.$scope.offerMessages.splice(0);
            }
            validateOffer(obj) {
                if (this.$scope.offerCheckTimeout)
                    this.$timeout.cancel(this.$scope.offerCheckTimeout);
                this.$scope.offerCheckTimeout = this.$timeout(() => {
                    this.$scope.offerLoader = true;
                    this.$scope.offerMessages.splice(0);
                    var model = {
                        id: obj.offer.id,
                        bonusCode: obj.offer.bonusCode,
                        amount: this.$filter('toGLC')(obj.amount)
                    };
                    this.accountService.validateDepositOffer(model)
                        .success((response) => {
                        if (response.success) {
                            obj.offer = response.data;
                            obj.offer.isValid = true;
                        }
                        else {
                            obj.offer.id = undefined;
                            obj.offer.isValid = false;
                        }
                        response.messages.forEach((a) => {
                            this.$scope.offerMessages.push(a);
                        });
                    }).finally(() => { this.$scope.offerLoader = false; });
                }, 1000);
            }
            showReceipt() {
                this.commonDataService.showReceiptModal(this.$scope, this.$scope.offlineDeposit.payInSlip);
            }
            initPinWalletDeposit() {
                this.$scope.pinWalletDepositLink = {};
                this.$scope.offlineDepositMessage.splice(0);
                if (this.$scope.offlineDeposit.amount <= 0) {
                    this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Deposit amount must be greater than 0', null));
                }
                else {
                    this.$scope.isLoaderActive = true;
                    var model = {};
                    if (this.$scope.offlineDeposit.offer.id) {
                        this.$scope.offlineDeposit.offerId = this.$scope.offlineDeposit.offer.id;
                        this.$scope.offlineDeposit.bonusCode = this.$scope.offlineDeposit.offer.bonusCode;
                    }
                    model.amount = this.$filter('toGLC')(this.$scope.offlineDeposit.amount);
                    this.accountService.pinWalletPayIn(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.pinWalletDepositLink = response.data;
                            this.$scope.pinWalletDepositLink.amount = this.$scope.offlineDeposit.amount;
                            this.$scope.pinWalletDepositLink.bonusCode = this.$scope.offlineDeposit.offer.bonusCode;
                            this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your deposit link/qr-code generated, please pay before it gets expire.', null));
                            this.$scope.offlineDeposit = { conditionAgree: true };
                            this.$scope.offerMessages.splice(0);
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.offlineDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isLoaderActive = false;
                    });
                }
            }
            loadUserBankDetails() {
                this.accountService.getUserBankDetails()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.offlineWithdrawalHistory = response.data;
                    }
                });
            }
            selectExistingBank(w) {
                this.$scope.offlineWithdrawal.type = w.type;
                this.$scope.offlineWithdrawal.acNo = w.acNo;
                this.$scope.offlineWithdrawal.ifscCode = w.ifsc;
                this.$scope.offlineWithdrawal.bankName = w.bankName;
                this.$scope.offlineWithdrawal.acName = w.acHolder;
            }
            withdrawOfflineNow() {
                this.$scope.offlineWithdrawalMessage.splice(0);
                if ((this.$scope.offlineWithdrawal.acNo == '' ||
                    this.$scope.offlineWithdrawal.ifscCode == '' ||
                    this.$scope.offlineWithdrawal.acName == '' ||
                    this.$scope.offlineWithdrawal.bankName == '') && (this.$scope.offlineWithdrawal.cashNote == '')) {
                    this.$scope.offlineWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Please fill up CASH NOTE or UPI or BANK ACCOUNT detail.', null));
                }
                else if (this.$scope.offlineWithdrawal.amount <= 0) {
                    this.$scope.offlineWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Withdrawal amount must be greater than 0', null));
                }
                else {
                    this.$scope.isPayoutLoaderActive = true;
                    var model = {};
                    angular.copy(this.$scope.offlineWithdrawal, model);
                    model.amount = this.$filter('toGLC')(model.amount);
                    this.accountService.startFairexPayout(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.offlineWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your withdrawal request registered.', null));
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.offlineWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isPayoutLoaderActive = false;
                    });
                }
            }
            getDetailType(d) { return intranet.common.enums.DepositOptinos[d]; }
            viewRecentPayInOutRequests(forDeposit = true, forCrypto = false, forOnRamp = false, forPaymore = false) {
                var modal = new intranet.common.helpers.CreateModal();
                if (forDeposit) {
                    if (forCrypto) {
                        modal.header = 'Recent Crypto Deposit Requests';
                    }
                    else {
                        modal.header = 'Recent Deposit Requests';
                    }
                }
                else {
                    modal.header = 'Recent Withdrawal Requests';
                }
                modal.data = {
                    forDeposit: forDeposit && !forCrypto && !forOnRamp && !forPaymore,
                    forCryptoDeposit: forCrypto,
                    forOnRampDeposit: forDeposit && forOnRamp,
                    forPaymorDeposit: forPaymore && forDeposit,
                    forOnRampWithdrawal: !forDeposit && forOnRamp,
                    forWithdrawal: !forDeposit && !forOnRamp && !forPaymore,
                    forPaymorWithdrawal: !forDeposit && forPaymore
                };
                modal.options.actionButton = '';
                modal.size = 'lg';
                if (this.isMobile.any) {
                    modal.bodyUrl = this.settings.ThemeName + '/mobile/account/recent-payinout-modal.html';
                }
                else {
                    modal.bodyUrl = this.settings.ThemeName + '/home/account/recent-payinout-modal.html';
                }
                modal.controller = 'recentPayInOutModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            depositCryptoNow() {
                this.$scope.cryptoDepositMessage.splice(0);
                var returnUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived', { status: 1 });
                var cancelUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived', { status: 0 });
                this.$scope.isLoaderActive = true;
                var model = {};
                model.amount = this.$filter('toGLC')(this.$scope.cryptoDeposit.amount);
                model.successUrl = returnUrl;
                model.cancelUrl = cancelUrl;
                if (this.$scope.cryptoDeposit.offer.id) {
                    model.offerId = this.$scope.cryptoDeposit.offer.id;
                    model.bonusCode = this.$scope.cryptoDeposit.offer.bonusCode;
                }
                this.accountService.initNowPayment(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.cryptoDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your deposit process started.', null));
                        this.$scope.offerMessages.splice(0);
                        this.openNowPayment(response.data);
                    }
                    else {
                        response.messages.forEach((a) => {
                            this.$scope.cryptoDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                        });
                    }
                });
            }
            openNowPayment(data) {
                var url = data.invoiceUrl;
                var payment = this.$window.open(this.$sce.trustAsUrl(url), "NowPayment Checkout", "width=600,height=650,left=400,top=50");
                this.$window.setData = ((data) => {
                    console.log(data);
                    this.statusReceived(data);
                });
                this.watchPopup(payment);
            }
            depositByOnRamp() {
                this.$scope.onRampDepositMessage.splice(0);
                this.$scope.isLoaderActive = true;
                var model = {};
                model.amount = this.$filter('toGLC')(this.$scope.onRampDeposit.amount);
                if (this.$scope.onRampDeposit.offer && this.$scope.onRampDeposit.offer.id) {
                    model.offerId = this.$scope.onRampDeposit.offer.id;
                    model.bonusCode = this.$scope.onRampDeposit.offer.bonusCode;
                }
                this.paymentService.initgameokpay(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.onRampDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your deposit process started.', null));
                        this.$scope.offerMessages.splice(0);
                        this.$scope.onRampDeposit.address = response.data.address;
                        this.$scope.onRampDeposit.bfic_amount = response.data.bfic;
                    }
                    else {
                        response.messages.forEach((a) => {
                            this.$scope.onRampDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                        });
                    }
                }).finally(() => { this.$scope.isLoaderActive = false; });
            }
            withdrawalByOnRamp() {
                this.$scope.offlineWithdrawalMessage.splice(0);
                if (this.$scope.onRampWithdrawal.amount <= 0) {
                    this.$scope.onRampWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Withdrawal amount must be greater than 0', null));
                }
                else {
                    this.$scope.isPayoutLoaderActive = true;
                    var model = {};
                    angular.copy(this.$scope.onRampWithdrawal, model);
                    model.amount = this.$filter('toGLC')(model.amount);
                    this.paymentService.initgameokpayout(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.onRampWithdrawal = {};
                            this.$scope.onRampWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your withdrawal request registered.', null));
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.onRampWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isPayoutLoaderActive = false;
                    });
                }
            }
            initPaymorDeposit() {
                var returnUrl = this.$scope.statusBaseUrl + this.$state.href('paymentreceived', { status: 1 });
                this.$scope.paymorDepositLink = {};
                this.$scope.paymorDepositMessage.splice(0);
                if (this.$scope.paymorDeposit.amount <= 0) {
                    this.$scope.paymorDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Deposit amount must be greater than 0', null));
                }
                else {
                    this.$scope.isLoaderActive = true;
                    var model = {};
                    if (this.$scope.paymorDeposit.offer && this.$scope.paymorDeposit.offer.id) {
                        model.offerId = this.$scope.paymorDeposit.offer.id;
                        model.bonusCode = this.$scope.paymorDeposit.offer.bonusCode;
                    }
                    model.redirectUrl = returnUrl;
                    model.amount = this.$filter('toGLC')(this.$scope.paymorDeposit.amount);
                    this.accountService.paymorPayin(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.paymorDepositLink = response.data;
                            this.$scope.paymorDepositLink.amount = model.amount;
                            this.$scope.paymorDepositLink.bonusCode = this.$scope.paymorDeposit.offer ? this.$scope.paymorDeposit.offer.bonusCode : '';
                            if (this.$scope.paymorDepositLink.upiString) {
                                this.$scope.paymorDepositLink.qrString = encodeURIComponent(this.$scope.paymorDepositLink.upiString);
                            }
                            this.$scope.paymorDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your deposit link/qr-code generated, please pay before it gets expire.', null));
                            this.$scope.paymorDeposit = { conditionAgree: true };
                            this.$scope.offerMessages.splice(0);
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.paymorDepositMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isLoaderActive = false;
                    });
                }
            }
            validateIFSC() {
                if (this.$scope.paymorWithdrawal.ifscCode.length == 11) {
                    this.$scope.paymorWithdrawal.ifscLoader = true;
                    this.accountService.validateIFSC(this.$scope.paymorWithdrawal.ifscCode)
                        .success((response) => {
                        if (response.IFSC) {
                            this.$scope.paymorWithdrawal.bankName = response.BANK;
                            this.$scope.paymorWithdrawal.branchAddress = response.ADDRESS;
                            this.$scope.paymorWithdrawal.city = response.CITY;
                        }
                    })
                        .finally(() => { this.$scope.paymorWithdrawal.ifscLoader = false; });
                }
                else {
                    this.$scope.paymorWithdrawal.bankName = '';
                    this.$scope.paymorWithdrawal.branchAddress = '';
                    this.$scope.paymorWithdrawal.city = '';
                }
            }
            withdrawPaymorNow() {
                this.$scope.paymorWithdrawalMessage.splice(0);
                if (this.$scope.paymorWithdrawal.amount <= 0) {
                    this.$scope.paymorWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Withdrawal amount must be greater than 0', null));
                }
                else {
                    this.$scope.isPayoutLoaderActive = true;
                    var model = {};
                    angular.copy(this.$scope.paymorWithdrawal, model);
                    model.amount = this.$filter('toGLC')(model.amount);
                    if (!model.note) {
                        model.note = '';
                    }
                    this.accountService.paymorPayOut(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.paymorWithdrawal = {};
                            this.$scope.paymorWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Success, 'Your withdrawal request registered.', null));
                        }
                        else {
                            response.messages.forEach((a) => {
                                this.$scope.paymorWithdrawalMessage.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, this.$filter('translate')(a.text), null));
                            });
                        }
                    }).finally(() => {
                        this.$scope.isPayoutLoaderActive = false;
                    });
                }
            }
            selectExistingBankPaymor(w) {
                this.$scope.paymorWithdrawal.transferType = 'IMPS';
                this.$scope.paymorWithdrawal.accNo = w.acNo;
                this.$scope.paymorWithdrawal.ifscCode = w.ifsc;
                this.$scope.paymorWithdrawal.bankName = w.bankName;
                this.$scope.paymorWithdrawal.name = w.acHolder;
            }
        }
        home.PaymentGatewayCtrl = PaymentGatewayCtrl;
        angular.module('intranet.home').controller('paymentGatewayCtrl', PaymentGatewayCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PaymentGatewayCtrl.js.map