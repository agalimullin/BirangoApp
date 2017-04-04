'use strict';

var app = angular.module('birangoApp');
app.controller('MainController', ['$scope', '$http', '$compile', function ($scope, $http, $compile) {

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
    /*---------------------------------------------------------------*/

    var maps = {}; // общий объект, содержащий все объекты-карты
    
    var updateMap = function (mapService, map) {
      switch (mapService){
          case 'yandex': map.container.fitToViewport(); break;
          case 'google':  google.maps.event.trigger(map, 'resize'); break;
          case 'gis': map.invalidateSize(); break;
      }
    };
    
    var getMapContainer = function (mapService, i, mainContainer) {
        var container = document.createElement('div');
        container.className = 'mapCon';
        container.id = mapService + "MapContainer" + i;
        angular.element(mainContainer).append(container);
        $('#' + mapService + 'MapContainer' + i).siblings().not('ul, h2, p').hide();
        return container;
    };

    // Yandex maps
    var yandexMaps = function (x, y, container, i) {
        ymaps.ready(init);
        function init() {
            var ymapContainer = getMapContainer('yandex', i, container);
            maps['yandexMap' + i] = new ymaps.Map(ymapContainer, {
                center: [x, y],
                zoom: 15,
                controls: ["zoomControl", "fullscreenControl"]
            });
            var placemark = new ymaps.Placemark([x, y]);
            maps['yandexMap' + i].geoObjects.add(placemark);
            localStorage[i] = 'yandex';
        }
    };

    // Google maps
    var googleMaps = function (x, y, container, i) {
        var gmapContainer = getMapContainer('google', i, container);
        var mapOptions = {
            center: new google.maps.LatLng(x, y),
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true
        };
        maps['googleMap' + i] = new google.maps.Map(gmapContainer, mapOptions);
        var marker = new google.maps.Marker({
            position: {lat: x, lng: y}, map: maps['googleMap' + i]
        });
        marker.setMap(maps['googleMap' + i]);
        localStorage[i] = 'google';
    };

    // Gis maps
    var gisMaps = function (x, y, container, i) {
        DG.then(init);
        function init() {
            var gismapContainer = getMapContainer('gis', i, container);
            maps['gisMap' + i] = DG.map(gismapContainer, {
                center: [x, y], zoom: 15
            });
            DG.marker([x, y]).addTo(maps['gisMap' + i]);
            localStorage[i] = 'gis';
        }
    };

    /*---------------------------ПОИСК-------------------------------*/
    //массив, который временно хранит найденные по запросу объекты
    $scope.places = [];

    $scope.printPlace = function (query) {
        //получаем данные с сервака
        $http.get('objects.json').success(function (data, status, headers, config) {
            var flag = false;
            $scope.places = [];
            maps = {};
            localStorage['birangoSearch_' + query] = query;
            angular.forEach(data, function (value, index) {
                if (value.city.includes(query)){
                    flag = true;
                    $scope.places.push(value);
                    // yandexMaps(value.latitude, value.longitude, container, index)
                }
            });
            if (flag === false){
                $scope.places.push({city: "Ничего не найдено"});
            }
        }).error(function (data, status, headers, config) {
            console.log("No data found..");
        });
    };

    // переключение вкладок и отображение карты
    $scope.switchTabs = function (event) {
        angular.element(event.target).siblings().removeClass("active");
        angular.element(event.target).addClass("active");

        var container = $(event.target).parents('.bundle')[0]; //контейнер для карты
        var currentID = $(event.target).parents('.bundle')[0].id; //index
        var x = parseFloat($(event.target).parents('.bundle')[0].getAttribute('data-latitude')); //координата latitude
        var y = parseFloat($(event.target).parents('.bundle')[0].getAttribute('data-longitude')); //координата longitude

        //скрываем контейнеры других карт и отображаем текущий
        var serviceContainer = $("#" + event.target.getAttribute("data-target"));
        serviceContainer.siblings().not('ul, h2, p').hide();
        serviceContainer.show();

        //проверяем принадлежность к сервису и вызываем соответствующий метод
        var mapService = event.target.getAttribute("data-target").replace('MapContainer' + currentID, '');
        maps[mapService + 'Map' + currentID]
            ? updateMap(mapService, maps[mapService + 'Map' + currentID])
            : eval(mapService + 'Maps')(x, y, container, currentID);
        localStorage[currentID] = mapService;
    };

}]);