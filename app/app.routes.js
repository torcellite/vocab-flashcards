'use strict';

/* Client sided routing */

angular.module('vocabFlashcardsApp')
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/');

            $stateProvider.
            state('flashcards', {
                url: '/flashcards',
                templateUrl: '../views/flashcards.html'
            });

        }
    ]);