var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var factory;
        (function (factory_1) {
            class WSFairTradeSocketFactory {
                static create() {
                    var factory = ($websocket, settings, $rootScope, localStorageHelper, $timeout, $location) => {
                        var authenticated = false;
                        var currentController;
                        var pinpongTimer;
                        var ws;
                        var Token = localStorageHelper.get(settings.TokenStorageKey);
                        function connectWSS() {
                            if ($location.url().indexOf('/fairtrade') < 0 && $location.url().indexOf('/mfairtrade') < 0) {
                                console.log('wsft not required');
                                return;
                            }
                            if (ws && ws != undefined && ws != null) {
                                console.log('wsft found ' + moment().format("HH:mm:ss SSS"));
                                if (ws.readyState < 2)
                                    closeSocket();
                            }
                            ws = $websocket(settings.WSFTUrl, { reconnectIfNotNormalClose: true });
                            ws.onOpen(function (message) {
                                console.log('wsft connected ' + moment().format("HH:mm:ss SSS"));
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
                                console.log('wsft close ' + msg.code + ' - ' + moment().format("HH:mm:ss SSS") + ' - ' + msg.reason);
                                stopPingPong();
                                if (msg.code != 1000) {
                                }
                                else {
                                }
                            });
                            ws.onMessage(function (message) {
                                if (message && message.data) {
                                    var data = JSON.parse(message.data);
                                    if (data.wsMessageType == common.enums.WSMessageType.SymbolTickPrice) {
                                        $rootScope.$emit("ws-symbol-tick-changed", data);
                                    }
                                    else if (data.wsMessageType == common.enums.WSMessageType.SymbolDepth) {
                                        $rootScope.$emit("ws-symbol-depth-changed", data);
                                    }
                                    else if (data.wsMessageType == common.enums.WSMessageType.SymbolTrade) {
                                        $rootScope.$emit("ws-symbol-trade-changed", data);
                                    }
                                    else if (data.wsMessageType == common.enums.WSMessageType.SymbolKLine) {
                                        $rootScope.$emit("ws-symbol-kline-changed", data);
                                    }
                                    else if (data.wsMessageType == common.enums.WSMessageType.SymbolMark) {
                                        $rootScope.$emit("ws-symbol-mark-changed", data);
                                    }
                                    else if (data.wsMessageType == common.enums.WSMessageType.Error) {
                                        startRetryOpen(5000);
                                    }
                                    else if (data.wsMessageType == common.enums.WSMessageType.Auth) {
                                        if (!data.success) {
                                            console.log('wsft authorize failed from server');
                                            authenticated = false;
                                            $rootScope.$emit('logoutme');
                                        }
                                        else {
                                            ws.send(JSON.stringify({ Symb: ['BTCUSDT'], messageType: 107 }));
                                            $rootScope.socketConnected = true;
                                            authenticated = true;
                                            pingPong();
                                            if (currentController) {
                                                if (currentController.wssReconnected) {
                                                    console.log('wsft resubscribed ' + moment().format("HH:mm:ss SSS"));
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
                                console.log('wsft authorize ' + moment().format("HH:mm:ss SSS"));
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
                            if (pinpongTimer) {
                                $timeout.cancel(pinpongTimer);
                            }
                        });
                        var closeSocket = (() => {
                            if (ws) {
                                ws.send(JSON.stringify({ messageType: common.enums.WSMessageType.Close }));
                            }
                        });
                        return {
                            sendMessage: (message) => {
                                if (authenticated) {
                                    if (message && message.Symb) {
                                        console.log('wsft send ' + message.Symb.length);
                                    }
                                    if (ws.readyState == 1)
                                        ws.send(JSON.stringify(message));
                                }
                            },
                            closeWs: () => {
                                closeSocket();
                            },
                            connetWs: () => {
                                connectWSS();
                            },
                            setController: (ctrl) => {
                                currentController = ctrl;
                            }
                        };
                    };
                    factory.$inject = ['$websocket', 'settings', '$rootScope', 'localStorageHelper', '$timeout', '$location'];
                    return factory;
                }
            }
            factory_1.WSFairTradeSocketFactory = WSFairTradeSocketFactory;
            angular.module('intranet.common.services').factory('WSFairTradeSocketService', WSFairTradeSocketFactory.create());
        })(factory = common.factory || (common.factory = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WSFairTradeFactory.js.map