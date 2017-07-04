//variable que almacena la entidad mapa necesaria para google maps
var map;
var userMarker;

/*Función ejecutada antes de mostrar la pagina del mapas
se encarga de actualizar el titulo de la pagina y vaciar
el mapa para repintarlo*/
$( document ).on( "pagecreate", "#map-page", function() {
  console.log("creamos la pagina de mapas");
})
$(document).on( "pagebeforeshow", "#map-page", function() {
  //ponemos en el encabezado el nombre del mapa
  var titleMapKey ="title_map"
  var nombre = getTitleMap(titleKey)
  var text ="Mapa de " + nombre
  $("#header_title_map").text(text);
  if(getUserLocation(userLocationKey)==null){
    $("#map-canvas").empty();
  }
})

/*Función que se ejecuta al mostrar la pagina del mapa
ajustamos el contenido al tamaño de pantalla del dispositivo
llamamos a la función crear mapa*/
$(document).on( "pageshow", "#map-page", function() {
  var TAG = "pageshow map-page"
  console.log("---> "+ TAG + "<---");
  $("#content").height($(window).height()-($("#header").height()+$("#footer").height()))
  obtenerUbicacion();
});

/*obtiene la ubicacion de usuario y la almacena para ser
utilizada poseteriormente por la aplicación*/
function obtenerUbicacion(){
  if(navigator.geolocation){
    function success(pos) {
      // Location found, show map with these coordinates
      console.log("coordenadas obtenidas con exito");
      almacenarUbicacion(pos.coords.latitude,pos.coords.longitude);
    }
    function fail(error) {
      // Failed to find location, show default map
      console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      var data = getMapLocation(mapLocationKey)
      almacenarUbicacion(data.latitud,data.longitud);
    }
    // Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
    navigator.geolocation.getCurrentPosition(success, fail);
  }else{
    console.log("imposible obtener ubicacion de usuario");
    var data = getMapLocation(mapLocationKey)
    almacenarUbicacion(data.latitud,data.longitud);
  }
}

/*almacena la ubicacion obtendia por la funcion obtenerUbicacion()
o en caso de error almacena como ubicacion en centro del mapa que
se esta mostrando*/
function almacenarUbicacion(latitud,longitud){
  var positionUserKey ="ubicacion"
  var ubicacion ='{"lat":"'+ latitud +'","lon":"'+ longitud + '"}'
  var userLocation = getUserLocation(userLocationKey);
  if(userLocation==null){
    console.log("userLocation null");
    setUserLocation(ubicacion,userLocationKey)
    orderByDistance();
    createMap();
  }else{
    if(latitud==userLocation.lat && longitud==userLocation.lon){
      setUserLocation(ubicacion,userLocationKey)
      orderByDistance();
      var latlng = new google.maps.LatLng(userLocation.lat, userLocation.lon)
      userMarker.setMap(map)
      userMarker.setPosition(latlng)
    }
  }

}

/*
ordena los puntos de interes por distancia al usuario y los
almacena para utilizarlos posteriormente*/
function orderByDistance(){
  var id_mapa = getIdMap(idMapKey)
  var poiskey = "poi_map_" +id_mapa
  var poisByDistanceKey = "poi_map_distancia_" +id_mapa
  console.log("Calculamos la distancia");
  var ubicacion = getUserLocation(userLocationKey)
  var data = getPOIS(poiskey)
  for(var i = 0; i<data.length;i++){
    var posicionPOI = JSON.parse('{"lat":"'+ data[i].latitud +'","lon":"'+ data[i].longitud + '"}');
    var distancia = haversineDistance(ubicacion,posicionPOI)
    data[i].distancia_poi = distancia;
  }
  //almacenamos los POIS ordenados por categorias con la distancia actualizada
  setPOIS(data,poiskey)
  //ordenamos por distancia los POIs
  heapSort(data);
  //almacenamos los POIS ordenados por distancia con la distancia actualizada
  setPOISByDistance(data,poisByDistanceKey)
}

/*obtiene las coordenadas almacenadas de la ciudad y
las devuelve en formato posicion de google maps*/
function getCoordenadasCiudad(){
  var data = getMapLocation(mapLocationKey)
  var cityLatLng = new google.maps.LatLng(data.latitud, data.longitud);
  return cityLatLng
}

/*centra el mapa en la posicion de la ciudad y muestra
el boton de centrar mapa en usuario, ya que el mapa con
esta funcion queda centrado en la ciudad*/
function centrarCiudad(){
  map.setCenter(getCoordenadasCiudad())
  // $("#centrar").text("centrar usuario")
  // $("#centrar").removeClass('ui-btn ui-icon-navigation')
  // $("#centrar").addClass('ui-btn ui-icon-user')
  // $("#centrar").attr("href", "javascript:centrarUsuario();")
}

function centrarUsuario(){
  var cityLatLng = getCoordenadasCiudad();
  var coordenadas =  getUserLocation(userLocationKey)
  if(coordenadas!=null){
    console.log("coordenadas obtenidas con exito vamos a centrar usuario");
    // $("#centrar").text("centrar ciudad")
    // $("#centrar").removeClass('ui-btn ui-icon-user')
    // $("#centrar").addClass('ui-btn ui-icon-navigation')
    // $("#centrar").attr("href", "javascript:centrarCiudad();")
    var latlng = new google.maps.LatLng(coordenadas.lat, coordenadas.lon)
    map.setCenter(latlng)
  }else{
    console.log("no disponemos de coordenadas no podemos centrar al usuario");
  }
}

/*Función que se encarga de crear el mapa
obteniendo en primer lugar la posicion del usuario
y pintando el mapa con las coordenadas por defecto
o con las de usuario en funcion del exito o error
de obtener la ubicación del usuario*/
createMap = function(){
  var cityLatLng = getCoordenadasCiudad();
  var myOptions = {
    zoom: 12,
    center: cityLatLng,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  drawMap();
}

/*funcion que dibuja un mapa con unas coordenadas(latlng) dadas
creando la marca de las coordenadas pasadas como argumento*/
drawMap = function() {
  console.log("-->maps.js<-- Dibujamos el mapa");
  var infoWindow = new google.maps.InfoWindow();
  var id_mapa = getIdMap(idMapKey)
  var poiskey = "poi_map_" + id_mapa;
  var data = getPOIS(poiskey)
  drawMarkers(map, infoWindow, data);
}

/*dibuja una marca en el mapa por cada elemento pasado como parametro
data en el mapa map y le añade una ventana de información al clickar en
la marca en el mapa, ademas añade una marca en la posicion del usuario*/
drawMarkers = function(map, infoWindow, data){
  var markers = [];
  var coordenadas = getUserLocation(userLocationKey)
  var latlng = new google.maps.LatLng(coordenadas.lat, coordenadas.lon)
  userMarker = new google.maps.Marker({
    position: latlng,
    map: map,
  });
  for (var i = 0; i < data.length; i++) {
    var dataMarker = data[i];
    var image ='img/'+dataMarker.categoria+'.png'
    var myLatlng = new google.maps.LatLng(Number(dataMarker.latitud), Number(dataMarker.longitud));
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon: image
    });
    markers.push(marker);
    //Attach click event to the marker.
    (function (marker, dataMarker,index) {
      google.maps.event.addListener(marker, "click", function (e) {
        console.log("clicamos el marcador");
        var detailPoiKey = "detailPoi"
        setDetailPoi(data[index], detailPoiKey)
        var content = '<div id="iw-container">' +
            '<div class="iw-title"><strong>'+dataMarker.titulo+'</strong></div>' +
            '<div class="iw-content">' +
              '<div style=float:left><p style="text-align:right">'+dataMarker.categoria+'</p></div>' +
              '<div><p style="text-align:right">Distancia: '+'<strong>'+dataMarker.distancia_poi+' Km.</strong></p></div>' +
              '<p style="text-align:right">'+dataMarker.direccion+'</p>' +
              '<div style="text-align:right"><a href="#detail-poi">+ info </a></div>' +
            '</div>'+
          '</div>';
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });
    })(marker, dataMarker,i);
  }
  // Add a marker clusterer to manage the markers.
  // var markerCluster = new MarkerClusterer(map, markers,{
  //   imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
  // });
}
