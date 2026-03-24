var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class GameRunnerStatusModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, marketService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.marketService = marketService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.runnerStatusList = [];
                this.$scope.isGameClosing = false;
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.marketRunner = this.modalOptions.data.marketRunner;
                    this.$scope.bettingType = this.modalOptions.data.bettingType;
                    this.$scope.reclose = this.modalOptions.data.reclose;
                    this.$scope.isGameClosing = this.modalOptions.data.isGameClosing;
                    this.$scope.gameType = this.modalOptions.data.gameType;
                    this.$scope.marketId = this.modalOptions.data.marketId;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveRunnerStatus();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var status = intranet.common.enums.RunnerStatus;
                this.$scope.runnerStatusList.push({ id: 2, name: 'Win' });
                this.$scope.runnerStatusList.push({ id: 3, name: 'Loss' });
                if (this.$scope.gameType == intranet.common.enums.GameType.Card32)
                    this.$scope.runnerStatusList.push({ id: 6, name: 'Remove' });
                if (this.$scope.gameType == intranet.common.enums.GameType.Patti3) {
                    var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                    this.$scope.pattiRunner = metadata.patti3;
                }
                else if (this.$scope.gameType == intranet.common.enums.GameType.Patti2) {
                    var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                    this.$scope.pattiRunner = metadata.patti2;
                }
                else if (this.$scope.gameType == intranet.common.enums.GameType.PokerT20) {
                    var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                    this.$scope.pattiRunner = metadata.pokert20;
                }
                else if (this.$scope.gameType == intranet.common.enums.GameType.Poker) {
                    var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                    this.$scope.pattiRunner = metadata.poker;
                }
                if (this.$scope.gameType == intranet.common.enums.GameType.Card32) {
                    this.$scope.marketRunner.forEach((mr) => {
                        if (mr.runner.runnerMetadata) {
                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                            if (!mr.winner) {
                                mr.winner = [];
                            }
                            else {
                                mr.winner = JSON.parse(mr.winner);
                                if (mr.winner && mr.winner.length > 0)
                                    mr.selectedWinner = mr.winner[0].id;
                            }
                        }
                    });
                }
                else if (this.$scope.gameType == intranet.common.enums.GameType.Up7Down) {
                    this.$scope.marketRunner.forEach((mr, rindex) => {
                        mr.metadata = JSON.parse(mr.runner.runnerMetadata).up7down;
                        if (rindex == 0) {
                            mr.metadata.push({ id: -7, name: '7 (Tie)' });
                        }
                        if (mr.winner) {
                            var existingWinner = JSON.parse(mr.winner) || [];
                            if (existingWinner.length > 0) {
                                mr.selectedWinner = existingWinner[0].id;
                                mr.winner = [];
                                mr.winner.push(existingWinner[0]);
                            }
                            else {
                                mr.winner = [];
                            }
                        }
                        else {
                            mr.winner = [];
                        }
                    });
                }
                else if (this.$scope.gameType == intranet.common.enums.GameType.ClashOfKings) {
                    this.$scope.marketRunner.forEach((mr, rindex) => {
                        mr.metadata = JSON.parse(mr.runner.runnerMetadata).clashOfKing;
                        mr.runnerGroup = JSON.parse(mr.runner.runnerMetadata).runnerGroup;
                        if (mr.runnerGroup == '4CardColor' || mr.runnerGroup == 'SameSuit') {
                            mr.metadata.push({ id: -7, name: 'None' });
                        }
                        if (mr.winner) {
                            var existingWinner = JSON.parse(mr.winner) || [];
                            if (existingWinner.length > 0) {
                                mr.selectedWinner = existingWinner[0].id;
                                mr.winner = [];
                                mr.winner.push(existingWinner[0]);
                            }
                            else {
                                mr.winner = [];
                            }
                        }
                        else {
                            mr.winner = [];
                        }
                    });
                }
                else if (this.$scope.gameType == intranet.common.enums.GameType.DragonTiger) {
                    var winRunner;
                    this.$scope.marketRunner.forEach((mr, rindex) => {
                        if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                            mr.metadata = JSON.parse(mr.runner.runnerMetadata).dragonTiger;
                            mr.runnerGroup = JSON.parse(mr.runner.runnerMetadata).runnerGroup;
                        }
                        if (rindex < 3) {
                            if (!mr.status) {
                                mr.status = intranet.common.enums.RunnerStatus.LOSER;
                            }
                            if (mr.status == intranet.common.enums.RunnerStatus.WINNER) {
                                winRunner = mr.runner.name;
                            }
                        }
                        else {
                            mr.visible = false;
                            if (mr.runnerGroup == winRunner) {
                                mr.visible = true;
                            }
                            if (mr.winner) {
                                var existingWinner = JSON.parse(mr.winner) || [];
                                if (existingWinner.length > 0) {
                                    mr.selectedWinner = existingWinner[0].id;
                                    mr.winner = [];
                                    mr.winner.push(existingWinner[0]);
                                }
                                else {
                                    mr.winner = [];
                                }
                            }
                            else {
                                mr.winner = [];
                            }
                        }
                    });
                }
                else {
                    if (this.$scope.pattiRunner) {
                        this.$scope.pattiRunner.forEach((p) => { p.status = intranet.common.enums.RunnerStatus.LOSER; });
                    }
                    this.$scope.marketRunner.forEach((r) => {
                        if (!r.status) {
                            r.status = intranet.common.enums.RunnerStatus.LOSER;
                        }
                        if (r.winner) {
                            var existingWinner = JSON.parse(r.winner) || [];
                            r.winner = [];
                            angular.copy(this.$scope.pattiRunner, r.winner);
                            if (existingWinner.length > 0) {
                                r.winner.forEach((p) => {
                                    p.status = existingWinner.some((e) => { return e.id == p.id; }) ? intranet.common.enums.RunnerStatus.WINNER : intranet.common.enums.RunnerStatus.LOSER;
                                });
                            }
                        }
                        else {
                            r.winner = [];
                            angular.copy(this.$scope.pattiRunner, r.winner);
                        }
                    });
                }
            }
            runnerStatusChanged(selectedId, runner) {
                var hasWinner = runner.winner.some((r) => { return r.status == intranet.common.enums.RunnerStatus.WINNER; });
                if (hasWinner) {
                    runner.status = intranet.common.enums.RunnerStatus.WINNER;
                }
                else {
                    runner.status = intranet.common.enums.RunnerStatus.LOSER;
                }
            }
            dgRunnerStatusChanged(selectedId, runner) {
                if (selectedId == intranet.common.enums.RunnerStatus.WINNER) {
                    this.$scope.marketRunner.forEach((mr, rindex) => {
                        if (rindex < 3) {
                            if (mr.runner.name != runner.runner.name)
                                mr.status = intranet.common.enums.RunnerStatus.LOSER;
                        }
                        else {
                            if (mr.runnerGroup == runner.runner.name) {
                                mr.visible = true;
                            }
                            else {
                                mr.visible = false;
                                mr.winner = [];
                                mr.selectedWinner = '';
                                mr.status = intranet.common.enums.RunnerStatus.LOSER;
                            }
                        }
                    });
                }
            }
            up7downRunnerStatusChanged(selectedId, runner) {
                runner.winner = [];
                if (selectedId == -7) {
                    runner.status = intranet.common.enums.RunnerStatus.LOSER;
                }
                else {
                    var slWinner = runner.metadata.filter((mt) => { return mt.id == selectedId; }) || [];
                    if (slWinner.length > 0) {
                        slWinner[0].status = intranet.common.enums.RunnerStatus.WINNER;
                        runner.winner.push(slWinner[0]);
                        runner.status = intranet.common.enums.RunnerStatus.WINNER;
                    }
                    else {
                        runner.status = intranet.common.enums.RunnerStatus.LOSER;
                    }
                }
                runner.selectedWinner = selectedId;
            }
            card32RunnerStatusChanged(selectedId, runner, index) {
                if (index <= 3 || index == 8 || index == 9) {
                    runner.status = selectedId;
                }
                else if ((index >= 4 && index <= 7) || index == 10) {
                    runner.status = intranet.common.enums.RunnerStatus.WINNER;
                    var slWinner = runner.metadata.card32.filter((mt) => { return mt.id == selectedId; }) || [];
                    if (slWinner.length > 0) {
                        slWinner[0].status = intranet.common.enums.RunnerStatus.WINNER;
                        runner.winner.push(slWinner[0]);
                    }
                    runner.selectedWinner = selectedId;
                }
            }
            removeAll() {
                this.$scope.marketRunner.forEach((r) => { r.status = intranet.common.enums.RunnerStatus.REMOVED; });
                this.saveRunnerStatus();
            }
            saveRunnerStatus() {
                var promise;
                if (this.$scope.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.bettingType == intranet.common.enums.BettingType.LINE) {
                    var model = { marketId: this.$scope.marketId, winner: this.$scope.winningRuns };
                    if (this.$scope.reclose) {
                        promise = this.marketService.recloseMarket(model);
                    }
                    else {
                        promise = this.marketService.closeMarket(model);
                    }
                }
                else if (this.$scope.marketRunner) {
                    var data = { marketId: this.$scope.marketId, runners: [] };
                    angular.forEach(this.$scope.marketRunner, (value) => {
                        var cRunner = {
                            runnerId: value.runner.id,
                            runnerStatus: value.status
                        };
                        if (value.winner && value.winner.length > 0) {
                            cRunner.winner = JSON.stringify(value.winner.filter((w) => { return w.status == intranet.common.enums.RunnerStatus.WINNER; }) || []);
                        }
                        data.runners.push(cRunner);
                    });
                    if (this.$scope.reclose) {
                        promise = this.marketService.recloseMarket(data);
                    }
                    else {
                        promise = this.marketService.closeMarket(data);
                    }
                }
                if (promise) {
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        admin.GameRunnerStatusModalCtrl = GameRunnerStatusModalCtrl;
        angular.module('intranet.admin').controller('gameRunnerStatusModalCtrl', GameRunnerStatusModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=GameRunnerStatusModalCtrl.js.map