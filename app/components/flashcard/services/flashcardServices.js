'use strict';

angular.module('vocabFlashcardsServices')
    .factory('DefineWord', ['$http',
        function($http) {
            return {
                get: function(word) {
                    return $http.get('http://localhost:3000/define/' + word);
                }
            };
        }
    ])
    .factory('SampleWords', ['$http',
        function($http) {
        	return {
        		load: function() {
        			return $http.get('../assets/txt/sample_words.txt');
        		}
        	}
        }
    ]);
