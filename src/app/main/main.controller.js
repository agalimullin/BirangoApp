var app = angular.module('birangoApp');
app.controller('MainController', ['$scope', '$http', function ($scope, $http) {

    /*------------------------ МОДАЛКИ ----------------------------*/
    angular.element(document).ready(function () {
        var favoriteModal = $("#favoriteModal");
        // var countiesModal = $("#countriesModal");

        // Открытие модалки <избранное> по нажатию
        $scope.openFavorite = function () {
            favoriteModal.show();
        };

        // Закрытие модалки <избранное> по нажатию на крестик
        $scope.closeFavorite = function () {
            favoriteModal.hide();
        };

        // Если модалка открыта и был совершен клик за её областью, закрываем
        window.onclick = function (event) {
            if ($(event.target)[0] === favoriteModal[0]) {
                favoriteModal.hide();
            }
        };
    });

    /*---------------------------ПОИСК-------------------------------*/

    //массив, который временно хранит найденные по запросу объекты
    $scope.places = [];

    $scope.printPlace = function (query) {
        //получаем данные с сервака
        $http.get('objects.json').success(function (data, status, headers, config) {
            console.log(data);
            var flag = false;
            $scope.places = [];
            localStorage['birangoSearch_' + query] = query;
            angular.forEach(data, function (value, key) {
                if (value.city.includes(query)){
                    flag = true;
                    $scope.places.push(value)
                }
            });
            if (flag === false){
                $scope.places.push({city: "Ничего не найдено"});
            }
        }).error(function (data, status, headers, config) {
            console.log("No data found..");
        });
    };
}]);