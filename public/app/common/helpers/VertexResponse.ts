namespace intranet.common.helpers {

    class VertexError {
        static errors: any[] = [];
        static getList(): any {
            this.errors.push({ Code: -5, Description: 'Trading session is closed' });
            this.errors.push({ Code: -6, Description: 'Request order is already processed' });
            this.errors.push({ Code: -2, Description: 'Not enough money to make a position' });
            this.errors.push({ Code: -10, Description: 'Position is already closed.' });
            this.errors.push({ Code: -4, Description: 'Hedging is not allowed' });
            this.errors.push({ Code: -11, Description: 'Position in pending mode' });
            this.errors.push({ Code: -50, Description: 'Market condition violated' });
            this.errors.push({ Code: -51, Description: 'Bad connection' });
            this.errors.push({ Code: -200, Description: 'Web Service internal error' });
            this.errors.push({ Code: -201, Description: 'Login is required' });
            this.errors.push({ Code: -202, Description: 'Invalid account identifier or account is not accessible by logged in client' });
            this.errors.push({ Code: -203, Description: 'Invalid ticket identifier or ticket is not accessible by logged in client' });
            this.errors.push({ Code: -204, Description: 'Invalid order identifier or order is not accessible by logged in client' });
            this.errors.push({ Code: -205, Description: 'Invalid amount' });
            this.errors.push({ Code: -206, Description: 'Error closing given tickets with each other' });
            this.errors.push({ Code: -207, Description: 'Invalid username or password' });
            this.errors.push({ Code: -208, Description: 'Invalid symbol name or identifier' });
            this.errors.push({ Code: -209, Description: 'Date format must be in DD/MM/YYYY format' });
            this.errors.push({ Code: -210, Description: 'No data found for given identifier' });
            this.errors.push({ Code: -211, Description: 'Order type is not buy neither sell' });
            this.errors.push({ Code: -212, Description: 'Could not delete limit order' });
            this.errors.push({ Code: -213, Description: 'Could not delete SLTP order' });
            this.errors.push({ Code: -214, Description: 'Could not update SLTP order' });
            this.errors.push({ Code: -215, Description: 'Could not place limit order ' });
            this.errors.push({ Code: -216, Description: 'Could not update limit order' });
            this.errors.push({ Code: -217, Description: 'Limit order not exist or processed' });
            this.errors.push({ Code: -218, Description: 'Limit order not exist or processed' });
            this.errors.push({ Code: -219, Description: 'Account is readonly, cannot trade' });
            this.errors.push({ Code: -220, Description: 'Account is locked, cannot trade' });
            this.errors.push({ Code: -221, Description: 'Could not send mail to department' });
            this.errors.push({ Code: -222, Description: 'Invalid user /sending failure ' });
            this.errors.push({ Code: -223, Description: 'Symbol is in just close only' });
            this.errors.push({ Code: -224, Description: 'Symbol in buy mode only' });
            this.errors.push({ Code: -225, Description: 'Not logical date' });
            this.errors.push({ Code: -226, Description: 'Deposit amount is not valid' });
            this.errors.push({ Code: -229, Description: 'Invalid order ID' });
            this.errors.push({ Code: -227, Description: 'Missing parameters or invalid given value.' });
            this.errors.push({ Code: -228, Description: 'Invalid price value.' });
            this.errors.push({ Code: -230, Description: 'Open managed order with a position previously had managed at the overall amount.' });
            this.errors.push({ Code: -231, Description: 'Login with a client does not have an account.' });
            this.errors.push({ Code: -232, Description: 'Not valid login .' });
            this.errors.push({ Code: -233, Description: 'Not valid money trans type.' });
            this.errors.push({ Code: -235, Description: 'Enter invalid serial.' });
            this.errors.push({ Code: -236, Description: 'When hedging not allowed.' });
            this.errors.push({ Code: -240, Description: 'Create client with used client username.' });
            this.errors.push({ Code: -241, Description: 'When making an operation the dealer does not have a privilege on it ' });
            this.errors.push({ Code: -242, Description: 'When passing invalid client id.' });
            this.errors.push({ Code: -243, Description: 'When making an operation on the position already closed ' });
            this.errors.push({ Code: -244, Description: 'When making an operation on the position has SLTP.' });
            this.errors.push({ Code: -246, Description: 'When making an operation on the position that already processed.' });
            this.errors.push({ Code: -247, Description: 'unexpected database error ' });
            this.errors.push({ Code: -1000, Description: 'Request returned 0 data in list' });
            this.errors.push({ Code: -1200, Description: 'GetHistory operation has returned more than 3000 rows and so you’ll need to call it with isPaging=true to retrieve remaning rows' });
            return this.errors;
        }
    }

    class VertexHistoryType {
        static htype: any[] = [];
        static getList(): any {
            this.htype.push({ Code: 'DB', Means: 'Deposit', IsDPAmount: true });
            this.htype.push({ Code: 'AJ', Means: 'Adjustment', IsDPAmount: true });
            this.htype.push({ Code: 'CI', Means: 'Credit In', IsDPAmount: true });
            this.htype.push({ Code: 'WD', Means: 'Withdrawal', IsDPAmount: true });
            this.htype.push({ Code: 'CO', Means: 'Credit Out', IsDPAmount: true });
            this.htype.push({ Code: 'SL', Means: 'Sell Limit' });
            this.htype.push({ Code: 'BL', Means: 'Buy Limit' });
            this.htype.push({ Code: 'BS', Means: 'Buy Stop' });
            this.htype.push({ Code: 'SS', Means: 'Sell Stop' });
            this.htype.push({ Code: 'SL/TP', Means: 'Sell Stop' });
            this.htype.push({ Code: 'L', Means: 'Close' });
            return this.htype;
        }
    }

    export class VertexHelper {

        constructor(private toasterService: intranet.common.services.ToasterService) {
        }

        public validate(response: any): boolean {
            var valid = true;
            if (response && jQuery.isArray(response)) {
                if (response.length == 1) {
                    if (response[0].ID < 0 || response[0].Ticket < 0) { response.splice(0); }
                }
                var ve = VertexError.getList();
                response.forEach((r: any) => {
                    var result = ve.filter((v: any) => { return v.Code == r; });
                    if (valid && result.length > 0) {
                        valid = false;
                        this.toasterService.showToast(ToastType.Error, result[0].Description, 2000);
                    }
                });
            }
            else {
                if (typeof response == 'string') { response = response.replaceAll('"', ''); }
                if (response && Utility.isInt(response)) {
                    var ve = VertexError.getList();
                    var result = ve.filter((v: any) => { return v.Code == response; });
                    if (result.length > 0) {
                        valid = false;
                        this.toasterService.showToast(ToastType.Error, result[0].Description, 2000);
                    }
                }
            }
            return valid;
        }

        public setHistoryType(history: any): void {
            if (history && jQuery.isArray(history)) {
                var ht = VertexHistoryType.getList();
                history.forEach((h: any) => {
                    var result = ht.filter((v: any) => { return v.Code == h.Type; });
                    if (result.length > 0) {
                        h.TypeText = result[0].Means;
                        h.IsDPAmount = result[0].IsDPAmount;
                    }
                    if (h.Type == 'L') { h.pl = h.ProfitLoss }
                    else {
                        if (h.ProfitLoss == -2) { h.pl = 'No Money'; }
                        else if (h.ProfitLoss == -3) { h.pl = 'CANCELLED'; }
                        else if (h.ProfitLoss == -4) { h.pl = 'Hedging'; }
                        else { h.pl = 'Done'; }
                    }
                });
            }
        }

        public groupPosition(response: any[]): any[] {
            var netTrade: any[] = [];

            var groupBy = ((buysell: any) => {
                var oneMode = response.filter((b: any) => { return b.BuySell == buysell; });
                var symbolId = oneMode.map((b: any) => { return b.Symbol; });
                symbolId = symbolId.filter((x, i, a) => a.indexOf(x) == i);
                symbolId.forEach((b: any) => {
                    var trade: any = {};
                    var matched = oneMode.filter((r: any) => { return r.Symbol == b; });
                    matched.forEach((m: any, index: any) => {
                        if (index == 0) {
                            trade.Symbol = m.Symbol;
                            trade.SymbolName = m.SymbolName;
                            trade.BuySell = m.BuySell;
                            trade.Amount = m.Amount;
                            trade.Commission = m.Commission;
                            trade.Interest = m.Interest;
                            trade.TotalOpenPrice = (m.Amount * m.OpenPrice);
                        } else {
                            trade.Amount = trade.Amount + m.Amount;
                            trade.Commission = trade.Commission + m.Commission;
                            trade.Interest = trade.Interest + m.Interest;
                            trade.TotalOpenPrice = trade.TotalOpenPrice + (m.Amount * m.OpenPrice);
                        }
                    });
                    trade.AvgOpenPrice = (trade.TotalOpenPrice / trade.Amount);
                    netTrade.push(trade);
                });
            });

            groupBy("1");
            groupBy("-1");
            return netTrade;
        }
    }

    angular.module('intranet.common.cache').service('vertexHelper', VertexHelper);
}