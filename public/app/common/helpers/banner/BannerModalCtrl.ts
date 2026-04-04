module intranet.common {

    export interface IBannerModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        isMobileView: any;
        data: any
    }

    export class BannerModalCtrl extends intranet.common.ControllerBase<IBannerModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IBannerModalScope,
            private $uibModalInstance,
            private isMobile: any,
            private $timeout: any,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                   // autoplay: true,
                    autoHeight: false,
                    freeMode: true,
                });
            }, 100);

        }

    }

    angular.module('intranet.common').controller('bannerModalCtrl', BannerModalCtrl);
}