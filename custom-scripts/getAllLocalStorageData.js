/* ==================================================================
 *  getAllLocalStorageData.js
 *  ------------------------------------------------------------------
 *  Reads EVERY encrypted entry stored in the browser's localStorage
 *  (the ones saved by LocalStorageHelper) and returns one plain
 *  JSON object containing all of it, decrypted.
 *
 *  >>> WHAT YOU HAVE TO PASS <<<
 *      Only ONE value:  prefix   (string, required)
 *
 *      "prefix" is the app prefix that was used when data was
 *      originally stored. In this codebase the rule is:
 *          prefix = "aale_" + settings.WebApp
 *      e.g.  "aale_fairbook", "aale_drpapaya", "aale_one247", ...
 *
 *      How to find yours:
 *          DevTools -> Application -> Local Storage -> pick any key;
 *          everything before the "@..." garbled part is the prefix.
 *
 *  >>> PREREQUISITES ON THE PAGE <<<
 *      1. CryptoJS (with TripleDES + enc-utf8) must be loaded:
 *         <script src="https://cdnjs.cloudflare.com/ajax/libs/
 *                       crypto-js/3.1.9-1/crypto-js.js"></script>
 *      2. That's it. Everything else uses browser built-ins
 *         (window.localStorage, window.atob).
 *
 *  >>> HOW TO USE <<<
 *      // Simplest — pass just the prefix:
 *      var data = getAllLocalStorageData('aale_fairbook');
 *      console.log(data);
 *
 *      // Or pass an options object for finer control:
 *      var data = getAllLocalStorageData({
 *          prefix:  'aale_fairbook',
 *          crypto:  window.CryptoJS,      // optional
 *          storage: window.localStorage,  // optional (or sessionStorage)
 *          base64:  { encode: btoa, decode: atob } // optional
 *      });
 *
 *  >>> WHAT YOU GET BACK <<<
 *      {
 *        "userdata":         { user: {...}, token: {...}, currency: {...}, claims: [...] },
 *        "refer-token":      "concurrency-token-string",
 *        "auth-refer-token": "auth-token-string",
 *        "claims":           { claims: [...] },
 *        ... every other key stored by the app ...
 *      }
 *
 *  >>> QUICK TEST IN DEVTOOLS CONSOLE <<<
 *      getAllLocalStorageData('aale_fairbook')
 * ================================================================ */
(function (root) {
    'use strict';

    function getAllLocalStorageData(opts) {
        // Allow calling with a plain string prefix for convenience:
        //     getAllLocalStorageData('aale_fairbook')
        if (typeof opts === 'string') { opts = { prefix: opts }; }
        opts = opts || {};

        var prefix  = opts.prefix;
        var crypto  = opts.crypto  || root.CryptoJS;
        var storage = opts.storage || root.localStorage;
        var base64  = opts.base64  || {
            encode: function (s) { return root.btoa(s); },
            decode: function (s) { return root.atob(s); }
        };

        if (!prefix) {
            throw new Error('getAllLocalStorageData: "prefix" is required (e.g. "aale_fairbook").');
        }
        if (!crypto || !crypto.TripleDES) {
            throw new Error('getAllLocalStorageData: CryptoJS (with TripleDES) is not loaded on the page.');
        }
        if (!storage) {
            throw new Error('getAllLocalStorageData: no Storage object available.');
        }

        var result = {};

        for (var i = 0; i < storage.length; i++) {
            var encKey = storage.key(i);
            if (!encKey) { continue; }

            try {
                var originalKey = base64.decode(encKey);
                var encValue    = storage.getItem(encKey);
                if (!encValue) { continue; }

                var dcMsg = crypto.TripleDES.decrypt(encValue, prefix + '@' + originalKey);
                if (!dcMsg) { continue; }

                var plain = dcMsg.toString(crypto.enc.Utf8);
                if (!plain) { continue; }

                try   { result[originalKey] = JSON.parse(plain); }
                catch (e) { result[originalKey] = plain; }
            } catch (ex) {
                // Key not written by this app (or wrong prefix) — skip silently.
                continue;
            }
        }

        return result;
    }

    // Expose globally for browser / DevTools use
    if (root) { root.getAllLocalStorageData = getAllLocalStorageData; }

    // CommonJS export (Node / bundlers)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = getAllLocalStorageData;
    }
})(typeof window !== 'undefined' ? window : this);
