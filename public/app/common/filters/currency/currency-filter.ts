namespace intranet.common.filters {
    export function toRate(settings: common.IBaseSettings, $filter: any) {
        return (input: any, customFraction: number = undefined) => {
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
            else { return $filter('ktNumber')(input, fraction); }
        };
    }


    export function toRateOnly(settings: common.IBaseSettings, $filter: any) {
        return (input: any) => {
            if (input) {
                var output = math.multiply(input, settings.CurrencyRate);
                return math.round(output, settings.CurrencyFraction);
            }
            else { return input; }
        };
    }

    export function toFixDigit(settings: common.IBaseSettings, $filter: any) {
        return (input: any) => {
            if (input) {
                return parseFloat(input).toFixed(2);
            }
            else { return input; }
        };
    }

    export function toGLC(settings: common.IBaseSettings) {
        return (input: any) => {
            if (input) {
                input = input.toString().replaceAll(',', '');
                return math.round(math.divide(input, settings.CurrencyRate), 2);
            }
            else { return input; }
        };
    }

    export function toBMPrice(settings: common.IBaseSettings) {
        return (input: any) => {
            if (input) {
                input = math.round(math.divide(math.multiply(math.subtract(input, 1), 1000), 10), 2);
                input = parseFloat(input);
                input = input.toFixed(input % 1 === 0 ? 0 : 1);
                return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            else { return input; }
        };
    }
    export function roundNumber(settings: common.IBaseSettings) {
        return (input: any, length: any = 0) => {
            if (input) {
                input = parseFloat(input);
                //input = input.toFixed(input % 1 === 0 ? 0 : length);
                input = input.toFixed(settings.CurrencyFraction);
                return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            else { return input; }
        };
    }
    export function ktNumber(settings: common.IBaseSettings) {
        return (input: any, length: any = 0) => {
            if (input) {
                input = parseFloat(input);
                //input = input.toFixed(input % 1 === 0 ? 0 : length);
                input = input.toFixed(length);
                return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            else { return input; }
        };
    }

    export function shortNumber(settings: common.IBaseSettings) {
        return (input: any) => {
            if (input) {
                var n = input;
                if (n < 1e3) return n;
                if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
                if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
                if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
                if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
            }
            else { return input; }
        };
    }

    export function toDays() {
        return (input: any, elseDate: any = 0) => {
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
            else { return input; }
        };
    }
    export function DateDiff() {
        return (input: any) => {
            var response: string = '';
            if (input) {
                var mint = math.round(moment().diff(input, 'minutes') * -1, 0);
                if (mint > 0) {

                    var seconds: any = math.round(math.multiply(mint, 60), 0);
                    var days = Math.floor(seconds / 86400);
                    seconds -= days * 86400;
                    if (days > 0) { response += days + 'days '; }

                    var hours = Math.floor(seconds / 3600) % 24;
                    seconds -= hours * 3600;
                    if (hours > 0) { response += hours + 'hrs '; }

                    var minutes = Math.floor(seconds / 60) % 60;
                    if (minutes > 0) { response += minutes + 'mins '; }

                    return response;
                }
                else {
                    return response;
                }
            }
            else { return response; }
        };
    }
    export function TwoDateDiff() {
        return (first: any,biji:any) => {
            var response: string = '';
            if (first) {
                var secs = math.round(moment(first).diff(biji, 'seconds') * -1, 0);
                if (secs > 0) {

                    var seconds: any = math.round(secs, 0);

                    var days = Math.floor(seconds / 86400);
                    seconds -= days * 86400;
                    if (days > 0) { response += days + 'd '; }

                    var hours = Math.floor(seconds / 3600) % 24;
                    seconds -= hours * 3600;
                    if (hours > 0) { response += hours + 'h '; }

                    var minutes = Math.floor(seconds / 60) % 60;
                    if (minutes > 0) { response += minutes + 'm '; }

                    seconds -= minutes * 60;
                    if (seconds > 0) { response += seconds+'s'; }

                    return response;
                }
                else {
                    return response;
                }
            }
            else { return response; }
        };
    }


    export function DateDiffTime() {
        return (input: any) => {
            var response: string = '';
            if (input) {
                var secs = math.round(moment().diff(input, 'seconds') * -1, 0);
                if (secs > 0) {

                    var seconds: any = math.round(secs, 0);

                    var days = Math.floor(seconds / 86400);
                    seconds -= days * 86400;
                    if (days > 0) { response += days + ':'; }

                    var hours = Math.floor(seconds / 3600) % 24;
                    seconds -= hours * 3600;
                    if (hours > 0) { response += hours.toString().lpad('0', 2) + ':'; } else { response += "00:"; }

                    var minutes = Math.floor(seconds / 60) % 60;
                    if (minutes > 0) { response += minutes.toString().lpad('0', 2) + ':'; } else { response += "00:"; }

                    seconds -= minutes * 60;
                    if (seconds > 0) { response += seconds.toString().lpad('0', 2); } else { response += "00"; }

                    return response;
                }
                else {
                    return response;
                }
            }
            else { return response; }
        };
    }
    export function DateDiffTime2() {
        return (input: any) => {
            var response: any = { days: 0, hrs: 0, min: 0, sec: 0, };
            if (input) {
                var secs = math.round(moment().diff(input, 'seconds') * -1, 0);
                if (secs > 0) {

                    var seconds: any = math.round(secs, 0);

                    var days = Math.floor(seconds / 86400);
                    seconds -= days * 86400;
                    if (days > 0) { response.days = days; }

                    var hours = Math.floor(seconds / 3600) % 24;
                    seconds -= hours * 3600;
                    if (hours > 0) { response.hrs = hours; }

                    var minutes = Math.floor(seconds / 60) % 60;
                    if (minutes > 0) { response.min = minutes; }

                    seconds -= minutes * 60;
                    if (seconds > 0) { response.sec = seconds; }

                    return response;
                }
                else {
                    return response;
                }
            }
            else { return response; }
        };
    }

    export function shortAddress() {
        return (input: any) => {
            if (input) {
                var char = 7;
                var output = input.substr(0, char);
                output = output + '...';
                output = output + input.substr((input.length - 4), 4);
                return output
            }
            else { return input; }
        };
    }
}
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