namespace intranet.common.helpers {

    export class TokenHelper {
        static web3;
        static tokenAbi;
        static tokenAddress;

        static async GetTokenBalance(walletAddress) {
            var tokenRouter = await this.getTokenContract();
            let balance = await tokenRouter.methods.balanceOf(walletAddress).call();
            return this.web3.utils.fromWei(balance, "ether");
        }

        static async getTokenContract() {
            return await (new this.web3.eth.Contract(this.tokenAbi, this.tokenAddress));
        }

        static setDecimals(number, decimals) {
            number = number.toString();
            let numberAbs = number.split('.')[0]
            let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
            while (numberDecimals.length < decimals) {
                numberDecimals += "0";
            }
            return numberAbs + numberDecimals;
        }


        static async estimateGasFee(transfer, from) {
            return await transfer.estimateGas({ from: from })
                .then(function (gasAmount) {
                    return gasAmount;
                })
                .catch(function (error) {
                    console.log(error);
                    return 100000;
                });
        }
       
    }
}