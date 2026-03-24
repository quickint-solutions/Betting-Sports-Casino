'use strict';


// config file order
var srcJs = [

    // modules
    '__baseDir__/*[mM]odule.js',                                // include main module file
    '__baseDir__/base/**/*[mM]odule.js',                        // include base module files
    '__baseDir__/**/base/**/*[mM]odule.js',                     // include sub-base module files
    '__baseDir__/**/*[mM]odule.js',                             // include all other module files
    '__baseDir__/common/controllers/*.js',



    // custom ordered angular files
    // Note: need to put these after the `modules` section because that's where the modules are initiated
    //'__baseDir__/contracts/controllers/common/ContractsOverviewCtrl.js',
    //'__baseDir__/contracts/controllers/search/ContractsSearchCtrl.js',
    //'__baseDir__/contracts/controllers/pdf-jobs/ContractsPdfJobsSelectContractsCtrl.js',

    //'__baseDir__/contracts/helpers/TemporaryUnemploymentBaseModel.js',
    //'__baseDir__/contracts/helpers/EconomicReasonModel.js',




    // constants
    '__baseDir__/*[cC]onstants.js',                             // include main constants file
    '__baseDir__/base/**/*[cC]onstants.js',                     // include base constants files
    '__baseDir__/**/base/**/*[cC]onstants.js',                  // include sub-base constants files
    '__baseDir__/**/*[cC]onstants.js',                          // include all other constants files

    // routes
    '__baseDir__/*[rR]oute.js',                                 // include main route file
    '__baseDir__/base/**/*[rR]oute.js',                         // include base route files
    '__baseDir__/**/base/**/*[rR]oute.js',                      // include sub-base route files
    '__baseDir__/**/*[rR]oute.js',                              // include all other route files

    // other
    '__baseDir__/base/**/*.js',                                 // include base js files
    '__baseDir__/**/base/**/*.js',                              // include sub-base js files
    '__baseDir__/**/*!(app-templates|app|appConfig).js',        // include all other js files

    // mandatory files
    '__baseDir__/app-templates.js',                             // include template
    '__baseDir__/app.js',                                       // include app file
    '__baseDir__/appConfig.js',                                 // include app config file
];


var srcJsWithoutSpecs = srcJs.slice(0);
srcJsWithoutSpecs.push('!__baseDir__/**/*[sS]pec.js');          // exclude spec files

var srcJsWithSpecs = srcJs.slice(0);
srcJsWithSpecs.push('__baseDir__/../../test/application-tests/*[sS]pec.js');    // include application-test spec files


var pathNodeModules = '__baseDir__/node_modules/';
var vendorJs = [
    pathNodeModules + 'jquery/dist/jquery.min.js',
    pathNodeModules + 'bootstrap/dist/js/bootstrap.min.js',

    pathNodeModules + 'angular/angular.min.js',
    pathNodeModules + 'angular-local-storage/dist/angular-local-storage.js',
    pathNodeModules + 'angular-sanitize/angular-sanitize.js',
    pathNodeModules + 'angular-animate/angular-animate.js',
    pathNodeModules + 'angular-promise-tracker/promise-tracker.js',
    pathNodeModules + 'angular-ui-bootstrap/dist/ui-bootstrap.js',
    pathNodeModules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    pathNodeModules + 'angular-ui-router/release/angular-ui-router.js',
    pathNodeModules + 'angular-translate/dist/angular-translate.min.js',
    pathNodeModules + 'angular-translate/dist/angular-translate-loader-url/angular-translate-loader-url.min.js',
    //pathNodeModules + 'angular-translate/dist/angular-translate-handler-log/angular-translate-handler-log.min.js',
    pathNodeModules + 'ng-table/dist/ng-table.js',
    pathNodeModules + 'moment/min/moment.min.js',
    pathNodeModules + 'angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
    pathNodeModules + 'angular-bootstrap-datetimepicker/src/js/datetimepicker.templates.js',
    pathNodeModules + 'angular-breadcrumb/dist/angular-breadcrumb.js',
    //pathNodeModules + 'angular-loading-bar/src/loading-bar.js',
    pathNodeModules + 'ui-select/dist/select.js',
    // pathNodeModules + 'highcharts-release/highcharts.js',
    //  pathNodeModules + 'highcharts-ng/dist/highcharts-ng.js',
    //pathNodeModules + 'angular-http-auth/src/http-auth-interceptor.js',
    //  pathNodeModules + 'ng-file-upload/dist/ng-file-upload-shim.js',
    //  pathNodeModules + 'ng-file-upload/dist/ng-file-upload.js',
    //  pathNodeModules + 'angulartics/dist/angulartics.min.js',
    //  pathNodeModules + 'angulartics-google-analytics/dist/angulartics-google-analytics.min.js',
    //  pathNodeModules + 'angular-i18n/angular-locale_nl-be.js',
    pathNodeModules + 'angular-cache/dist/angular-cache.js',
    pathNodeModules + 'angularjs-toaster/toaster.js',
    pathNodeModules + 'mousetrap/mousetrap.js',
    // pathNodeModules + 'angular-youtube-embed/src/angular-youtube-embed.js',
    // pathNodeModules + 'angular-mousetrap-service/src/angular-mousetrap-service.js', // WARNING - Keep this fixed to /src and NOT /release, otherwise mousetrap.js specified in npm will NOT be loaded, it will be 1.4.6 inline compiled into the service...
    //pathNodeModules + 'jquery.maskedinput/src/jquery.maskedinput.js',
    //pathNodeModules + 'oidc-token-manager/dist/oidc-token-manager.js',
    pathNodeModules + 'angular-elastic/elastic.js',
    // pathNodeModules + 'iban/iban.js',
    pathNodeModules + 'textAngular/dist/textAngular-sanitize.js',
    pathNodeModules + 'textAngular/dist/textAngular-rangy.min.js',
    pathNodeModules + 'textAngular/dist/textAngularSetup.js',
    pathNodeModules + 'textAngular/dist/textAngular.js',

    pathNodeModules + 'jquery-ui-dist/jquery-ui.js',
    //pathNodeModules + 'angular-ui-sortable/dist/sortable.js',
    // pathNodeModules + 'pdfjs-dist/web/compatibility.js',
    // pathNodeModules + 'pdfjs-dist/build/pdf.combined.js',
    //pathNodeModules + 'angular-pdfjs/dist/angular-pdfjs.min.js',
    //pathNodeModules + '@hohr/sharedcomponents/dist/src/hohr-sharedcomponents.js',
    //pathNodeModules + '@hohr/sharedcomponents/dist/src/hohr-sharedcomponents.tpls.js',
    //pathNodeModules + 'applicationinsights-js/dist/ai.js',
    pathNodeModules + 'angular-clipboard/angular-clipboard.js',
    pathNodeModules + 'angular-base64/angular-base64.js',

    //pathNodeModules + 'ifvisible.js/src/ifvisible.js',

    pathNodeModules + 'crypto-js/crypto-js.js',
    pathNodeModules + 'crypto-js/tripledes.js',
    pathNodeModules + 'crypto-js/aes.js',
    pathNodeModules + 'crypto-js/enc-utf8.js',
    pathNodeModules + 'crypto-js/mode-ecb.js',
    pathNodeModules + 'crypto-js/pad-pkcs7.js',


    pathNodeModules + 'mathjs/dist/math.min.js', // in public
    pathNodeModules + 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
    pathNodeModules + 'ng-scrollbars/dist/scrollbars.min.js',
    //pathNodeModules + 'angular-bootstrap-scrolling-tabs/dist/scrolling-tabs.min.js',
    pathNodeModules + 'angular-ismobile/dist/angular-ismobile.min.js',
    //pathNodeModules + 'angular-bootstrap-contextmenu/contextMenu.js',
    //pathNodeModules + 'fuse.js/dist/fuse.js',
    pathNodeModules + 'angular-uuid/angular-uuid.js',
    //pathNodeModules + 'angular-websocket/dist/angular-websocket.js',
    pathNodeModules + 'angular-recaptcha/release/angular-recaptcha.js',
    pathNodeModules + 'jquery-daterangepicker/lib/dist/jquery.daterangepicker.min.js',

    '__baseDir__/custom-scripts/odometer/odometer.js',
    // '__baseDir__/custom-scripts/youtube.iframe-api.js',
    '__baseDir__/custom-scripts/flashphoner/flashphoner.min.js',
    '__baseDir__/custom-scripts/flashphoner/utils.js',
    //'__baseDir__/custom-scripts/flashphoner/video.js', // in public
    //'__baseDir__/custom-scripts/flashphoner/videojs-hls.min.js',

    //'__baseDir__/custom-scripts/Highcharts-7.0.3/code/highcharts.js', // in public
    '__baseDir__/custom-scripts/FullScreen/fullscreen.js',
    //'__baseDir__/custom-scripts/maintenance/main.js', 
    //'__baseDir__/custom-scripts/daterangepicker/daterangepicker.js',

    '__baseDir__/custom-scripts/ifvisiblejs/ifvisible.js',
    '__baseDir__/custom-scripts/angular-websocket/dist/angular-websocket.js',
    //'__baseDir__/custom-scripts/web3/web3.js',
    '__baseDir__/custom-scripts/slick181/slick/slick.min.js',
    '__baseDir__/custom-scripts/slick181/slick/slick-animation.js',
    '__baseDir__/custom-scripts/swiper/swiper-bundle.min.js',
    //'__baseDir__/custom-scripts/debugger.js',

    //'__baseDir__/custom-scripts/ant-media/webrtc_adaptor.js',
    //'__baseDir__/custom-scripts/ant-media/adapter-latest.js',

    //'__baseDir__/custom-scripts/ant-media/fetch.js',
    //'__baseDir__/custom-scripts/ant-media/promise.min.js',
    //'__baseDir__/custom-scripts/ant-media/fetch.stream.js',
];
var testingVendorJs = vendorJs.concat([
    pathNodeModules + 'angular-mocks/angular-mocks.js',
    pathNodeModules + 'ng-describe/dist/ng-describe.js',
    '.usage-stats/module.js',
    '.usage-stats/components.js',
    '.usage-stats/filters.js'
]);



module.exports = {
    srcJsWithSpecs: (baseDir) => {
        return srcJsWithSpecs
            .map(path => path.replace('__baseDir__', baseDir || '.'));
    },
    srcJsWithoutSpecs: (baseDir) => {
        return srcJsWithoutSpecs
            .map(path => path.replace('__baseDir__', baseDir || '.'));
    },
    vendorJs: (baseDir) => {
        return vendorJs
            .map(path => path.replace('__baseDir__', baseDir || '.'));
    },
    testingVendorJs: (baseDir) => {
        return testingVendorJs
            .map(path => path.replace('__baseDir__', baseDir || '.'));
    },

}