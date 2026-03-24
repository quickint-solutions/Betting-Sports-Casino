var intranet;
(function (intranet) {
    var common;
    (function (common) {
        class BannerModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, $uibModalInstance, isMobile, $timeout, modalOptions) {
                super($scope);
                this.$uibModalInstance = $uibModalInstance;
                this.isMobile = isMobile;
                this.$timeout = $timeout;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.isMobileView = this.isMobile.any;
                this.$scope.data = {};
                if (this.modalOptions.data) {
                    this.$scope.data = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
                };
                this.$timeout(() => {
                    var swiper = new Swiper(".mySwiperBanner", {
                        slidesPerView: 1,
                        loop: true,
                        autoHeight: false,
                        freeMode: true,
                        navigation: {
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        },
                    });
                }, 100);
            }
        }
        common.BannerModalCtrl = BannerModalCtrl;
        angular.module('intranet.common').controller('bannerModalCtrl', BannerModalCtrl);
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BannerModalCtrl.js.map