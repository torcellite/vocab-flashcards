'use strict';

angular.module('vocabFlashcardsServices')
    .factory('DefineWord', ['$http',
        function($http) {
            return {
                get: function(word) {
                    return $http.get('http://localhost:3000/define/' + word);
                }
            }
        }
    ]);