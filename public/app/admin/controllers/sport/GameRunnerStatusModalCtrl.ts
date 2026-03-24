module intranet.admin {

    export interface IGameRunnerStatusModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        marketRunner: any[];
        runnerStatusList: any[];
        bettingType: any;
        winningRuns: any;
        reclose: boolean;
        isGameClosing: boolean;
        gameType: any;
        marketId: any;

        pattiRunner: any;
    }

    export class GameRunnerStatusModalCtrl extends intranet.common.ControllerBase<IGameRunnerStatusModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IGameRunnerStatusModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private marketService: services.MarketService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            var status: any = common.enums.RunnerStatus;
            this.$scope.runnerStatusList.push({ id: 2, name: 'Win' });
            this.$scope.runnerStatusList.push({ id: 3, name: 'Loss' });
            if (this.$scope.gameType == common.enums.GameType.Card32)
                this.$scope.runnerStatusList.push({ id: 6, name: 'Remove' });

            if (this.$scope.gameType == common.enums.GameType.Patti3) {
                var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                this.$scope.pattiRunner = metadata.patti3;
            }
            else if (this.$scope.gameType == common.enums.GameType.Patti2) {
                var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                this.$scope.pattiRunner = metadata.patti2;
            }
            else if (this.$scope.gameType == common.enums.GameType.PokerT20) {
                var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                this.$scope.pattiRunner = metadata.pokert20;
            }
            else if (this.$scope.gameType == common.enums.GameType.Poker) {
                var metadata = JSON.parse(this.$scope.marketRunner[0].runner.runnerMetadata);
                this.$scope.pattiRunner = metadata.poker;
            }
            if (this.$scope.gameType == common.enums.GameType.Card32) {
                this.$scope.marketRunner.forEach((mr: any) => {
                    if (mr.runner.runnerMetadata) {
                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                        if (!mr.winner) { mr.winner = []; }
                        else {
                            mr.winner = JSON.parse(mr.winner);
                            if (mr.winner && mr.winner.length > 0)
                                mr.selectedWinner = mr.winner[0].id;
                        }
                    }
                });
            }
           else if (this.$scope.gameType == common.enums.GameType.Up7Down) {
                this.$scope.marketRunner.forEach((mr: any, rindex: any) => {
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
                        } else { mr.winner = []; }
                    } else { mr.winner = []; }
                });

            }
            else if (this.$scope.gameType == common.enums.GameType.ClashOfKings) {
                this.$scope.marketRunner.forEach((mr: any, rindex: any) => {
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
                        } else { mr.winner = []; }
                    } else { mr.winner = []; }
                });
            }
            else if (this.$scope.gameType == common.enums.GameType.DragonTiger) {
                var winRunner: any;
                this.$scope.marketRunner.forEach((mr: any, rindex: any) => {
                    if (mr.runner.runnerMetadata && mr.runner.runnerMetadata!='NULL') {
                        mr.metadata = JSON.parse(mr.runner.runnerMetadata).dragonTiger;
                        mr.runnerGroup = JSON.parse(mr.runner.runnerMetadata).runnerGroup;
                    }
                    if (rindex < 3) {
                        if (!mr.status) { mr.status = common.enums.RunnerStatus.LOSER; }
                        if (mr.status == common.enums.RunnerStatus.WINNER) { winRunner = mr.runner.name; }
                    } else {
                        mr.visible = false;
                        if (mr.runnerGroup == winRunner) { mr.visible = true; }
                        if (mr.winner) {
                            var existingWinner = JSON.parse(mr.winner) || [];
                            if (existingWinner.length > 0) {
                                mr.selectedWinner = existingWinner[0].id;
                                mr.winner = [];
                                mr.winner.push(existingWinner[0]);
                            } else { mr.winner = []; }
                        } else { mr.winner = []; }
                    }
                });
            }
            else {
                if (this.$scope.pattiRunner) { this.$scope.pattiRunner.forEach((p: any) => { p.status = common.enums.RunnerStatus.LOSER; }); }
                this.$scope.marketRunner.forEach((r: any) => {
                    if (!r.status) { r.status = common.enums.RunnerStatus.LOSER; }
                    if (r.winner) {
                        var existingWinner = JSON.parse(r.winner) || [];
                        r.winner = [];
                        angular.copy(this.$scope.pattiRunner, r.winner);
                        if (existingWinner.length > 0) {
                            r.winner.forEach((p: any) => {
                                p.status = existingWinner.some((e: any) => { return e.id == p.id; }) ? common.enums.RunnerStatus.WINNER : common.enums.RunnerStatus.LOSER;
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

        private runnerStatusChanged(selectedId: any, runner: any): void {
            var hasWinner = runner.winner.some((r: any) => { return r.status == common.enums.RunnerStatus.WINNER; });
            if (hasWinner) { runner.status = common.enums.RunnerStatus.WINNER; }
            else { runner.status = common.enums.RunnerStatus.LOSER; }
        }

        private dgRunnerStatusChanged(selectedId: any, runner: any): void {
            if (selectedId == common.enums.RunnerStatus.WINNER) {
                this.$scope.marketRunner.forEach((mr: any, rindex: any) => {
                    if (rindex < 3) {
                        if (mr.runner.name != runner.runner.name) mr.status = common.enums.RunnerStatus.LOSER;
                    }
                    else {
                        if (mr.runnerGroup == runner.runner.name) {
                            mr.visible = true;
                        } else {
                            mr.visible = false;
                            mr.winner = [];
                            mr.selectedWinner = '';
                            mr.status = common.enums.RunnerStatus.LOSER;
                        }
                    }
                });
            }
        }

        private up7downRunnerStatusChanged(selectedId: any, runner: any): void {
            runner.winner = [];
            if (selectedId == -7) {
                runner.status = common.enums.RunnerStatus.LOSER;
            }
            else {
                var slWinner = runner.metadata.filter((mt: any) => { return mt.id == selectedId; }) || [];
                if (slWinner.length > 0) {
                    slWinner[0].status = common.enums.RunnerStatus.WINNER;
                    runner.winner.push(slWinner[0]);
                    runner.status = common.enums.RunnerStatus.WINNER;
                } else {
                    runner.status = common.enums.RunnerStatus.LOSER;
                }
            }
            runner.selectedWinner = selectedId;
        }

        private card32RunnerStatusChanged(selectedId: any, runner: any, index: any): void {
            if (index <= 3 || index == 8 || index == 9) { runner.status = selectedId; }
            else if ((index >= 4 && index <= 7) || index == 10) {
                runner.status = common.enums.RunnerStatus.WINNER;
                var slWinner = runner.metadata.card32.filter((mt: any) => { return mt.id == selectedId; }) || [];
                if (slWinner.length > 0) {
                    slWinner[0].status = common.enums.RunnerStatus.WINNER;
                    runner.winner.push(slWinner[0]);
                }
                runner.selectedWinner = selectedId;
            }

        }

        private removeAll(): void {
            this.$scope.marketRunner.forEach((r: any) => { r.status = common.enums.RunnerStatus.REMOVED; });
            this.saveRunnerStatus();
        }

        private saveRunnerStatus(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.bettingType == common.enums.BettingType.SESSION || this.$scope.bettingType == common.enums.BettingType.LINE) {
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
                angular.forEach(this.$scope.marketRunner, (value: any) => {
                    var cRunner: any = {
                        runnerId: value.runner.id,
                        runnerStatus: value.status
                    };
                    if (value.winner && value.winner.length>0) {
                        cRunner.winner = JSON.stringify(value.winner.filter((w: any) => { return w.status == common.enums.RunnerStatus.WINNER }) || []);
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
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    } else {
                        this.$scope.messages = response.messages;
                    }
                });
            }

        }
    }

    angular.module('intranet.admin').controller('gameRunnerStatusModalCtrl', GameRunnerStatusModalCtrl);
}