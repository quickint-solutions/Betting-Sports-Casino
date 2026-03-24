var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddAgentOfferModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $uibModalInstance, offerService, $filter, commonDataService, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.offerService = offerService;
                this.$filter = $filter;
                this.commonDataService = commonDataService;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.offerOnList = [];
                this.$scope.offerTypeList = [];
                this.$scope.dvList = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.offer = {};
                if (this.modalOptions.data) {
                    this.$scope.offer = this.modalOptions.data;
                }
                else {
                    this.$scope.offer.bonusExpiredDay = 365;
                    this.$scope.offer.splitBonus = 1;
                    this.$scope.offer.withdrawalTurnover = 0;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveOffer();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                if (this.$scope.offer.depositVariations && this.$scope.offer.depositVariations.length > 0) {
                    this.$scope.dvList = this.$scope.offer.depositVariations;
                }
            }
            loadInitialData() {
                var offerON = intranet.common.enums.OfferOn;
                this.$scope.offerOnList = intranet.common.helpers.Utility.enumToArray(offerON);
                if (!this.$scope.offer.offerOn) {
                    this.$scope.offer.offerOn = this.$scope.offerOnList[0].id.toString();
                }
                else {
                    this.$scope.offer.offerOn = this.$scope.offer.offerOn.toString();
                }
                var offertype = intranet.common.enums.OfferType;
                this.$scope.offerTypeList = intranet.common.helpers.Utility.enumToArray(offertype);
                if (!this.$scope.offer.offerType) {
                    this.$scope.offer.offerType = this.$scope.offerTypeList[0].id.toString();
                }
                else {
                    this.$scope.offer.offerType = this.$scope.offer.offerType.toString();
                }
            }
            getOfferType(o) { return intranet.common.enums.OfferType[o]; }
            beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
                var activeDate = moment();
                if ($view == 'day') {
                    activeDate = moment().subtract(1, 'd');
                }
                if ($view == 'hour') {
                    activeDate = moment().subtract(1, 'h');
                }
                $dates.filter(function (date) {
                    return date.localDateValue() <= activeDate.valueOf();
                }).forEach(function (date) {
                    date.selectable = false;
                });
            }
            addDV() { this.$scope.dvList.push({ min: '', max: '', percentage: '' }); }
            removeDV(index) { this.$scope.dvList.splice(index, 1); }
            saveOffer() {
                this.$scope.offer.depositVariations = [];
                var invalidDv = false;
                angular.forEach(this.$scope.dvList, (d) => { if (d.min <= 0 || d.max <= 0 || d.percentage <= 0) {
                    invalidDv = true;
                } });
                if (invalidDv && this.$scope.offer.offerOn != intranet.common.enums.OfferOn.OnRegister) {
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(8, "Deposit variation's Min, Max and Percentage must be greater than 0", ''));
                }
                else {
                    if (this.$scope.offer.offerOn != intranet.common.enums.OfferOn.OnRegister) {
                        angular.forEach(this.$scope.dvList, (d) => {
                            this.$scope.offer.depositVariations.push({
                                min: this.$filter('toGLC')(d.min),
                                max: this.$filter('toGLC')(d.max),
                                percentage: d.percentage,
                            });
                        });
                    }
                    var promise;
                    var model = {};
                    angular.copy(this.$scope.offer, model);
                    if (model.offerType == intranet.common.enums.OfferType.Fixed) {
                        model.value = this.$filter('toGLC')(model.value);
                    }
                    if (model.minDeposit > 0) {
                        model.minDeposit = this.$filter('toGLC')(model.minDeposit);
                    }
                    if (model.maxDeposit > 0) {
                        model.maxDeposit = this.$filter('toGLC')(model.maxDeposit);
                    }
                    if (model.offerBudget > 0) {
                        model.offerBudget = this.$filter('toGLC')(model.offerBudget);
                    }
                    if (model.valueUpTo > 0) {
                        model.valueUpTo = this.$filter('toGLC')(model.valueUpTo);
                    }
                    if (this.$scope.offer.id) {
                        promise = this.offerService.updateAgentOffer(model);
                    }
                    else {
                        promise = this.offerService.addAgentOffer(model);
                    }
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        master.AddAgentOfferModalCtrl = AddAgentOfferModalCtrl;
        angular.module('intranet.master').controller('addAgentOfferModalCtrl', AddAgentOfferModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddAgentOfferModalCtrl.js.map