var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddCommentaryCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, toasterService, commentaryService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.toasterService = toasterService;
                this.commentaryService = commentaryService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.isMute = false;
                this.$scope.audioCommentaryMode = false;
                this.$scope.eventName = this.$stateParams.eventName;
                this.$scope.ballStatusList = [];
                this.$scope.scoreProviderList = [];
                this.$scope.score = {
                    commentary: '',
                    homeTeam: '',
                    awayTeam: '',
                    ballstatus: 0,
                    cssClass: 'blue',
                    inning1InPlay: true,
                    inning2InPlay: false,
                    homeInBetting: true,
                    inning1HomeRuns: '',
                    inning1HomeWicket: '',
                    inning1HomeOver: '',
                    inning2HomeRuns: '',
                    inning2HomeWicket: '',
                    inning2HomeOver: '',
                    inning1HomeScore: '',
                    inning1AwayScore: '',
                    awayInBetting: false,
                    inning1AwayRuns: '',
                    inning1AwayWicket: '',
                    inning1AwayOver: '',
                    inning2AwayRuns: '',
                    inning2AwayWicket: '',
                    inning2AwayOver: '',
                    inning2HomeScore: '',
                    inning2AwayScore: '',
                };
            }
            loadInitialData() {
                this.fillBallTypes();
                this.fillRunType();
                this.fillWicketTypes();
                this.fillOtherTypes();
                this.fillBallStatus();
                this.fillScoreProvider();
                this.loadLastCommentary();
            }
            fillBallTypes() {
                this.$scope.ballTypes = [];
                this.$scope.ballTypes.push({ txt: 'Wide', value: 1, ctext: 'wide', ball: 0, short: 'WD' });
                this.$scope.ballTypes.push({ txt: 'No Ball', value: 1, ctext: 'no ball', ball: 0, short: 'NB' });
                this.$scope.ballTypes.push({ txt: 'Free Hit', value: 0, ctext: 'free hit', ball: 0 });
            }
            fillRunType() {
                this.$scope.runTypes = [];
                this.$scope.runTypes.push({ txt: 'No Run', value: 0, ctext: 'no run', ball: 1 });
                this.$scope.runTypes.push({ txt: '1', value: 1, ctext: 'single', ball: 1 });
                this.$scope.runTypes.push({ txt: '2', value: 2, ctext: '2 runs', ball: 1 });
                this.$scope.runTypes.push({ txt: '3', value: 3, ctext: '3 runs', ball: 1 });
                this.$scope.runTypes.push({ txt: '4', value: 4, ctext: 'four', ball: 1 });
                this.$scope.runTypes.push({ txt: '5', value: 5, ctext: '5 runs', ball: 1 });
                this.$scope.runTypes.push({ txt: '6', value: 6, ctext: 'six', ball: 1 });
            }
            fillWicketTypes() {
                this.$scope.wicketTypes = [];
                this.$scope.wicketTypes.push({ txt: 'LBW', value: 1, ctext: 'out-lbw', ball: 1 });
                this.$scope.wicketTypes.push({ txt: 'Catch', value: 1, ctext: 'catch out', ball: 1 });
                this.$scope.wicketTypes.push({ txt: 'Bowled', value: 1, ctext: 'out-bowled', ball: 1 });
                this.$scope.wicketTypes.push({ txt: 'Stumped Out', value: 1, ctext: 'stumped out', ball: 1 });
                this.$scope.wicketTypes.push({ txt: 'Runout', value: 1, ctext: 'runout', ball: 1 });
                this.$scope.wicketTypes.push({ txt: 'Other', value: 1, ctext: 'out', ball: 1 });
            }
            fillOtherTypes() {
                this.$scope.otherTypes = [];
                this.$scope.otherTypes.push({ txt: 'Over', value: 0, ctext: 'over', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Rain', value: 0, ctext: 'stop due to rain', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Third Upmire', value: 0, ctext: 'third upmire', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Not Out', value: 0, ctext: 'not out ', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Review', value: 0, ctext: 'review', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Drinks', value: 0, ctext: 'break-drinks', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Lunch', value: 0, ctext: 'lunch break', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Tea', value: 0, ctext: 'tea break', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Inn Break', value: 0, ctext: 'inning break', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Stumps', value: 0, ctext: 'day 1 : stumps', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Delay', value: 0, ctext: 'delay', ball: 0 });
                this.$scope.otherTypes.push({ txt: 'Wet Out Field', value: 0, ctext: 'wet out field', ball: 0 });
            }
            fillBallStatus() {
                this.$scope.ballStatusList.push({ id: 0, name: 'Ball Complete' });
                this.$scope.ballStatusList.push({ id: 1, name: 'Ball Start' });
            }
            fillScoreProvider() {
                var status = intranet.common.enums.ScoreSource;
                this.$scope.scoreProviderList = intranet.common.helpers.Utility.enumToArray(status);
            }
            loadTeamNames() {
                this.commentaryService.getTeams(this.$stateParams.eventId)
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 1) {
                            this.$scope.score.homeTeam = response.data[0];
                            this.$scope.score.awayTeam = response.data[1];
                        }
                    }
                });
            }
            loadLastCommentary(isReset = false) {
                this.commentaryService.getCommentary(this.$stateParams.eventId)
                    .success((response) => {
                    if (response.success && response.data) {
                        if (response.data.commentary) {
                            this.$scope.score = JSON.parse(response.data.commentary);
                        }
                        ;
                        this.$scope.score.scoreSource = response.data.scoreSource;
                        this.$scope.score.ballstatus = 0;
                        if (isReset) {
                            this.$scope.score.commentary = '';
                        }
                        if (!this.$scope.score.homeTeam) {
                            this.loadTeamNames();
                        }
                    }
                    else {
                        this.loadTeamNames();
                    }
                });
            }
            commentaryClick(item, priority = 1, considerLastBall = true) {
                this.$scope.score.commentary = '';
                this.$scope.score.cssClass = (priority == 1 ? 'blue' : (priority == 2 ? 'green-light' : (priority == 3 ? 'negative' : 'theme-color')));
                if (this.$scope.score.inning1InPlay) {
                    if (this.$scope.score.homeInBetting) {
                        this.$scope.score.inning1HomeOver = this.countOver(this.$scope.score.inning1HomeOver, item);
                        if (priority != 3) {
                            this.$scope.score.inning1HomeRuns = this.updateCommentary(this.$scope.score.inning1HomeRuns, item);
                        }
                        else {
                            this.$scope.score.inning1HomeWicket = this.updateCommentary(this.$scope.score.inning1HomeWicket, item);
                        }
                    }
                    else if (this.$scope.score.awayInBetting) {
                        this.$scope.score.inning1AwayOver = this.countOver(this.$scope.score.inning1AwayOver, item);
                        if (priority != 3) {
                            this.$scope.score.inning1AwayRuns = this.updateCommentary(this.$scope.score.inning1AwayRuns, item);
                        }
                        else {
                            this.$scope.score.inning1AwayWicket = this.updateCommentary(this.$scope.score.inning1AwayWicket, item);
                        }
                    }
                }
                else if (this.$scope.score.inning2InPlay) {
                    if (this.$scope.score.homeInBetting) {
                        this.$scope.score.inning2HomeOver = this.countOver(this.$scope.score.inning2HomeOver, item);
                        if (priority != 3) {
                            this.$scope.score.inning2HomeRuns = this.updateCommentary(this.$scope.score.inning2HomeRuns, item);
                        }
                        else {
                            this.$scope.score.inning2HomeWicket = this.updateCommentary(this.$scope.score.inning2HomeWicket, item);
                        }
                    }
                    else if (this.$scope.score.awayInBetting) {
                        this.$scope.score.inning2AwayOver = this.countOver(this.$scope.score.inning2AwayOver, item);
                        if (priority != 3) {
                            this.$scope.score.inning2AwayRuns = this.updateCommentary(this.$scope.score.inning2AwayRuns, item);
                        }
                        else {
                            this.$scope.score.inning2AwayWicket = this.updateCommentary(this.$scope.score.inning2AwayWicket, item);
                        }
                    }
                }
                if (considerLastBall)
                    this.setLastOver(item, priority);
                this.submitCommentary();
            }
            updateCommentary(self, item) {
                this.$scope.score.commentary = (this.$scope.score.commentary != '' ? this.$scope.score.commentary + ', ' : '') + item.ctext;
                return math.add((self ? self : 0), item.value);
            }
            countOver(self, item) {
                if (item.ball > 0) {
                    var ball = 0;
                    var over = 0;
                    if (self) {
                        over = parseInt(self);
                        ball = math.multiply(math.round(math.mod(self, 1), 1), 10);
                        ball = math.add(ball, item.ball);
                        if (ball == 6) {
                            over = math.add(over, 1);
                            ball = 0;
                        }
                        else {
                            ball = math.divide(ball, 10);
                            over = math.add(over, ball);
                        }
                    }
                    else {
                        ball = math.divide(item.ball, 10);
                        over = math.add(over, ball);
                    }
                    return over;
                }
                else {
                    return self;
                }
            }
            setLastOver(item, priority = 1) {
                if (priority < 4) {
                    if (!this.$scope.score.lastOver) {
                        this.$scope.score.lastOver = [];
                    }
                    else {
                        if (this.$scope.score.lastOver.length >= 10) {
                            this.$scope.score.lastOver.splice(9);
                        }
                    }
                    if (priority == 1) {
                        this.$scope.score.lastOver.unshift({ innertxt: item.value });
                    }
                    else if (priority == 2 && item.value > 0) {
                        this.$scope.score.lastOver.unshift({ innertxt: item.short });
                    }
                    else if (priority == 3 && item.value > 0) {
                        this.$scope.score.lastOver.unshift({ innertxt: 'W' });
                    }
                }
            }
            submitCommentary() {
                var score = this.$scope.score;
                if (!score.inning1HomeRuns && !score.inning1HomeWicket) {
                    score.inning1HomeScore = 'Yet to bat';
                }
                else {
                    score.inning1HomeScore = (score.inning1HomeRuns ? score.inning1HomeRuns : '0') + '/' + (score.inning1HomeWicket ? score.inning1HomeWicket : '0');
                    if (score.inning1HomeOver && (score.inning1InPlay && score.homeInBetting)) {
                        score.inning1HomeScore = score.inning1HomeScore + ' (' + score.inning1HomeOver + ')';
                    }
                }
                if (!score.inning1AwayRuns && !score.inning1AwayWicket) {
                    score.inning1AwayScore = 'Yet to bat';
                }
                else {
                    score.inning1AwayScore = (score.inning1AwayRuns ? score.inning1AwayRuns : '0') + '/' + (score.inning1AwayWicket ? score.inning1AwayWicket : '0');
                    if (score.inning1AwayOver && (score.inning1InPlay && score.awayInBetting)) {
                        score.inning1AwayScore = score.inning1AwayScore + ' (' + score.inning1AwayOver + ')';
                    }
                }
                if (score.inning2InPlay) {
                    if (!score.inning2HomeRuns && !score.inning2HomeWicket) {
                        score.inning2HomeScore = 'Yet to bat';
                    }
                    else {
                        score.inning2HomeScore = (score.inning2HomeRuns ? score.inning2HomeRuns : '0') + '/' + (score.inning2HomeWicket ? score.inning2HomeWicket : '0');
                        if (score.inning2HomeOver && (score.inning2InPlay && score.homeInBetting)) {
                            score.inning2HomeScore = score.inning2HomeScore + ' (' + score.inning2HomeOver + ')';
                        }
                    }
                    if (!score.inning2AwayRuns && !score.inning2AwayWicket) {
                        score.inning2AwayScore = 'Yet to bat';
                    }
                    else {
                        score.inning2AwayScore = (score.inning2AwayRuns ? score.inning2AwayRuns : '0') + '/' + (score.inning2AwayWicket ? score.inning2AwayWicket : '0');
                        if (score.inning2AwayOver && (score.inning2InPlay && score.awayInBetting)) {
                            score.inning2AwayScore = score.inning2AwayScore + ' (' + score.inning2AwayOver + ')';
                        }
                    }
                }
                var model = { commentary: JSON.stringify(this.$scope.score), eventId: this.$stateParams.eventId };
                this.commentaryService.updateCommentary(model)
                    .success((response) => {
                    this.toasterService.showMessages(response.messages, 3000);
                });
            }
            removeOverBall(index) {
                if (this.$scope.score.lastOver && this.$scope.score.lastOver.length >= index) {
                    this.$scope.score.lastOver.splice(index, 1);
                    this.submitCommentary();
                }
            }
            ballStatusChanged(selectedId) {
                this.$scope.score.ballstatus = selectedId;
                this.commentaryService.ballStart(this.$stateParams.eventId)
                    .success((response) => {
                    this.$scope.score.ballstatus = 0;
                    this.toasterService.showMessages(response.messages, 3000);
                });
                if (selectedId == 1 && this.$scope.score.scoreSource == intranet.common.enums.ScoreSource.Own) {
                    this.commentaryClick({ value: 0, ctext: 'ball start' }, 1, false);
                }
            }
            scoreProviderChanged(selectedId) {
                this.commentaryService.updateScoreProvider(this.$stateParams.eventId, selectedId)
                    .success((response) => {
                    this.$scope.score.scoreSource = selectedId;
                    this.toasterService.showMessages(response.messages, 3000);
                });
            }
            shortcut(event) {
                if (event.originalEvent.ctrlKey == true && event.originalEvent.code === 'KeyB' && !this.$scope.$$destroyed) {
                    this.ballStatusChanged(1);
                }
                else if (event.originalEvent.ctrlKey == true && event.originalEvent.code === 'KeyM' && !this.$scope.$$destroyed && this.$scope.audioCommentaryMode == true) {
                    this.$scope.isMute = !this.$scope.isMute;
                }
            }
            audioConfigChanged(config) {
                if (this.$scope.audioCommentaryMode == true) {
                    this.commentaryService.getCommentary(this.$stateParams.eventId)
                        .success((response) => {
                        if (response.success && response.data) {
                            if (response.data.commentary) {
                                this.$scope.score = JSON.parse(response.data.commentary);
                                this.$scope.score.audioConfig = config;
                                this.submitCommentary();
                            }
                            ;
                        }
                    });
                }
            }
        }
        admin.AddCommentaryCtrl = AddCommentaryCtrl;
        angular.module('intranet.admin').controller('addCommentaryCtrl', AddCommentaryCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddCommentaryCtrl.js.map