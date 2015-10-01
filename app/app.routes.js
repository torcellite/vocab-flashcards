'use strict';

/* Client sided routing */

angular.module('vocabFlashcardsApp')
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/flashcards');

            $stateProvider.
            state('flashcards', {
                url: '/flashcards',
                templateUrl: '../views/flashcards.html'
            });

        }
    ]);