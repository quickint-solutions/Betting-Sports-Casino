
namespace intranet.common.factory {
    export class WSSocketFactory {
        static create(): any {
            var factory = ($websocket, settings: common.IBaseSettings, $rootScope: any,
                localStorageHelper: any, $timeout: any, $location: ng.ILocationService) => {

                var authenticated: boolean = false;
                var currentController: any;
                var pinpongTimer: any;
                var ws: any;
                var Token = localStorageHelper.get(settings.TokenStorageKey);

                function connectWSS() {
                    //var currentUserType: any = undefined;
                    //var result = localStorageHelper.get(settings.UserData);
                    //if (result && result.user) {
                    //    currentUserType = result.user.userType;
                    //}

                    //if (currentUserType == common.enums.UserType.BM
                    //    || currentUserType == common.enums.UserType.SBM) {
                    //    console.log('ws not required');
                    //    return;
                    //}

                    if ($location.url().indexOf('/fairtrade') >= 0 || $location.url().indexOf('/mfairtrade') >= 0) {
                        console.log('ws not required');
                        return;
                    }

                    if (ws && ws != undefined && ws != null) {
                        console.log('ws found ' + moment().format("HH:mm:ss SSS"));
                        if (ws.readyState < 2)
                            closeSocket();

                    }
                    ws = $websocket(settings.WSUrl, { reconnectIfNotNormalClose: true });


                    // first authorize
                    ws.onOpen(function (message) {
                        console.log('ws connected ' + moment().format("HH:mm:ss SSS"));
                        authorizeSocket();
                    });

                    ws.onError(function (error) {
                        $rootScope.socketConnected = false;
                        JSON.stringify(error, ["message", "arguments", "type", "name"]);
                        stopPingPong();
                        ws.close();
                    });

                    ws.onClose(function (msg) {
                        $rootScope.socketConnected = false;
                        console.log('ws close ' + msg.code + ' - ' + new Date() + ' -' + msg.reason);
                        
                        stopPingPong();
                        if (msg.code != 1000) {
                            //startRetryOpen(5000);
                        } else {
                            // currentController = undefined;
                        }
                    });

                    ws.onMessage(function (message) {
                        if (message && message.data) {
                            var data: any = JSON.parse(message.data);
                            if (data.wsMessageType == common.enums.WSMessageType.BetSize) {
                                $rootScope.$emit("ws-betsize-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.Score) {
                                $rootScope.$emit("ws-score-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.MarketCount) {
                                $rootScope.$emit("ws-marketcount-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.Announcement) {
                                $rootScope.$emit("ws-announcement-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.MasterAnnouncement) {
                                $rootScope.$emit("ws-masterannouncement-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.Balance) {
                                $rootScope.$emit("ws-balance-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.OddsChanged) {
                                $rootScope.socketConnected = true;
                                $rootScope.$emit("ws-marketodds-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.ListSocket) {
                                $rootScope.$emit("ws-listsocket-changed", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.DepositRequest) {
                                $rootScope.$emit("ws-deposit-request", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.WithdrawalRequest) {
                                $rootScope.$emit("ws-withdrawal-request", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.DepositRequestConfirm) {
                                $rootScope.$emit("ws-deposit-request-confirm", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.WithdrawalRequestConfirm) {
                                $rootScope.$emit("ws-withdrawal-request-confirm", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.OtherLogin) {
                                $rootScope.$emit("ws-other-login-found", data);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.Error) {
                                startRetryOpen(5000);
                            }
                            else if (data.wsMessageType == common.enums.WSMessageType.Auth) {
                                if (!data.success) {
                                    console.log('ws authorize failed from server');
                                    authenticated = false;
                                    //closeSocket();
                                    $rootScope.$emit('logoutme');
                                } else {
                                    $rootScope.socketConnected = true;
                                    authenticated = true;
                                    pingPong();
                                    if (currentController) {
                                        if (currentController.wssReconnected) {
                                            console.log('ws resubscribed ' + moment().format("HH:mm:ss SSS"));
                                            currentController.wssReconnected();
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                if (Token && Token != null) {
                    connectWSS();
                }

                var authorizeSocket = (() => {
                    $timeout(() => {
                        console.log('ws authorize ' + moment().format("HH:mm:ss SSS"));
                        if (settings.IsFaaS) {
                            var operatorId = localStorageHelper.get("operator");
                            var token = localStorageHelper.get(settings.TokenStorageKey);
                            var MessageType = common.enums.WSMessageType.Auth;
                            ws.send(JSON.stringify({ token: token, messageType: MessageType, operatorId: operatorId }));
                        }
                        else {
                            var token = localStorageHelper.get(settings.TokenStorageKey);
                            var authToken = localStorageHelper.get(settings.AuthTokenStorageKey);
                            var MessageType = common.enums.WSMessageType.Auth;
                            ws.send(JSON.stringify({ token: token, authToken: authToken, messageType: MessageType }));
                        }
                    }, 10);
                });

                var retryCount = 100;

                var startRetryOpen = ((sec = 10000) => {
                    if (retryCount > 0) {
                        retryCount = retryCount - 1;
                        console.log('in retry');
                        $timeout(() => {
                            connectWSS();
                        }, sec);
                    }
                });

                var pingPong = (() => {
                    pinpongTimer = $timeout(() => {
                        ws.send(JSON.stringify({ messageType: common.enums.WSMessageType.Ping }));
                        pingPong();
                    }, 2 * 60 * 1000);
                });

                var stopPingPong = (() => {
                    if (pinpongTimer) { $timeout.cancel(pinpongTimer); }
                });

                var closeSocket = (() => {
                    if (ws) { ws.send(JSON.stringify({ messageType: common.enums.WSMessageType.Close })); }
                });

                return {
                    sendMessage: (message: any) => {
                        if (authenticated) {
                            if (message && message.Mids) { console.log('ws send ' + message.Mids.length); }
                            if (ws.readyState == 1) ws.send(JSON.stringify(message));
                        }
                    },
                    closeWs: () => {
                        closeSocket();
                    },
                    connetWs: () => {
                        connectWSS();
                    },
                    setController: (ctrl: any) => {
                        currentController = ctrl;
                    }
                }
            };
            factory.$inject = ['$websocket', 'settings', '$rootScope', 'localStorageHelper', '$timeout','$location'];
            return factory;
        }
    }

    angular.module('intranet.common.services').factory('WSSocketService', WSSocketFactory.create());
}