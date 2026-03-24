module intranet.admin {

    export interface IAddOfferModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        offer: any;
        offerOnList: any[];
        offerTypeList: any[];
        websiteList: any[];
        dvList: any[];
    }

    export class AddOfferModalCtrl extends intranet.common.ControllerBase<IAddOfferModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddOfferModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance: any,
            private offerService: services.OfferService,
            private commonDataService: common.services.CommonDataService,
            private websiteService: services.WebsiteService,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.offerOnList = [];
            this.$scope.offerTypeList = [];
            this.$scope.websiteList = [];
            this.$scope.dvList = [];

            this.$scope.modalOptions = this.modalOptions;
            this.$scope.offer = {};
            if (this.modalOptions.data) {
                this.$scope.offer = this.modalOptions.data;
            } else {
                this.$scope.offer.bonusExpiredDay = 365;
                this.$scope.offer.splitBonus = 1;
                this.$scope.offer.withdrawalTurnover = 0;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveOffer();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            if (this.$scope.offer.depositVariations && this.$scope.offer.depositVariations.length > 0) {
                this.$scope.dvList = this.$scope.offer.depositVariations;
            }
        }

        public loadInitialData(): void {
            this.loadWebsites();

            var offerON: any = common.enums.OfferOn;
            this.$scope.offerOnList = common.helpers.Utility.enumToArray<common.enums.OfferOn>(offerON);
            if (!this.$scope.offer.offerOn) { this.$scope.offer.offerOn = this.$scope.offerOnList[0].id.toString(); }
            else { this.$scope.offer.offerOn = this.$scope.offer.offerOn.toString(); }

            var offertype: any = common.enums.OfferType;
            this.$scope.offerTypeList = common.helpers.Utility.enumToArray<common.enums.OfferType>(offertype);
            if (!this.$scope.offer.offerType) { this.$scope.offer.offerType = this.$scope.offerTypeList[0].id.toString(); }
            else { this.$scope.offer.offerType = this.$scope.offer.offerType.toString(); }

        }

        private loadWebsites() {
            this.websiteService.getWebsites()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.websiteList = response.data;
                        if (this.$scope.offer.websiteId) {
                            this.$scope.offer.websiteId = this.$scope.offer.websiteId.toString();
                        } else {
                            this.$scope.offer.websiteId = this.$scope.websiteList[0].id.toString();
                        }
                    }
                });
        }

        private getOfferType(o: any) { return common.enums.OfferType[o]; }

        private beforeRender($view, $dates, $leftDate, $upDate, $rightDate) {
            var activeDate = moment();
            if ($view == 'day') { activeDate = moment().subtract(1, 'd'); }
            if ($view == 'hour') { activeDate = moment().subtract(1, 'h'); }
            $dates.filter(function (date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function (date) {
                date.selectable = false
            })
        }

        private addDV() { this.$scope.dvList.push({ min: '', max: '', percentage: '' }); }

        private removeDV(index: any) { this.$scope.dvList.splice(index, 1); }

        private saveOffer(): void {
            this.$scope.offer.depositVariations = [];
            var invalidDv = false;

            angular.forEach(this.$scope.dvList, (d: any) => { if (d.min <= 0 || d.max <= 0 || d.percentage <= 0) { invalidDv = true; } });

            if (invalidDv && this.$scope.offer.offerOn != common.enums.OfferOn.OnRegister) {
                this.$scope.messages.push(new common.messaging.ResponseMessage(8, "Deposit variation's Min, Max and Percentage must be greater than 0", ''));
            }
            else {

                if (this.$scope.offer.offerOn != common.enums.OfferOn.OnRegister) { this.$scope.offer.depositVariations = this.$scope.dvList; }

                var promise: ng.IHttpPromise<any>;
                if (this.$scope.offer.id) {
                    promise = this.offerService.updateOffer(this.$scope.offer);
                }
                else {
                    promise = this.offerService.addOffer(this.$scope.offer);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    } else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
    }
    angular.module('intranet.admin').controller('addOfferModalCtrl', AddOfferModalCtrl);
}