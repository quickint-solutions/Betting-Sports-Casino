namespace intranet.common.helpers {

    interface EnumItem<E> { id: number; name: string; }

    class Priceladders {
        static getRange(): any[] {
            var range: any[] = [];
            range.push({ min: 1.01, max: 2, interval: 0.01 });
            range.push({ min: 2, max: 3, interval: 0.02 });
            range.push({ min: 3, max: 4, interval: 0.05 });
            range.push({ min: 4, max: 6, interval: 0.1 });
            range.push({ min: 6, max: 10, interval: 0.2 });
            range.push({ min: 10, max: 20, interval: 0.5 });
            range.push({ min: 20, max: 30, interval: 1 });
            range.push({ min: 30, max: 50, interval: 2 });
            range.push({ min: 50, max: 100, interval: 5 });
            range.push({ min: 100, max: 1000, interval: 10 });
            return range;
        }
    }

    class PriceVariation {

        static getRange(): any[] {
            var range: any[] = [];
            range.push({ min: 101, max: 120, interval: 2 });
            range.push({ min: 121, max: 140, interval: 3 });
            range.push({ min: 141, max: 190, interval: 4 });
            range.push({ min: 191, max: 100000, interval: 5 });
            return range;
        }
    }


    export class Utility {
        public static enumToArray<E>(Enum: E): EnumItem<E>[] {
            var result = Object.keys(Enum).map(key => ({ id: Enum[key], name: key } as EnumItem<E>));
            return result.slice(result.length / 2);
        }

        public static isInt(n): any {
            return n % 1 === 0;
        }

        public static isFloat(n): any {
            return Number(n) === n && n % 1 !== 0;
        }

        public static IndexOfObject(objectArray, property, searchTerm, lower = false): number {
            for (var i = 0, len = objectArray.length; i < len; i++) {
                if (lower) {
                    if ((objectArray[i][property]).toLowerCase() === searchTerm.toLowerCase()) {
                        return i;
                    }
                }
                else {
                    if (objectArray[i][property] == searchTerm) {
                        return i;
                    }
                }
            }
            return -1;
        }

        public static GetPriceLadderUPRange(odds: number): any {
            var range = Priceladders.getRange();
            var result: any;
            range.forEach((v: any) => {
                if (odds >= v.min && odds < v.max) {
                    result = v;
                }
            });
            return result;
        }

        public static getPriceVariation(odds: any): any {
            var range = PriceVariation.getRange();
            var result: any, tempOdds: any;
            tempOdds = math.multiply(odds, 100);
            range.forEach((v: any) => {
                if (tempOdds >= v.min && tempOdds <= v.max) {
                    result = v.interval;
                }
            });
            return result;
        }

        public static GetPriceLadderDOWNRange(odds: number): any {
            var range = Priceladders.getRange();
            var result: any;
            range.forEach((v: any) => {
                if (odds > v.min && odds <= v.max) {
                    result = v;
                }
            });
            return result;
        }

        public static objectToArray(obj: any): any {
            var result = Object.keys(obj).map(function (key) {
                return [key, obj[key]];
            });
            return result;
        }

        public static getAllFirstChar(str: any): any {
            var matches = str.match(/\b(\w)/g);
            var acronym = matches.join('');
            return acronym;
        }

        public static fromDateUTC(fromdate: any): any {
            if (fromdate) {
                var fDate: any = new Date(fromdate.getFullYear(), fromdate.getMonth(), fromdate.getDate());
                fDate = moment(fDate).utc().format();
                return fDate;
            } else {
                return fromdate;
            }
        }

        public static toDateUTC(todate: any): any {
            if (todate) {
                var fDate: any = new Date(todate.getFullYear(), todate.getMonth(), todate.getDate(), 24, 0, 0, 0);
                fDate = moment(fDate).utc().format();
                return fDate;
            } else {
                return todate;
            }
        }

        public static fromDateUTCZero(fromdate: any): any {
            if (fromdate) {
                var fDate: any = new Date(fromdate.getFullYear(), fromdate.getMonth(), fromdate.getDate(), 0, 0, 0, 0);
                fDate = moment(fDate).utcOffset(0, true).format();
                return fDate;
            } else {
                return fromdate;
            }
        }

        public static toDateUTCZero(todate: any): any {
            if (todate) {
                var fDate: any = new Date(todate.getFullYear(), todate.getMonth(), todate.getDate(), 23, 59, 59, 999);
                fDate = moment(fDate).utcOffset(0, true).format();
                return fDate;
            } else {
                return todate;
            }
        }

        public static fromDateUTCIST(fromdate: any): any {
            if (fromdate) {
                var fDate: any = new Date(fromdate.getFullYear(), fromdate.getMonth(), fromdate.getDate(), 0, 0, 0, 0);
                fDate = moment(fDate).utcOffset(0, true).subtract(5, 'hours').subtract(30, 'minutes').format();

                return fDate;
            } else {
                return fromdate;
            }
        }

        public static toDateUTCIST(todate: any): any {
            if (todate) {
                var fDate: any = new Date(todate.getFullYear(), todate.getMonth(), todate.getDate(), 24, 0, 0, 999);
                fDate = moment(fDate).utcOffset(0, true).subtract(5, 'hours').subtract(30, 'minutes').format();
                return fDate;
            } else {
                return todate;
            }
        }
    }
}

interface String {
    format(...replacements: string[]): string;
    rpad(padString, length): string;
    lpad(padString, length): string;
    replaceAll(search: any, replacement: any): string;
    replaceAllWithEsc(search: any, replacement: any): string;
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}


if (!String.prototype.rpad) {
    String.prototype.rpad = function (padString, length) {
        var str = this;
        while (str.length <= length)
            str = str + padString;
        return str;
    }
}
if (!String.prototype.lpad) {
    String.prototype.lpad = function (padString, length) {
        var str = this;
        while (str.length < length)
            str = padString + str;
        return str;
    }
}
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    }
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
if (!String.prototype.replaceAllWithEsc) {
    String.prototype.replaceAllWithEsc = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
    }
}

function waitForElement(elementId, callBack, byClass = false) {
    window.setTimeout(function () {
        var element = byClass ? document.getElementsByClassName(elementId) : document.getElementById(elementId);
        if (element) {
            callBack(elementId, element);
        } else {
            waitForElement(elementId, callBack);
        }
    }, 500)
}