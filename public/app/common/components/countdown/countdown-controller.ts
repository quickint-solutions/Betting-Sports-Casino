namespace intranet.common.directives {
    export interface ICountDownScope extends intranet.common.IScopeBase {
        counter: any;
    }

    class KTCountDownController extends intranet.common.ControllerBase<ICountDownScope> {

        /* @ngInject */
        constructor($scope: ICountDownScope) {
            super($scope);

        }
    }


    angular.module('kt.components')
        .controller('KTCountDownController', KTCountDownController)
        .directive('ktCountDown', () => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    counter: '=',
                },
                controller: 'KTCountDownController',
                templateUrl: 'app/common/components/countdown/countdown.html',
                link: (scope: ICountDownScope, iElement, iAttrs) => {

                    var minutesContainer = document.querySelector('.minutes')
                    var secondsContainer = document.querySelector('.seconds')

                    function countChange() {
                        if (scope.counter != undefined) {
                            var totalSeconds = math.round(scope.counter, 0);
                            if (totalSeconds > 60) {
                                var minutes = math.floor(math.divide(totalSeconds, 60));
                                updateContainer(minutesContainer, minutes);
                                var remainSeconds = math.floor(math.mod(totalSeconds, 60));
                                updateContainer(secondsContainer, remainSeconds);
                            }
                            else {
                                updateContainer(minutesContainer, 0);
                                updateContainer(secondsContainer, math.round(scope.counter, 0));
                            }
                        }
                    }

                    function updateContainer(container, newTime) {
                        var time = newTime.toString().split('')

                        if (time.length === 1) {
                            time.unshift('0')
                        }


                        var first = container.firstElementChild
                        if (first.lastElementChild.textContent !== time[0]) {
                            updateNumber(first, time[0])
                        }

                        var last = container.lastElementChild
                        if (last.lastElementChild.textContent !== time[1]) {
                            updateNumber(last, time[1])
                        }
                    }

                    function updateNumber(element, number) {
                        //element.lastElementChild.textContent = number
                        var second = element.lastElementChild.cloneNode(true)
                        second.textContent = number

                        element.appendChild(second)
                        element.classList.add('move')
                        
                        setTimeout(function () {
                            element.classList.remove('move')
                        }, 600)
                        setTimeout(function () {
                            element.removeChild(element.firstElementChild)
                        }, 600)
                    }
                    var interval =  setInterval(countChange, 250);

                    scope.$on('$destroy', () => {
                        clearInterval(interval);
                    });
                }
            };
        });
}