//variables globales
var map;
var userMarker;
var watchID;
var markers = [];
var markersListener = [];

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
  //ajustar mapa al tamaño de la pantalla del dispositivo.
  $("#content").height($(window).height()-($("#header").height()+$("#footer").height()))
  var userLocation = getUserLocation(userLocationKey);
  if(userLocation==null){
    //creamos el mapa
    console.log("pintamos el mapa");
    drawMap()
  }
});
/*obtiene la ubicacion de usuario y la almacena para ser
utilizada poseteriormente por la aplicación*/
function obtenerUbicacion(){
  var data = getMapLocation(mapLocationKey)
  if(navigator.geolocation){
    function onSuccess(pos) {
      console.log("coordenadas obtenidas con exito");
      //localicacion encontrada almacenamos la localizacion
      almacenarUbicacion(pos.coords.latitude,pos.coords.longitude);
    }
    function onError(error) {
      console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      //localizacion no encontrada almacenamos la localizacion de la ciudad en cuestion
      almacenarUbicacion(data.latitud,data.longitud);
    }
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    //navigator.geolocation.getCurrentPosition(success, fail);
  }else{
    console.log("imposible obtener ubicacion de usuario");
    //imposible acceder gps dispositivo almacenamos la localizacion de la ciudad en cuestion
    almacenarUbicacion(data.latitud,data.longitud);
  }
}

/*almacena la ubicacion obtendia por la funcion obtenerUbicacion()
o en caso de error almacena como ubicacion en centro del mapa que
se esta mostrando*/
function almacenarUbicacion(latitud,longitud){
  //obtenemos la ubicacion almacenada del usuario.
  var userLocation = getUserLocation(userLocationKey);
  //creamos el elemento y la clave que almacenara la ubicacion del usuario
  var positionUserKey ="ubicacion"
  var ubicacion ='{"lat":"'+ latitud +'","lon":"'+ longitud + '"}'
  var id_mapa = getIdMap(idMapKey)
  var poiskey = "poi_map_" +id_mapa
  var infoWindow = new google.maps.InfoWindow();
  var data;

  if(userLocation==null){
    console.log("primer acceso");
    //primer acceso al mapa no disponemos de posicion almacenada.
    //almacenamos la ubicacion recibida.
    setUserLocation(ubicacion,userLocationKey)
    orderByDistance();
    //creamos los marcadores
    console.log("creamos los marcadores");
    data = getPOIS(poiskey)
    drawMarkers(map,infoWindow,data);
  }else{
    console.log("sucesivos accesos");
    //sucesivos accesos al mapa si disponemos de posicion almacenada.
    //si la posicion del usuario cambia recalcular distancias
    console.log("latitud antigua: " + userLocation.lat);
    console.log("latitud nueva: " + latitud);
    console.log("longitud antigua: " + userLocation.lon);
    console.log("longitud nueva: " + longitud);
    if(userLocation.lat != latitud || userLocation.lon != longitud){
      console.log("nuevas coordenadas");
      //navigator.geolocation.clearWatch(watchID);
      for (var i = 0; i < markersListener.length; i++) {
        google.maps.event.removeListener(markersListener[i]);
      }
      markersListener = []
      //almacenamos nueva posicion del usuario.
      setUserLocation(ubicacion,userLocationKey)
      //ordenamos los POI por distancia
      orderByDistance();
      console.log("actualizar marcadores");
      data = getPOIS(poiskey)
      updateMarkers(map, infoWindow, data)
    }
  }
}

/*
recibe la posicion del usuario y la posicion del POI
y devuelve la distancia entre los dos puntos*/
function obtainDistance(userLocation,poiLocation){
  return haversineDistance(userLocation,poiLocation)
}

/*
ordena los puntos de interes por distancia al usuario y los
almacena para utilizarlos posteriormente*/
function orderByDistance(){
  console.log("Calculamos la distancia");
  //preparamos elementos necesarios para obtener los datos almacenados
  var id_mapa = getIdMap(idMapKey)
  var poiskey = "poi_map_" +id_mapa
  var poisByDistanceKey = "poi_map_distancia_" +id_mapa
  var ubicacion = getUserLocation(userLocationKey)
  //POI almacenados del mapa
  var data = getPOIS(poiskey)
  //calculamos las distancias de cada POI con la distancia del usuario
  for(var i = 0; i<data.length;i++){
    var posicionPOI = JSON.parse('{"lat":"'+ data[i].latitud +'","lon":"'+ data[i].longitud + '"}');
    var distancia = obtainDistance(ubicacion,posicionPOI)
    data[i].distancia_poi = distancia;
  }
  //almacenamos los POIS ordenados por categorias con la distancia actualizada
  setPOIS(data,poiskey)
  //ordenamos por distancia los POIs
  heapSort(data);
  //almacenamos los POIS ordenados por distancia con la distancia actualizada
  setPOISByDistance(data,poisByDistanceKey)
}

/*centra la posicion del usuario en el mapa*/
function centrarUsuario(){
  var cityLatLng = getCoordenadasCiudad();
  var coordenadas =  getUserLocation(userLocationKey)
  if(coordenadas!=null){
    console.log("coordenadas obtenidas con exito vamos a centrar usuario");
    var latlng = new google.maps.LatLng(coordenadas.lat, coordenadas.lon)
    map.setCenter(latlng)
    map.setZoom(16);
  }else{
    console.log("no disponemos de coordenadas no podemos centrar al usuario");
  }
}

/*obtiene las coordenadas almacenadas de la ciudad y
las devuelve en formato posicion de google maps*/
function getCoordenadasCiudad(){
  var data = getMapLocation(mapLocationKey)
  var cityLatLng = new google.maps.LatLng(data.latitud, data.longitud);
  return cityLatLng
}

/*Función que se encarga de crear el mapa
obteniendo en primer lugar la posicion del usuario
y pintando el mapa con las coordenadas por defecto
o con las de usuario en funcion del exito o error
de obtener la ubicación del usuario*/
function drawMap(){
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
  //obtenemos la ubicación inicial del usuario.
  obtenerUbicacion();
}

function drawUserMarker(coordenadas){
  console.log("Dibujamos el marcador del usuario");
  if(userMarker!=null){
    console.log("usuario creado, actualizamos posicion");
    userMarker.setPosition(coordenadas)
  }else{
    userMarker = new google.maps.Marker({
      position: coordenadas,
      map: map,
      icon: 'img/user_location.png'
    });
  }
}

/*dibuja una marca en el mapa por cada elemento pasado como parametro
data en el mapa map y le añade una ventana de información al clickar en
la marca en el mapa, ademas añade una marca en la posicion del usuario*/
function drawMarkers(map, infoWindow, data){
  console.log("pintamos los marcadores");
  /*obtenemos las coordenadas del usuario para crear
  el marcador con la posicion del usuario*/
  var coordenadas = getUserLocation(userLocationKey)
  var latlng = new google.maps.LatLng(coordenadas.lat, coordenadas.lon)
  drawUserMarker(latlng)
  //vamos a crear los marcadores del mapa
  for (var i = 0; i < data.length; i++) {
    var dataMarker = data[i];
    var image ='img/'+data[i].categoria+'.png'
    var myLatlng = new google.maps.LatLng(Number(data[i].latitud), Number(data[i].longitud));
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon: image
    });
    markers.push(marker);
  }
  updateMarkers(map,infoWindow,data)
}

function updateMarkers(map, infoWindow, data){
  var coordenadas = getUserLocation(userLocationKey)
  var latlng = new google.maps.LatLng(coordenadas.lat, coordenadas.lon)
  drawUserMarker(latlng);
  for (var i = 0; i < data.length; i++) {
    //Attach click event to the marker.
    (function (marker, dataMarker,index) {
      var markerHandlerElement = google.maps.event.addListener(marker, "click", function (e) {
      console.log("clicamos el marcador actualizado");
      var detailPoiKey = "detailPoi"
      setDetailPoi(data[index], detailPoiKey)
      if(dataMarker.contenido=="si"){
        var content = '<div id="iw-container">' +
          '<div class="iw-title"><strong>'+dataMarker.titulo+'</strong></div>' +
            '<div class="iw-content">' +
              '<div style=float:left><p style="text-align:right">'+dataMarker.categoria+'</p></div>' +
              '<div><p style="text-align:right">Distancia: '+'<strong>'+dataMarker.distancia_poi+' Km.</strong></p></div>' +
              '<p style="text-align:right">'+dataMarker.direccion+'</p>' +
              '<div style="float:left; text-align:left;"><a href="javascript:app.loadExampleARchitectWorld()"><img src="img/ar-icon.png"></a></div>' +
              '<div style="float:right; text-align:right;margin-top:16px"><a href="#detail-poi">+ info </a></div>' +
            '</div>'+
          '</div>';
        }else{
          var content = '<div id="iw-container">' +
            '<div class="iw-title"><strong>'+dataMarker.titulo+'</strong></div>' +
              '<div class="iw-content">' +
                '<div style=float:left><p style="text-align:right">'+dataMarker.categoria+'</p></div>' +
                '<div><p style="text-align:right">Distancia: '+'<strong>'+dataMarker.distancia_poi+' Km.</strong></p></div>' +
                '<p style="text-align:right">'+dataMarker.direccion+'</p>' +
                '<div style="float:right; text-align:right;"><a href="#detail-poi">+ info </a></div>' +
              '</div>'+
            '</div>';
        }
        infoWindow.setContent(content);
        infoWindow.open(map, marker,content);
      });
      markersListener.push(markerHandlerElement)
    })(markers[i], data[i],i);
  }
  console.log("el tamaño del listener de eventos es: " + markersListener.length);
}
