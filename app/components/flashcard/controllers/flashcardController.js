'use strict';

angular.module('vocabFlashcardsControllers')
    .controller('FlashcardCtrl', ['$scope', '$document', '$timeout', '$mdToast', 'DefineWord',
        function($scope, $document, $timeout, $mdToast, DefineWord) {
            $scope.loadedWords = false;

            var words = [];
            var definitions = {};
            var next = {};

            $scope.nextWord = function(addToReview) {
                var classes = $document[0].getElementById('flashcard').className;
                classes = classes.replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes = classes.replace(/(?:^|\s)fade-[a-z\-]+(?!\S)/g, '');
                classes += ' flip-flashcard-front fade-out-flashcard';
                $document[0].getElementById('flashcard').className = classes;
                var reviewWordChosen = false;
                if (addToReview) {
                    $scope.stats.reviewWords.push($scope.current.word);
                    $scope.stats.review = $scope.stats.reviewWords.length;
                } else {
                    $scope.stats.knownWords.push($scope.current.word);
                    $scope.stats.known = $scope.stats.knownWords.length;
                }
                if ($scope.stats.unseen > 0) {
                    $scope.stats.unseen -= 1;
                } else {
                    $scope.stats.review -= 1;
                }
                if ((Math.random() < 0.15 || $scope.stats.unseen === 0) && $scope.stats.review > 0) {
                    $scope.stats.reviewWords = shuffle($scope.stats.reviewWords);
                    next = {
                        word: $scope.stats.reviewWords[0],
                        definition: loadMeaning($scope.stats.reviewWords[0])
                    };
                    $scope.stats.reviewWords.shift();
                    $scope.stats.review = $scope.stats.reviewWords.length;
                    if ($scope.stats.unseen === 0)
                        $scope.stats.review += 1; // +1 for the word being displayed
                    else
                        $scope.stats.unseen += 1;
                    reviewWordChosen = true;
                }
                if (!reviewWordChosen && $scope.stats.unseen > 0) {
                    $scope.stats.unseenWords = shuffle($scope.stats.unseenWords);
                    next = {
                        word: $scope.stats.unseenWords[0],
                        definition: loadMeaning($scope.stats.unseenWords[0])
                    };
                    $scope.stats.unseenWords.shift();
                    $scope.stats.unseen = $scope.stats.unseenWords.length + 1; // +1 for the word being displayed
                }
                if ($scope.stats.unseen === 0 && $scope.stats.review === 0 && next === null) {
                    $scope.done = true;
                    $scope.loadedWords = false;
                    showFinishedToast();
                } else {
                    $timeout(function() {
                        $scope.current = {
                            word: next.word,
                            definition: next.definition,
                            showMeaning: false,
                            addToReview: false
                        };
                        next = null;
                        var classes = $document[0].getElementById('flashcard').className;
                        classes = classes.replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                        classes = classes.replace(/(?:^|\s)fade-[a-z\-]+(?!\S)/g, '');
                        classes += ' fade-in-flashcard';
                        $document[0].getElementById('flashcard').className = classes;
                    }, 500);
                }
            };

            $scope.showMeaning = function() {
                var classes = $document[0].getElementById('flashcard').className
                    .replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes += ' flip-flashcard-back';
                $document[0].getElementById('flashcard').className = classes;
                $scope.current.showMeaning = true;
                $scope.current.addToReview = true;
            };

            $scope.showWord = function() {
                var classes = $document[0].getElementById('flashcard').className
                    .replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes += ' flip-flashcard-front';
                $document[0].getElementById('flashcard').className = classes;
                $scope.current.showMeaning = false;
            };

            $scope.$watch('wordsFile', function() {
                if ($scope.wordsFile === undefined || $scope.wordsFile === null)
                    return;
                var read = new FileReader();
                read.readAsBinaryString($scope.wordsFile);
                read.onloadend = function() {
                    words = read.result.split('\n');
                    $scope.loadedWords = true;
                    $scope.done = false;
                    $scope.stats = {
                        review: 0,
                        known: 0,
                        unseen: words.length,
                        reviewWords: [],
                        knownWords: [],
                        unseenWords: words.slice(0)
                    };
                    $scope.numOfWords = words.length;

                    $scope.current = {
                        word: $scope.stats.unseenWords[0],
                        definition: loadMeaning($scope.stats.unseenWords[0]),
                        showMeaning: false,
                        addToReview: false
                    };

                    $scope.stats.unseenWords.shift();
                    $scope.stats.unseen = $scope.stats.unseenWords.length + 1;

                    next = {
                        word: $scope.stats.unseenWords[1],
                        definition: loadMeaning($scope.stats.unseenWords[1])
                    };
                };
            });

            function shuffle(array) {
                /**
                 * Fisher-Yates shuffle
                 */
                var counter = array.length,
                    temp, index;

                while (counter > 0) {
                    index = Math.floor(Math.random() * counter);

                    counter--;

                    temp = array[counter];
                    array[counter] = array[index];
                    array[index] = temp;
                }

                return array;
            }

            function loadMeaning(word) {
                if (word in definitions) {
                    return definitions[word];
                } else {
                    DefineWord.get(word).then(function successCallback(res) {
                        definitions[word] = res.data;
                        if ($scope.current.word == word) {
                            $scope.current.definition = definitions[word];
                        }
                    }, function errorCallback(res) {
                        console.error(res.status + ' Could not get definition for ' + word + '.');
                        definitions[word] = 'Could not get definition for ' + word + '.';
                        if ($scope.current.word == word) {
                            $scope.current.definition = definitions[word];
                        }
                    });
                }
                return 'Loading...';
            }

            function showFinishedToast() {
                $mdToast.show(
                    $mdToast.simple()
                    .content('You\'ve learnt all the words in the list! \n' +
                        'Upload another word list if you\'d like to have another go.')
                    .position('bottom left')
                    .hideDelay(5000)
                );
            }


        }
    ]);