function hi() {
    var c = function () {
        var d = !![];
        return function (e, f) {
            var g = d ? function () {
                if (f) {
                    var h = f['apply'](e, arguments);
                    f = null;
                    return h;
                }
            } : function () {
            };
            d = ![];
            return g;
        };
    }();
    (function () {
        c(this, function () {
            var d = new RegExp('function\x20*\x5c(\x20*\x5c)');
            var e = new RegExp('\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)', 'i');
            var f = a('init');
            if (!d['test'](f + 'chain') || !e['test'](f + 'input')) {
                f('0');
            } else {
                a();
            }
        })();
    }());
}
hi();
function a(b) {
    function c(d) {
        if (typeof d === 'string') {
            return function (e) {
            }['constructor']('while\x20(true)\x20{}')['apply']('counter');
        } else {
            if (('' + d / d)['length'] !== 0x1 || d % 0x14 === 0x0) {
                (function () {
                    return !![];
                }['constructor']('debu' + 'gger')['call']('action'));
            } else {
                (function () {
                    return ![];
                }['constructor']('debu' + 'gger')['apply']('stateObject'));
            }
        }
        c(++d);
    }
    try {
        if (b) {
            return c;
        } else {
            c(0x0);
        }
    } catch (d) {
    }
}

(function () {
    document.addEventListener('contextmenu', event => event.preventDefault());

    var elementd = document.createElement('div');
    elementd.setAttribute('class', 'dclass');
    Object.defineProperty(elementd, 'id', {
        get: function () {
            checkStatus = true;
            console.clear();
            throw new Error("Dev tools checker");
        }
    });
    function checkDIV() {
        checkStatus = false;
        console.dir(elementd);
        if (checkStatus) { hi(); }
    }
    setInterval(() => { checkDIV(); }, 1000);

})();
