var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTDateRangePickerController extends common.ControllerBase {
                constructor($scope) {
                    super($scope);
                    this.$scope.setPicker = ((id) => this.setPickerControl(id));
                    super.init(this);
                }
                initScopeValues() {
                }
                setPickerControl(pickerid) {
                    var self = this;
                    jQuery('#' + pickerid).dateRangePicker({
                        autoClose: false,
                        format: self.$scope.format ? self.$scope.format : 'DD-MM-YYYY HH:mm',
                        separator: ' to ',
                        language: 'auto',
                        startOfWeek: 'sunday',
                        getValue: function () {
                            return $(this).val();
                        },
                        setValue: function (s) {
                            if (!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
                                $(this).val(s);
                            }
                        },
                        startDate: false,
                        endDate: false,
                        time: {
                            enabled: true
                        },
                        minDays: 0,
                        maxDays: 0,
                        showShortcuts: true,
                        shortcuts: {},
                        customShortcuts: [
                            {
                                name: 'Today', dates: function () { return [moment().startOf('day').toDate(), moment().toDate()]; }
                            },
                            {
                                name: 'Yesterday', dates: function () { return [moment().subtract(1, 'days').startOf('day').toDate(), moment().subtract(1, 'days').endOf('day').toDate()]; }
                            },
                            {
                                name: 'Last 7 Days', dates: function () { return [moment().subtract(6, 'days').startOf('day').toDate(), moment().toDate()]; }
                            },
                            {
                                name: 'Last 30 Days', dates: function () { return [moment().subtract(29, 'days').startOf('day').toDate(), moment().toDate()]; }
                            },
                            {
                                name: 'This Month', dates: function () { return [moment().startOf('month').toDate(), moment().endOf('month').toDate()]; }
                            },
                            {
                                name: 'Last Month', dates: function () { return [moment().subtract(1, 'month').startOf('month').toDate(), moment().subtract(1, 'month').endOf('month').toDate()]; }
                            },
                        ],
                        inline: false,
                        container: 'body',
                        alwaysOpen: false,
                        singleDate: false,
                        lookBehind: false,
                        batchMode: false,
                        duration: 200,
                        stickyMonths: false,
                        dayDivAttrs: [],
                        dayTdAttrs: [],
                        applyBtnClass: 'Mohit',
                        singleMonth: 'auto',
                        monthSelect: true,
                        yearSelect: true,
                        showTopbar: true,
                        swapTime: true,
                        selectForward: false,
                        selectBackward: false,
                        showWeekNumbers: false,
                        getWeekNumber: function (date) {
                            return moment(date).format('w');
                        }
                    })
                        .bind('datepicker-change', function (event, obj) {
                        self.$scope.fromDate = obj.date1;
                        self.$scope.toDate = obj.date2;
                    })
                        .bind('datepicker-close', function () {
                        self.$scope.$apply();
                        if (self.$scope.onSelection) {
                            self.$scope.onSelection();
                        }
                    });
                    jQuery('#' + pickerid)
                        .data('dateRangePicker')
                        .setDateRange(self.$scope.fromDate, self.$scope.toDate, true);
                }
            }
            angular.module('kt.components')
                .controller('KTDateRangePickerController', KTDateRangePickerController);
            angular.module('kt.components')
                .directive('ktDateRangePicker', () => {
                return {
                    restrict: 'A',
                    scope: {
                        fromDate: '=',
                        toDate: '=',
                        format: '@?',
                        onSelection: '&?'
                    },
                    controller: 'KTDateRangePickerController',
                    link: function ($scope, elem, attrs) {
                        $scope.setPicker(attrs.id);
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-daterangepicker.js.map