'use strict';

angular.module('vocabFlashcardsControllers')
    .controller('FlashcardCtrl', ['$scope', '$document', '$timeout', '$mdToast', 'DefineWord', 'SampleWords',
        function($scope, $document, $timeout, $mdToast, DefineWord, SampleWords) {
            var words = [];
            var definitions = {};
            var nextWord = null;

            // Show the upload button
            $scope.loadedWords = false;
            $scope.current = {
                showDefinition: false,
                word: '',
                definition: ''
            };

            $scope.$watch('wordsFile', function() {
                if ($scope.wordsFile === undefined || $scope.wordsFile === null)
                    return;
                var read = new FileReader();
                read.readAsText($scope.wordsFile);
                console.log($scope.wordsFile);
                read.onloadend = function() {
                    words = read.result.split('\n');
                    generateFlashcards();
                };
            });

            $scope.generateSampleFlashcards = function() {
               SampleWords.load().then(function successCallback(res) {
                       words = res.data.split('\n');
                       generateFlashcards();
                   },
                   function errorCallback(res) {
                       console.log('Could not load sample_words.txt, try uploading your words file.');
                   });
           }

            $scope.nextWord = function(addToReview) {
                // Fade out the flashcard
                fadeOutFlashcard();

                // Update the stats of the previous words
                // Check if it was added to the review words list or was added
                // to the known words list
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
                    // Choose the next word from the review words list
                    $scope.stats.reviewWords = shuffle($scope.stats.reviewWords);
                    nextWord = $scope.stats.reviewWords[0];
                    $scope.stats.reviewWords.shift();
                    $scope.stats.review = $scope.stats.reviewWords.length;

                    if ($scope.stats.unseen === 0) {
                        $scope.stats.review += 1; // +1 for the word being displayed
                    } else {
                        $scope.stats.unseen += 1;
                    }
                } else if ($scope.stats.unseen > 0) {
                    // Check the next word from the unseen words list
                    $scope.stats.unseenWords = shuffle($scope.stats.unseenWords);
                    nextWord = $scope.stats.unseenWords[0];
                    $scope.stats.unseenWords.shift();
                    // +1 for the word being displayed
                    $scope.stats.unseen = $scope.stats.unseenWords.length + 1;
                }

                // Out of cards
                if ($scope.stats.unseen === 0 && $scope.stats.review === 0 && nextWord === null) {
                    $scope.done = true;
                    $scope.loadedWords = false;
                    showFinishedToast();
                } else {
                    $timeout(function() {
                        $scope.current.word = nextWord;
                        $scope.current.definition = loadDefinition($scope.current.word);
                        $scope.current.showDefinition = false;
                        nextWord = null;

                        fadeInFlashcard();
                    }, 500);
                }
            };

            $scope.showDefinition = function() {
                var classes = $document[0].getElementById('flashcard').className
                    .replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes = 'flip-flashcard-back ' + classes;
                $document[0].getElementById('flashcard').className = classes;
                $scope.current.showDefinition = true;
            };

            $scope.showWord = function() {
                var classes = $document[0].getElementById('flashcard').className
                    .replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes = 'flip-flashcard-front ' + classes;
                $document[0].getElementById('flashcard').className = classes;
                $scope.current.showDefinition = false;
            };

            function generateFlashcards() {
                // Show the card view
                $scope.loadedWords = true;
                $scope.done = false;
                $scope.numOfWords = words.length;
                $scope.lookingUpCurrent = true;
                $scope.stats = {
                    review: 0,
                    known: 0,
                    unseen: words.length,
                    reviewWords: [],
                    knownWords: [],
                    unseenWords: words.slice(0)
                };
                $scope.current.word = $scope.stats.unseenWords[0];
                $scope.current.definition = loadDefinition($scope.stats.unseenWords[0]);
                $scope.current.showDefinition = false;
                $scope.stats.unseenWords.shift();
                $scope.stats.unseen = $scope.stats.unseenWords.length + 1;
                nextWord = $scope.stats.unseenWords[1];
            }

            function loadDefinition(word) {
                if (word in definitions) {
                    console.log(definitions[word]);
                    if (word === $scope.current.word) {
                        if (definitions[word] !== 'Loading...') {
                            $scope.lookingUpCurrent = false;
                        } else {
                            $scope.lookingUpCurrent = true;
                        }
                    }
                } else {
                    definitions[word] = 'Loading...';
                    $scope.lookingUpCurrent = true;
                    DefineWord.get(word).then(function successCallback(res) {
                            console.log('Looked up ' + word);
                            console.log('Is the looked up word same as current word? ' + ($scope.current.word === word));
                            definitions[word] = res.data;
                            if ($scope.current.word === word) {
                                $scope.current.definition = definitions[word] + '<span class="md-caption">This definition is displayed from ' +
                                    '<a class="hyperlink" target="_blank" href="http://vocabulary.com/dictionary/' +
                                    word + '">vocabulary.com/dictionary/' + word + '</a></span><br><br>';
                                $scope.lookingUpCurrent = false;
                            }
                            console.log('lookingUpCurrent: ' + $scope.lookingUpCurrent);
                            console.log('currentWord.showDefintion ' + $scope.current.showDefinition);
                        },
                        function errorCallback(res) {
                            console.error(res.status + ' Could not get definition for ' + word + '.');
                            definitions[word] = 'Could not get definition for ' + word + '.';
                            if ($scope.current.word === word) {
                                $scope.current.definition = definitions[word];
                                $scope.lookingUpCurrent = false;
                            }
                        });
                }
                return definitions[word];
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

            // Helper functions
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

            function fadeOutFlashcard() {
                var classes = $document[0].getElementById('flashcard').className;
                classes = classes.replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes = classes.replace(/(?:^|\s)fade-[a-z\-]+(?!\S)/g, '');
                classes += ' flip-flashcard-front fade-out-flashcard';
                $document[0].getElementById('flashcard').className = classes;
            }

            function fadeInFlashcard() {
                var classes = $document[0].getElementById('flashcard').className;
                classes = classes.replace(/(?:^|\s)flip-flashcard-[a-z]+(?!\S)/g, '');
                classes = classes.replace(/(?:^|\s)fade-[a-z\-]+(?!\S)/g, '');
                classes += ' fade-in-flashcard';
                $document[0].getElementById('flashcard').className = classes;
            }

        }
    ]);
