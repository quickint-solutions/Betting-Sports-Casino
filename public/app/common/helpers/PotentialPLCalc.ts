namespace intranet.common.helpers {
    export class PotentialPLCalc {

        public static calcPL(market: any, bets: any): void {
            if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE
                || market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                market.marketRunner.forEach((mr: any) => {
                    mr.pPL = 0;
                    bets.forEach((b: any) => {
                        if (b.runnerId == mr.runner.id) {
                            mr.pPL = math.add(b.size, mr.pPL);
                        }
                    });

                    if (mr.pPL != 0) {
                        if (!mr.pl) { mr.pl = 0; }
                        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    }
                });
            }
            else if (market.bettingType == common.enums.BettingType.ASIAN_HANDICAP_SINGLE_LINE) {
                market.marketRunner.forEach((mr: any) => {
                    mr.pPL = 0;
                    bets.forEach((b: any) => {
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
                        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    }
                });
            }
            else if (market.gameType == common.enums.GameType.AndarBahar || market.gameType == common.enums.GameType.Patti3 ||
                market.gameType == common.enums.GameType.Patti2 || market.gameType == common.enums.GameType.Poker) {
                market.marketRunner.forEach((mr: any) => {
                    mr.pstake = 0;
                    bets.forEach((b: any) => {
                        if (b.runnerId == mr.runner.id) {
                            if (b.side == 1) {
                                mr.pstake = math.add(b.size, mr.pstake);
                            }
                        }
                    });
                    if (mr.pstake != 0) {
                        if (mr.stake != 0) { mr.stake = mr.stake.toString().replaceAll(',', ''); }
                        mr.pstake = math.round(math.sum(mr.stake, mr.pstake), 2);
                    }
                });
            }
            else if (market.gameType == common.enums.GameType.Card32) {
                var oddsRunnerId: any[] = market.marketRunner.filter((m: any, index: any) => { return m.metadata.runnerGroup == 'Winner'; }).map((m: any) => { return m.runner.id; }) || [];
                var anyCardRunnerId: any[] = market.marketRunner.filter((m: any, index: any) => { return m.metadata.runnerGroup == 'AnyCard'; }).map((m: any) => { return m.runner.id; }) || [];
                var maxTotalRunnerId: any[] = market.marketRunner.filter((m: any, index: any) => { return m.metadata.runnerGroup == 'MaxTotal'; }).map((m: any) => { return m.runner.id; }) || [];
                market.marketRunner.forEach((mr: any, index: any) => {
                    if (mr.metadata.runnerGroup == 'Winner') {
                        mr.pPL = 0;
                        bets.forEach((b: any) => {
                            if (oddsRunnerId.some((r: any) => { return r == b.runnerId; })) {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                                    }
                                } else {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                                    } else {
                                        mr.pPL = math.add(b.size, mr.pPL);
                                    }
                                }
                            }
                        });
                        if (mr.pPL != 0) {
                            if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                            mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                        }
                    }
                    else if (mr.metadata.runnerGroup == 'AnyCard') {
                        mr.pPL = 0;
                        bets.forEach((b: any) => {
                            if (anyCardRunnerId.some((r: any) => { return r == b.runnerId; })) {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                                    }
                                    else {
                                        mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                                    }
                                } else {
                                    if (b.side == 1) {
                                        mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                                    } else {
                                        mr.pPL = math.add(b.size, mr.pPL);
                                    }
                                }
                            }
                        });
                        if (mr.pPL != 0) {
                            if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                            mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                        }
                    }
                    //else if (mr.metadata.runnerGroup == 'MaxTotal') {
                    //    mr.pPL = 0;
                    //    bets.forEach((b: any) => {
                    //        if (maxTotalRunnerId.some((r: any) => { return r == b.runnerId; })) {
                    //            if (b.runnerId == mr.runner.id) {
                    //                if (b.side == 1) {
                    //                    mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                    //                }
                    //                else {
                    //                    mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                    //                }
                    //            } else {
                    //                if (b.side == 1) {
                    //                    mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                    //                } else {
                    //                    mr.pPL = math.add(b.size, mr.pPL);
                    //                }
                    //            }
                    //        }
                    //    });
                    //    if (mr.pPL != 0) {
                    //        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                    //        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    //    }
                    //}
                    else if (mr.metadata.runnerGroup == 'OddEven' || mr.metadata.runnerGroup == 'MaxTotal') {
                        mr.pstake = 0;
                        bets.forEach((b: any) => {
                            if (b.runnerId == mr.runner.id) {
                                if (b.side == 1) {
                                    mr.pstake = math.add(b.size, mr.pstake);
                                }
                            }
                        });
                        if (mr.pstake != 0) {
                            if (mr.stake != 0) { mr.stake = mr.stake.toString().replaceAll(',', ''); }
                            mr.pstake = math.round(math.sum(mr.stake, mr.pstake), 2);
                        }
                    }
                    else if (mr.metadata.runnerGroup == 'LuckyNumber') {
                        mr.metadata.card32.forEach((d: any) => {
                            d.pstake = 0
                            bets.forEach((b: any) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        if (d.id == b.sectionId) {
                                            d.pstake = math.add(b.size, d.pstake);
                                        }
                                    }
                                }
                            });
                        });
                        mr.metadata.card32.forEach((d: any) => {
                            if (d.pstake != 0) {
                                if (d.stake && d.stake != 0) { d.stake = d.stake.toString().replaceAll(',', ''); }
                                d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                            }
                        });
                    }
                });
            } else if (market.gameType == common.enums.GameType.ClashOfKings) {
                market.marketRunner.forEach((mr: any, index: any) => {
                    if (mr.metadata.clashOfKing) {
                        mr.metadata.clashOfKing.forEach((d: any) => {
                            d.pstake = 0
                            bets.forEach((b: any) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        if (d.id == b.sectionId) {
                                            d.pstake = math.add(b.size, d.pstake);
                                        }
                                    }
                                }
                            });
                        });
                        mr.metadata.clashOfKing.forEach((d: any) => {
                            if (d.pstake != 0) {
                                if (d.stake && d.stake != 0) { d.stake = d.stake.toString().replaceAll(',', ''); }
                                d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                            }
                        });
                    }

                });
            }
            else if (market.gameType == common.enums.GameType.Up7Down) {
                market.marketRunner.forEach((mr: any) => {
                    mr.metadata.up7down.forEach((d: any) => {
                        d.pstake = 0
                        bets.forEach((b: any) => {
                            if (b.runnerId == mr.runner.id) {
                                if (b.side == 1) {
                                    if (d.id == b.sectionId) {
                                        d.pstake = math.add(b.size, d.pstake);
                                    }
                                }
                            }
                        });
                    });
                    mr.metadata.up7down.forEach((d: any) => {
                        if (d.pstake != 0) {
                            if (d.stake && d.stake != 0) { d.stake = d.stake.toString().replaceAll(',', ''); }
                            d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                        }
                    });
                });
            }
            else if (market.gameType == common.enums.GameType.DragonTiger) {
                market.marketRunner.forEach((mr: any) => {
                    if (mr.metadata) {
                        mr.metadata.dragonTiger.forEach((d: any) => {
                            d.pstake = 0
                            bets.forEach((b: any) => {
                                if (b.runnerId == mr.runner.id) {
                                    if (b.side == 1) {
                                        if (d.id == b.sectionId) {
                                            d.pstake = math.add(b.size, d.pstake);
                                        }
                                    }
                                }
                            });
                        });
                        mr.metadata.dragonTiger.forEach((d: any) => {
                            if (d.pstake != 0) {
                                if (d.stake && d.stake != 0) { d.stake = d.stake.toString().replaceAll(',', ''); }
                                d.pstake = math.round(math.sum(d.stake, d.pstake), 2);
                            }
                        });
                    } else {
                        mr.pstake = 0;
                        bets.forEach((b: any) => {
                            if (b.runnerId == mr.runner.id) {
                                if (b.side == 1) {
                                    mr.pstake = math.add(b.size, mr.pstake);
                                }
                            }
                        });
                        if (mr.pstake != 0) {
                            if (mr.stake != 0) { mr.stake = mr.stake.toString().replaceAll(',', ''); }
                            mr.pstake = math.round(math.sum(mr.stake, mr.pstake), 2);
                        }
                    }
                });
            }
            else {
                market.marketRunner.forEach((mr: any) => {
                    mr.pPL = 0;
                    bets.forEach((b: any) => {
                        if (b.runnerId == mr.runner.id) {
                            if (b.side == 1) {
                                mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                            }
                            else {
                                mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                            }
                        } else {
                            if (b.side == 1) {
                                mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                            } else {
                                mr.pPL = math.add(b.size, mr.pPL);
                            }
                        }
                    });
                    if (mr.pPL != 0) {
                        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    }
                });
            }
        }

        public static calcPLProjection(scopeMarket: any, bets: any): any {
            var market: any = {};
            angular.copy(scopeMarket, market);
            if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE || market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                market.marketRunner.forEach((mr: any) => {
                    mr.pPL = 0;
                    bets.forEach((b: any) => {
                        if (b.runnerId == mr.runner.id) {
                            mr.pPL = math.add(b.size, mr.pPL);
                        }
                    });

                    if (mr.pPL != 0) {
                        if (!mr.pl) { mr.pl = 0; }
                        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    }
                });
            }
            else if (market.bettingType == common.enums.BettingType.ASIAN_HANDICAP_SINGLE_LINE) {
                market.marketRunner.forEach((mr: any) => {
                    mr.pPL = 0;
                    bets.forEach((b: any) => {
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
                        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    }
                });
            }
            else {
                market.marketRunner.forEach((mr: any) => {
                    mr.pPL = 0;
                    bets.forEach((b: any) => {
                        if (b.runnerId == mr.runner.id) {
                            if (b.side == 1) {
                                mr.pPL = math.add(math.multiply(math.subtract(b.price, 1), b.size), mr.pPL);
                            }
                            else {
                                mr.pPL = math.add(math.multiply(math.multiply(math.subtract(b.price, 1), b.size), -1), mr.pPL);
                            }
                        } else {
                            if (b.side == 1) {
                                mr.pPL = math.add(math.multiply(b.size, -1), mr.pPL);
                            } else {
                                mr.pPL = math.add(b.size, mr.pPL);
                            }
                        }
                    });
                    if (mr.pPL != 0) {
                        if (mr.pl != 0) { mr.pl = mr.pl.toString().replaceAll(',', ''); }
                        mr.pPL = math.round(math.sum(mr.pl, mr.pPL), 2);
                    }
                });
            }
            return market;
        }

    }
}