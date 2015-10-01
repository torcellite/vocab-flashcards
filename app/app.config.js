'use strict';

/* Application Configuration */

angular.module('vocabFlashcardsApp')
    .config(['$httpProvider', '$mdThemingProvider',
        function($httpProvider, $mdThemingProvider) {
            $httpProvider.defaults
                .headers
                .common['X-Requested-With'] = 'XMLHttpRequest';

            $mdThemingProvider.theme('default')
                .primaryPalette('cyan')
                .accentPalette('deep-purple');
        }
    ]);