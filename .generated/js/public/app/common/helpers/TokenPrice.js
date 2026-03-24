var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class TokenHelper {
                static GetTokenBalance(walletAddress) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var tokenRouter = yield this.getTokenContract();
                        let balance = yield tokenRouter.methods.balanceOf(walletAddress).call();
                        return this.web3.utils.fromWei(balance, "ether");
                    });
                }
                static getTokenContract() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield (new this.web3.eth.Contract(this.tokenAbi, this.tokenAddress));
                    });
                }
                static setDecimals(number, decimals) {
                    number = number.toString();
                    let numberAbs = number.split('.')[0];
                    let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
                    while (numberDecimals.length < decimals) {
                        numberDecimals += "0";
                    }
                    return numberAbs + numberDecimals;
                }
                static estimateGasFee(transfer, from) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield transfer.estimateGas({ from: from })
                            .then(function (gasAmount) {
                            return gasAmount;
                        })
                            .catch(function (error) {
                            console.log(error);
                            return 100000;
                        });
                    });
                }
            }
            helpers.TokenHelper = TokenHelper;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TokenPrice.js.map