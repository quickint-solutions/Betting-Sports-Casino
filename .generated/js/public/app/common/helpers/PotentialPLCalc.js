var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class PotentialPLCalc {
                static calcPL(market, bets) {
                    if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE
                        || market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                        market.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    mr.pPL = math.add(b.size, mr.pPL);
                                }
                            });
                            if (mr.pPL != 0) {
                                if (!mr.pl) {
                                    mr.pl = 0;
                                }
                                if (mr.pl != 0) {
                                    mr.pl = mr.pl.toString().replaceAll(',', '');
                                }
                                mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                            }
                        });
                    }
                    else if (market.bettingType == common.enums.BettingType.ASIAN_HANDICAP_SINGLE_LINE) {
                        market.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.multiply(math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL), -1);
                                    }
                                }
                            });
                            if (mr.pPL != 0) {
                                if (mr.pl != 0) {
                                    mr.pl = mr.pl.toString().replaceAll(',', '');
                                }
                                mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.AndarBahar || market.gameType == common.enums.GameType.Patti3 ||
                        market.gameType == common.enums.GameType.Patti2 || market.gameType == common.enums.GameType.Poker) {
                        market.marketRunner.forEach((mr) => {
                            mr.pstake = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pstake = math.add(b.size, mr.pstake);
                                    }
                                }
                            });
                            if (mr.pstake != 0) {
                                if (mr.stake != 0) {
                                    mr.stake = mr.stake.toString().replaceAll(',', '');
                                }
                                mr.pstake = math.round(math.sum(mr.stake, mr.pstake), 2);
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.Card32) {
                        var oddsRunnerId = market.marketRunner.filter((m, index) => { return m.metadata.runnerGroup == 'Winner'; }).map((m) => { return m.runner.id; }) || [];
                        var anyCardRunnerId = market.marketRunner.filter((m, index) => { return m.metadata.runnerGroup == 'AnyCard'; }).map((m) => { return m.runner.id; }) || [];
                        var maxTotalRunnerId = market.marketRunner.filter((m, index) => { return m.metadata.runnerGroup == 'MaxTotal'; }).map((m) => { return m.runner.id; }) || [];
                        market.marketRunner.forEach((mr, index) => {
                            if (mr.metadata.runnerGroup == 'Winner') {
                                mr.pPL = 0;
                                bets.forEach((b) => {
                                    if (oddsRunnerId.some((r) => { return r == b.runnerId; })) {
                                        if (b.runnerId == mr.runner.id) {
                                            if (b.side == 1) {
                                                mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                            }
                                            else {
                                                mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                                            }
                                        }
                                        else {
                                            if (b.side == 1) {
                                                mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                                            }
                                            else {
                                                mr.pPL = math.add(b.size, mr.pPL);
                                            }
                                        }
                                    }
                                });
                                if (mr.pPL != 0) {
                                    if (mr.pl != 0) {
                                        mr.pl = mr.pl.toString().replaceAll(',', '');
                                    }
                                    mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                                }
                            }
                            else if (mr.metadata.runnerGroup == 'AnyCard') {
                                mr.pPL = 0;
                                bets.forEach((b) => {
                                    if (anyCardRunnerId.some((r) => { return r == b.runnerId; })) {
                                        if (b.runnerId == mr.runner.id) {
                                            if (b.side == 1) {
                                                mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                            }
                                            else {
                                                mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                                            }
                                        }
                                        else {
                                            if (b.side == 1) {
                                                mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                                            }
                                            else {
                                                mr.pPL = math.add(b.size, mr.pPL);
                                            }
                                        }
                                    }
                                });
                                if (mr.pPL != 0) {
                                    if (mr.pl != 0) {
                                        mr.pl = mr.pl.toString().replaceAll(',', '');
                                    }
                                    mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                                }
                            }
                            else if (mr.metadata.runnerGroup == 'OddEven' || mr.metadata.runnerGroup == 'MaxTotal') {
                                mr.pstake = 0;
                                bets.forEach((b) => {
                                    if (b.runnerId == mr.runner.id) {
                                        if (b.side == 1) {
                                            mr.pstake = math.add(b.size, mr.pstake);
                                        }
                                    }
                                });
                                if (mr.pstake != 0) {
                                    if (mr.stake != 0) {
                                        mr.stake = mr.stake.toString().replaceAll(',', '');
                                    }
                                    mr.pstake = math.round(math.sum(mr.stake, mr.pstake), 2);
                                }
                            }
                            else if (mr.metadata.runnerGroup == 'LuckyNumber') {
                                mr.metadata.card32.forEach((d) => {
                                    d.pstake = 0;
                                    bets.forEach((b) => {
                                        if (b.runnerId == mr.runner.id) {
                                            if (b.side == 1) {
                                                if (d.id == b.sectionId) {
                                                    d.pstake = math.add(b.size, d.pstake);
                                                }
                                            }
                                        }
                                    });
                                });
                                mr.metadata.card32.forEach((d) => {
                                    if (d.pstake != 0) {
                                        if (d.stake && d.stake != 0) {
                                            d.stake = d.stake.toString().replaceAll(',', '');
                                        }
                                        d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                                    }
                                });
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.ClashOfKings) {
                        market.marketRunner.forEach((mr, index) => {
                            if (mr.metadata.clashOfKing) {
                                mr.metadata.clashOfKing.forEach((d) => {
                                    d.pstake = 0;
                                    bets.forEach((b) => {
                                        if (b.runnerId == mr.runner.id) {
                                            if (b.side == 1) {
                                                if (d.id == b.sectionId) {
                                                    d.pstake = math.add(b.size, d.pstake);
                                                }
                                            }
                                        }
                                    });
                                });
                                mr.metadata.clashOfKing.forEach((d) => {
                                    if (d.pstake != 0) {
                                        if (d.stake && d.stake != 0) {
                                            d.stake = d.stake.toString().replaceAll(',', '');
                                        }
                                        d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                                    }
                                });
                            }
                        });
                    }
                    else if (market.gameType == common.enums.GameType.Up7Down) {
                        market.marketRunner.forEach((mr) => {
                            mr.metadata.up7down.forEach((d) => {
                                d.pstake = 0;
                                bets.forEach((b) => {
                                    if (b.runnerId == mr.runner.id) {
                                        if (b.side == 1) {
                                            if (d.id == b.sectionId) {
                                                d.pstake = math.add(b.size, d.pstake);
                                            }
                                        }
                                    }
                                });
                            });
                            mr.metadata.up7down.forEach((d) => {
                                if (d.pstake != 0) {
                                    if (d.stake && d.stake != 0) {
                                        d.stake = d.stake.toString().replaceAll(',', '');
                                    }
                                    d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                                }
                            });
                        });
                    }
                    else if (market.gameType == common.enums.GameType.DragonTiger) {
                        market.marketRunner.forEach((mr) => {
                            if (mr.metadata) {
                                mr.metadata.dragonTiger.forEach((d) => {
                                    d.pstake = 0;
                                    bets.forEach((b) => {
                                        if (b.runnerId == mr.runner.id) {
                                            if (b.side == 1) {
                                                if (d.id == b.sectionId) {
                                                    d.pstake = math.add(b.size, d.pstake);
                                                }
                                            }
                                        }
                                    });
                                });
                                mr.metadata.dragonTiger.forEach((d) => {
                                    if (d.pstake != 0) {
                                        if (d.stake && d.stake != 0) {
                                            d.stake = d.stake.toString().replaceAll(',', '');
                                        }
                                        d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                                    }
                                });
                            }
                            else {
                                mr.pstake = 0;
                                bets.forEach((b) => {
                                    if (b.runnerId == mr.runner.id) {
                                        if (b.side == 1) {
                                            mr.pstake = math.add(b.size, mr.pstake);
                                        }
                                    }
                                });
                                if (mr.pstake != 0) {
                                    if (mr.stake != 0) {
                                        mr.stake = mr.stake.toString().replaceAll(',', '');
                                    }
                                    mr.pstake = math.round(math.sum(mr.stake, mr.pstake), 2);
                                }
                            }
                        });
                    }
                    else {
                        market.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                                    }
                                }
                                else {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.add(b.size, mr.pPL);
                                    }
                                }
                            });
                            if (mr.pPL != 0) {
                                if (mr.pl != 0) {
                                    mr.pl = mr.pl.toString().replaceAll(',', '');
                                }
                                mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                            }
                        });
                    }
                }
                static calcPLProjection(scopeMarket, bets) {
                    var market = {};
                    angular.copy(scopeMarket, market);
                    if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE || market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                        market.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    mr.pPL = math.add(b.size, mr.pPL);
                                }
                            });
                            if (mr.pPL != 0) {
                                if (!mr.pl) {
                                    mr.pl = 0;
                                }
                                if (mr.pl != 0) {
                                    mr.pl = mr.pl.toString().replaceAll(',', '');
                                }
                                mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                            }
                        });
                    }
                    else if (market.bettingType == common.enums.BettingType.ASIAN_HANDICAP_SINGLE_LINE) {
                        market.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.multiply(math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL), -1);
                                    }
                                }
                            });
                            if (mr.pPL != 0) {
                                if (mr.pl != 0) {
                                    mr.pl = mr.pl.toString().replaceAll(',', '');
                                }
                                mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                            }
                        });
                    }
                    else {
                        market.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            bets.forEach((b) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                                    }
                                }
                                else {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.add(b.size, mr.pPL);
                                    }
                                }
                            });
                            if (mr.pPL != 0) {
                                if (mr.pl != 0) {
                                    mr.pl = mr.pl.toString().replaceAll(',', '');
                                }
                                mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                            }
                        });
                    }
                    return market;
                }
            }
            helpers.PotentialPLCalc = PotentialPLCalc;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PotentialPLCalc.js.map