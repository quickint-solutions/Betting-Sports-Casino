namespace intranet.common {
    export interface IBetScopeBase extends ng.IScope {
        ctrl: any;
        $$destroyed: any;
        currentInlineBet: any;
        stopPPL: boolean;
        inlineOnMarketOnly: boolean;
        inlineElementId: any;
        isLMTAvailable: boolean;    
        inlineTRElementId: any;
    }
}