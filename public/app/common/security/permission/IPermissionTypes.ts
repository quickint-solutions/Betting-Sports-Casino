namespace intranet.common.security {
    export interface IPermissionTypes {
        ADMIN_AREA: string,
        CLEAR_CACHE: string,
        MANAGE_WEBSITE: string,
        MANAGE_PERMISSION: string,
        MANAGE_EVENT_TYPE: string,
        MANAGE_COMPETITION: string,
        MANAGE_EVENT: string,
        MANAGE_MARKET: string,
        MANAGE_RUNNER: string,
        MANAGE_LANGUAGE: string,
        MANAGE_TRANSLATION: string,
        VIEW_BETFAIR_ACCOUNT: string,
        VIEW_BETFAIR_SPORTS: string,
        MANAGE_BOT: string,
        MANAGE_BETFAIR_ACCOUNT: string,

        MANAGE_DEFAULT_PRICE: string;
        MANAGE_IP: string

        MASTER_AREA: string,
        VIEW_BET_BY_ID: string,
        LIVE_BETS: string,
        ADD_MEMBER: string,
        VIEW_MEMBER: string,
        EDIT_MEMBER: string,
        DW: string,
        VIEW_LOGIN_HISTORY_MEMBER: string,

        CLIENT_AREA: string,
        VIEW_LOGIN_HISTORY: string,
        MANAGE_STAKECONFIG: string,
        PLACE_BET: string,
        VIEW_BET: string,
        UPDATE_PROFILE: string,
        VIEW_BET_CONFIG: string;

        VIEW_MARKET: string,
        VIEW_LANGUAGE: string,
        CHANGE_PASSWORD: string,
        CHANGE_PASSWORD_MEMBER: string,
        VIEW_ACCOUNTING: string,
        VIEW_BALANCE: string,

        BM_AREA: string,

        MANAGE_COMMENTARY: string,
        MANAGE_SETTING: string,
        MANAGE_VIDEO: string,
        VIEW_BETFAIR_BET: string,

        ADMIN_MYREPORT: string,
        MANAGE_MARKETRULE: string,
        VIEW_VIDEO: string,

        VIEW_LOGIN_HISTORY_OPERATOR: string,
        OPERATOR_AREA: string

        MANAGE_PAYMENT_NUMBER: string;
        ADMIN_PAYTMWITHDRAWAL_MANAGE: string;


        // custom from UI
        UI_CLIENT_DEPOSIT_WITHDRAWAL: string;
        ADMIN_MARKET_RECLOSE: string;

        UPDATE_PT_CONFIG: string;
        VIEW_PT_CONFIG: string;

        EVENT_MANAGEMENT: string;

        UPDATE_NOTIFICATION: string;
        VIEW_NOTIFICATION: string;

        MANAGE_ADMIN_USER: string;


        MANAGE_DOWNLINE_FULLACCESS: string;
        MANAGE_DOWNLINE_VIEW_ONLY: string;
        TRANSFER_FULLACCESS: string;
        RISK_MANAGEMENT_FULLACCESS: string;
        REPORTS_FULLACCESS: string;
        PT_ON_OFF_FULLACCESS: string;
        STATEMENTS_FULLACCESS: string;
        AGGREGATE_ACCOUNTS_FULLACCESS: string;
        BANKING_DW_FULLACCESS: string;

        ADMIN_MEMBER_MANAGE: string;
        ADMIN_SMSCONFIG_MANAGE: string;
        MANAGE_FAIRXPAY_REQUEST: string;
    }
}