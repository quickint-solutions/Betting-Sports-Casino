var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var filters;
        (function (filters) {
            function toRate(settings, $filter) {
                return (input, customFraction = undefined) => {
                    var fraction = customFraction != undefined ? customFraction : settings.CurrencyFraction;
                    if (input == 0) {
                        input = parseFloat(input);
                        input = input.toFixed(fraction);
                        return input;
                    }
                    else if (input) {
                        var output = math.multiply(input, settings.CurrencyRate);
                        return $filter('ktNumber')(output, fraction);
                    }
                    else {
                        return $filter('ktNumber')(input, fraction);
                    }
                };
            }
            filters.toRate = toRate;
            function toRateOnly(settings, $filter) {
                return (input) => {
                    if (input) {
                        var output = math.multiply(input, settings.CurrencyRate);
                        return math.round(output, settings.CurrencyFraction);
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.toRateOnly = toRateOnly;
            function toFixDigit(settings, $filter) {
                return (input) => {
                    if (input) {
                        return parseFloat(input).toFixed(2);
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.toFixDigit = toFixDigit;
            function toGLC(settings) {
                return (input) => {
                    if (input) {
                        input = input.toString().replaceAll(',', '');
                        return math.round(math.divide(input, settings.CurrencyRate), 2);
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.toGLC = toGLC;
            function toBMPrice(settings) {
                return (input) => {
                    if (input) {
                        input = math.round(math.divide(math.multiply(math.subtract(input, 1), 1000), 10), 2);
                        input = parseFloat(input);
                        input = input.toFixed(input % 1 === 0 ? 0 : 1);
                        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.toBMPrice = toBMPrice;
            function roundNumber(settings) {
                return (input, length = 0) => {
                    if (input) {
                        input = parseFloat(input);
                        input = input.toFixed(settings.CurrencyFraction);
                        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.roundNumber = roundNumber;
            function ktNumber(settings) {
                return (input, length = 0) => {
                    if (input) {
                        input = parseFloat(input);
                        input = input.toFixed(length);
                        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.ktNumber = ktNumber;
            function shortNumber(settings) {
                return (input) => {
                    if (input) {
                        var n = input;
                        if (n < 1e3)
                            return n;
                        if (n >= 1e3 && n < 1e6)
                            return +(n / 1e3).toFixed(1) + "K";
                        if (n >= 1e6 && n < 1e9)
                            return +(n / 1e6).toFixed(1) + "M";
                        if (n >= 1e9 && n < 1e12)
                            return +(n / 1e9).toFixed(1) + "B";
                        if (n >= 1e12)
                            return +(n / 1e12).toFixed(1) + "T";
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.shortNumber = shortNumber;
            function toDays() {
                return (input, elseDate = 0) => {
                    if (input) {
                        return moment(input).calendar(null, {
                            sameDay: '[Today]',
                            nextDay: '[Tomorrow]',
                            nextWeek: elseDate == 0 ? 'ddd' : 'DD/MM/YYYY',
                            lastDay: '[Yesterday]',
                            lastWeek: elseDate == 0 ? 'MMM DD' : 'DD/MM/YYYY',
                            sameElse: elseDate == 0 ? 'MMM DD' : 'DD/MM/YYYY'
                        });
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.toDays = toDays;
            function DateDiff() {
                return (input) => {
                    var response = '';
                    if (input) {
                        var mint = math.round(moment().diff(input, 'minutes') * -1, 0);
                        if (mint > 0) {
                            var seconds = math.round(math.multiply(mint, 60), 0);
                            var days = Math.floor(seconds / 86400);
                            seconds -= days * 86400;
                            if (days > 0) {
                                response += days + 'days ';
                            }
                            var hours = Math.floor(seconds / 3600) % 24;
                            seconds -= hours * 3600;
                            if (hours > 0) {
                                response += hours + 'hrs ';
                            }
                            var minutes = Math.floor(seconds / 60) % 60;
                            if (minutes > 0) {
                                response += minutes + 'mins ';
                            }
                            return response;
                        }
                        else {
                            return response;
                        }
                    }
                    else {
                        return response;
                    }
                };
            }
            filters.DateDiff = DateDiff;
            function TwoDateDiff() {
                return (first, biji) => {
                    var response = '';
                    if (first) {
                        var secs = math.round(moment(first).diff(biji, 'seconds') * -1, 0);
                        if (secs > 0) {
                            var seconds = math.round(secs, 0);
                            var days = Math.floor(seconds / 86400);
                            seconds -= days * 86400;
                            if (days > 0) {
                                response += days + 'd ';
                            }
                            var hours = Math.floor(seconds / 3600) % 24;
                            seconds -= hours * 3600;
                            if (hours > 0) {
                                response += hours + 'h ';
                            }
                            var minutes = Math.floor(seconds / 60) % 60;
                            if (minutes > 0) {
                                response += minutes + 'm ';
                            }
                            seconds -= minutes * 60;
                            if (seconds > 0) {
                                response += seconds + 's';
                            }
                            return response;
                        }
                        else {
                            return response;
                        }
                    }
                    else {
                        return response;
                    }
                };
            }
            filters.TwoDateDiff = TwoDateDiff;
            function DateDiffTime() {
                return (input) => {
                    var response = '';
                    if (input) {
                        var secs = math.round(moment().diff(input, 'seconds') * -1, 0);
                        if (secs > 0) {
                            var seconds = math.round(secs, 0);
                            var days = Math.floor(seconds / 86400);
                            seconds -= days * 86400;
                            if (days > 0) {
                                response += days + ':';
                            }
                            var hours = Math.floor(seconds / 3600) % 24;
                            seconds -= hours * 3600;
                            if (hours > 0) {
                                response += hours.toString().lpad('0', 2) + ':';
                            }
                            else {
                                response += "00:";
                            }
                            var minutes = Math.floor(seconds / 60) % 60;
                            if (minutes > 0) {
                                response += minutes.toString().lpad('0', 2) + ':';
                            }
                            else {
                                response += "00:";
                            }
                            seconds -= minutes * 60;
                            if (seconds > 0) {
                                response += seconds.toString().lpad('0', 2);
                            }
                            else {
                                response += "00";
                            }
                            return response;
                        }
                        else {
                            return response;
                        }
                    }
                    else {
                        return response;
                    }
                };
            }
            filters.DateDiffTime = DateDiffTime;
            function DateDiffTime2() {
                return (input) => {
                    var response = { days: 0, hrs: 0, min: 0, sec: 0, };
                    if (input) {
                        var secs = math.round(moment().diff(input, 'seconds') * -1, 0);
                        if (secs > 0) {
                            var seconds = math.round(secs, 0);
                            var days = Math.floor(seconds / 86400);
                            seconds -= days * 86400;
                            if (days > 0) {
                                response.days = days;
                            }
                            var hours = Math.floor(seconds / 3600) % 24;
                            seconds -= hours * 3600;
                            if (hours > 0) {
                                response.hrs = hours;
                            }
                            var minutes = Math.floor(seconds / 60) % 60;
                            if (minutes > 0) {
                                response.min = minutes;
                            }
                            seconds -= minutes * 60;
                            if (seconds > 0) {
                                response.sec = seconds;
                            }
                            return response;
                        }
                        else {
                            return response;
                        }
                    }
                    else {
                        return response;
                    }
                };
            }
            filters.DateDiffTime2 = DateDiffTime2;
            function shortAddress() {
                return (input) => {
                    if (input) {
                        var char = 7;
                        var output = input.substr(0, char);
                        output = output + '...';
                        output = output + input.substr((input.length - 4), 4);
                        return output;
                    }
                    else {
                        return input;
                    }
                };
            }
            filters.shortAddress = shortAddress;
        })(filters = common.filters || (common.filters = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
angular.module('intranet.common.filters').filter('toRate', intranet.common.filters.toRate);
angular.module('intranet.common.filters').filter('toRateOnly', intranet.common.filters.toRateOnly);
angular.module('intranet.common.filters').filter('toFixDigit', intranet.common.filters.toFixDigit);
angular.module('intranet.common.filters').filter('toGLC', intranet.common.filters.toGLC);
angular.module('intranet.common.filters').filter('ktNumber', intranet.common.filters.ktNumber);
angular.module('intranet.common.filters').filter('toBMPrice', intranet.common.filters.toBMPrice);
angular.module('intranet.common.filters').filter('shortNumber', intranet.common.filters.shortNumber);
angular.module('intranet.common.filters').filter('toDays', intranet.common.filters.toDays);
angular.module('intranet.common.filters').filter('dateDiff', intranet.common.filters.DateDiff);
angular.module('intranet.common.filters').filter('twoDateDiff', intranet.common.filters.TwoDateDiff);
angular.module('intranet.common.filters').filter('roundNumber', intranet.common.filters.roundNumber);
angular.module('intranet.common.filters').filter('dateDiffTime', intranet.common.filters.DateDiffTime);
angular.module('intranet.common.filters').filter('dateDiffTime2', intranet.common.filters.DateDiffTime2);
angular.module('intranet.common.filters').filter('shortAddress', intranet.common.filters.shortAddress);
//# sourceMappingURL=currency-filter.js.map