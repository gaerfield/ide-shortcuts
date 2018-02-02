function preg_quote(str, delimiter) {
    //  discuss at: http://phpjs.org/functions/preg_quote/
    // original by: booeyOH
    // improved by: Ates Goral (http://magnetiq.com)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Onno Marsman
    //   example 1: preg_quote("$40");
    //   returns 1: '\\$40'
    //   example 2: preg_quote("*RRRING* Hello?");
    //   returns 2: '\\*RRRING\\* Hello\\?'
    //   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    //   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'

    return String(str)
        .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

// app.js
angular.module('ideShortcuts', ['ngSanitize','ngStorage'])
    .filter('highlight', function ($sce) {
        return function (text, phrase) {
            if (phrase && text.toLowerCase().contains(phrase))
                text = text.replace( new RegExp( "(" + preg_quote( phrase ) + ")" , 'gi' ), '<span class="highlighted">$1</span>' );
            
            return $sce.trustAsHtml(text)
        }
    })

    .controller('mainController', function ($scope,$http,$localStorage) {
        $scope.keyPressed = '';
        $scope.search = '';

        specialKeyMap = [{37 : 'Left'}, {38 : 'Up'}, {39 : 'Right'}, {40 : 'Down'}];

        var isModifierPressed = function (event) {
            return event.ctrlKey || event.altKey || event.shiftKey;
        };
        var specialKeyPressed = function (keyCode) {
            specialKey = specialKeyMap.filter((specialKey) => {return keyCode in  specialKey});
            return (specialKey && specialKey.length > 0 ) ? specialKey[0] : null;
        };

        var isValidCharacterKeyCode = function(param){
            return (param > 47 && param < 58) || // number keys
                param == 32 || // spacebar
                (param > 64 && param < 91) || // letter keys
                (param > 95 && param < 112) || // numpad keys
                (param > 185 && param < 193) || // ;=,-./` (in order)
                (param > 218 && param < 223);   // [\]' (in order)
        };

        $scope.onKeyDown = function (event) {
            if (isModifierPressed(event)) {
                var result = '';
                if (event.ctrlKey)
                    result += 'Ctrl + ';
                if (event.altKey)
                    result += 'Alt + ';
                if (event.shiftKey)
                    result += 'Shift + ';
                event.preventDefault();
                $scope.search = result;
                if(isValidCharacterKeyCode(event.keyCode))
                    $scope.search += String.fromCharCode(event.which);
                else{
                    var specialKey = specialKeyPressed(event.keyCode)
                    if (specialKey != null){
                        var result = result || '';
                        result += specialKey[event.keyCode];
                        event.preventDefault();
                        $scope.search = result;
                    }
                }  
            }
            else {
                if($scope.search.contains('+'))
                    $scope.search = '';
            }
        };

        const shortcutsFile = 'shortcuts.json';

        // only for testing
        $scope.reset = function() {
            $http.get(shortcutsFile).then(function (res) {
                $scope.shortcutTables = res.data;
                $localStorage.tables = res.data;
            });
        };

        // only for testing
        $scope.clear = function() {
            $scope.shortcutTables = null;
            delete $localStorage.tables;
        };

        $scope.shortcutTables = $localStorage.tables;
        if($scope.shortcutTables == null)
        {
            $http.get(shortcutsFile).then(function (res) {
                $scope.shortcutTables = res.data;
                $localStorage.tables = res.data;
            });
        }

    });


