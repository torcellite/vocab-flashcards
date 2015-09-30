'use strict';

/* App Module */

/* Register the application module and configure the theme */

angular.module('vocabFlashcardsApp', [
        'ngAria',
        'ngAnimate',
        'ngFileUpload',
        'ngMaterial',	
        'ngSanitize',
        'ngTouch',
        
        'ui.router',

        'vocabFlashcardsControllers',
        'vocabFlashcardsServices'
    ]);

/* Register controllers, services, filters and directives */
angular.module('vocabFlashcardsControllers', []);
angular.module('vocabFlashcardsServices', []);