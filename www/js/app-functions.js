$( document ).on( "pagecreate", "#index", function() {
  var TAG = "pagecreate index"
  console.log("---> "+ TAG + "<---");
  var data = getMapas(mapKey);
  if (data!=null){
    populateListMap(data);
  }
  checkListMap('#maps',"#map-search");
});

$( document ).on( "pagebeforeshow", "#index", function() {
  var TAG = "pagebeforeshow index"
  console.log("---> "+ TAG + "<---");
  var id_mapa = getIdMap(idMapKey);
  var poisByDistanceKey = "poi_map_distancia_" +id_mapa
  removePoisByDistance(poisByDistanceKey)
  removeTitleMap(titleKey)
  removeMapLocation(mapLocationKey)
  removeDetailPoi(detailPoiKey)
  removeUserLocation(userLocationKey)
  removeIdMap(idMapKey)
})

$( document ).on( "pagecreate", "#poi-list", function() {
  var TAG = "pagecreate POI-list"
  console.log("---> "+ TAG + "<---");
  var id_mapa = getIdMap(idMapKey);
  var poiskey = "poi_map_" +id_mapa
  var data = getPOIS(poiskey)
  populateListPoi(data);

})

$( document ).on( "pagebeforeshow", "#poi-list", function() {
  var TAG = "pagebeforeshow POI-list"
  console.log("---> "+ TAG + "<---");
  if(!$('#filter-widget').hasClass('hide-element')){
    var filtro = $('#select-choice-a').val();
    console.log("el filtro elegido es: " + filtro);
    var id_mapa = getIdMap(idMapKey)
    var poiskey = "poi_map_" +id_mapa
    var poisByDistanceKey = "poi_map_distancia_" +id_mapa
    if(filtro=='distancia'){
      data = getPOISByDistance(poisByDistanceKey)
      populateListPoi(data)
    }else if(filtro=='all'){
      data = getPOIS(poiskey)
      populateListPoi(data)
    }else{
      data = getPOIS(poiskey)
      var orderData;
      var output=''
      $.each(data, function (index, value) {
        if(filtro==value.categoria){
          console.log(value.titulo);
          output += '<li><a  class="poi-element" href="#detail-poi">' +
            '<p class="distancia"><strong>' + value.distancia_poi + '</strong> Kilometros</p>' +
            '<h2>' + value.titulo + '</h2>' +
            '<p><strong>'+ value.categoria +'</strong></p>' +
            '<span class="hide-element">'+ index + '</span>'
          '</a></li>'
        }
      });
      $('#pois').html(output).listview("refresh");
      //poiByCategory(id_mapa,filtro);
    }
  }
})
$( document ).on( "pagecreate", "#detail-poi", function() {
  var TAG = "pagecreate detail-poi"
  console.log("---> "+ TAG + "<---");
})

$( document ).on( "pagebeforeshow", "#detail-poi", function() {
  var TAG = "pagebeforeshow detail-poi";
  console.log("---> "+ TAG + "<---");
  var data = getDetailPoi(detailPoiKey)
  console.log("la distancia poi es: " + data.distancia_poi);
  console.log("la distancia es: " + data.distancia);
  if(data.distancia_poi>=data.distancia){
    $('#ar-button').addClass('ui-disabled');
  }else{
    $('#ar-button').removeClass('ui-disabled');
  }
  if(data.contenido=="no"){
    $('#ar-button').hide()
  }else{
    $('#ar-button').show()
  }
  $("#titulo_poi").text(data.titulo);
  $("#header_title_poi").text(data.titulo);
  $("#descripcion_poi").text(data.descripcion);
  $("#categoria_poi").text(data.categoria);
  $("#location_poi").text(data.direccion);
  $("#location_poi").attr("href", 'http://maps.google.com/?q='+ data.direccion);
  if(data.enlace == ""){
    $('#enlace-container').css("display","none")
  }else{
    $('#enlace-container').show();
    $("#enlace_poi").attr("href", data.enlace);
    $("#enlace_poi").text("Visitar sitio web");
  }
})

$(document).ready(function() {
  /*función que se encarga de manejar al clicar el enlace
  de detalle de un POI*/

  $('body').on('click', '#enlace_poi', function(event) {
    console.log("seleccionado enlace_poi");
  })

  /*Función que maneja el clickado de un POI almacenando
  los detalles con la clave: detailPoi para presentarlos
  en la pagina de detalle*/
  $('body').on('click', '.poi-element', function(event) {
    var id_mapa = getIdMap(idMapKey)
    var index = $(this).find('span').html();
    var filtro = $('#select-choice-a').val();
    var data
    if(filtro=="distancia"){
      var poisByDistanceKey = "poi_map_distancia_" +id_mapa
      data = getPOISByDistance(poisByDistanceKey)
    }else{
      var poiskey = "poi_map_" +id_mapa
      data = getPOIS(poiskey)
    }
    setDetailPoi(data[index], detailPoiKey)
  })

  /*Función que maneja el clickado en un mapa estableciendo
  en la pagina del mapa el titulo y el id del mapa para obtener
  diferentes datos del mapa*/
  $('body').on('click', '.map-element', function(event) {
        var id_mapa = $(this).find('span').html();
        var nombre_mapa = $(this).find('h2').html();
        var latitud = $(this).find('#map-latitud').html();
        var longitud = $(this).find('#map-longitud').html();
        removeIdMap(idMapKey);
        removeTitleMap(titleKey)
        setIdMap(id_mapa, idMapKey)
        setTitleMap(nombre_mapa, titleKey)
        var position = '{"latitud":"'+ latitud +'","longitud":"'+ longitud + '"}'
        setMapLocation(position,mapLocationKey)
    });
    $('#filter-button').on('click',function(){
      var id_mapa = getIdMap(idMapKey)
      var hide =$('#filter-widget').hasClass('hide-element');
      if(hide){
        $('#filter-widget').removeClass('hide-element');
      }else{
        console.log("oculto");
        $('#filter-widget').addClass('hide-element');
        $('select#select-choice-a').index[0];

      }
    });
})

/*comprueba si la lista de mapas o de POIs tiene elementos
para mostrar el buscador u ocultarlo si no hay elementos*/
function checkListMap(element,search){
  if ($(element).children('li').length > 0) {
     $(search).show();
  }else{
    $(search).hide();
  }
}
/*Función que se encarga de actualizar los mapas
del servidor y almacenarlos en la variable mapas y
llamar a la funcion que descarga los POIs de cada
mapa*/
loadMaps = function(){
  var TAG = "loadMaps";
  $(document).ready(function() {
     var accept = window.confirm("¿Quiere actualizar la lista de mapas de la aplicación?");
     if(accept){
       $.ajax({
         url:'http://tfg1617maps.zapto.org:8080/mapas?app=true',
         method: 'get',
         success : function(res){
           setMapas(res.mapList,mapKey)
           console.log(TAG + " obtenidos los mapas vamos a obtener los POIS de cada mapa");
           var data = getMapas(mapKey)
           populateListMap(data);
           checkListMap('#maps',"#map-search");
           $.each(data, function (index, value) {
             console.log(TAG + " descargando POIs del mapa: " + value.nombre + "con id =" + value.id_mapa);
             loadPois(value.id_mapa);
           });
         },
         error: function () {
           alert('Hay un problema para obtener el listado de mapas del servidor');
         }
       });
     }else{
       console.log("-->" + TAG + "<--" + "el usuario ha cancelado la actualizacion del listado de mapas");
     }
  });
}

/*Función que se encarga de obtener los POIs
de un mapa dado a traves de su id_mapa y los almacena
de manera local con la clave poi_map_id_mapa en caso
de error informa al usuario de la imposibilidad de
descargar los POIs del mapa seleccionado*/
loadPois = function(id_mapa){
  var TAG = "loadPois";
  $(document).ready(function() {
        var url = 'http://tfg1617maps.zapto.org:8080/verPOI?id=' + id_mapa + '&app=true';
       $.ajax({
         url:'http://tfg1617maps.zapto.org:8080/verPOI?id=' + id_mapa + '&app=true',
         method: 'get',
         success : function(res){
           var poiskey = "poi_map_" +id_mapa
           setPOIS(res.poiList,poiskey)
         },
         error: function () {
           alert('Hay un problema para obtener el listado de POIS del mapa selecionado desde el servidor');
         }
       });
  });
}

/*Función que se encarga de rellenar el listado
de mapas de la aplicación con los diferentes elementos
del mapa*/
populateListMap = function(data){
  var TAG = "populateListMap";
  var output = '';
  $.each(data, function (index, value) {
    output += '<li><a  class="map-element" href="#map-page">' +
      '<img class="imgThumb" src="img/icon-maps/' + value.icono + '.png">' +
      '<h2>' + value.nombre + '</h2>' +
      '<p>'+ value.fecha_creacion +'</p>' +
      '<span class="hide-element">'+ value.id_mapa + '</span>' +
      '<span class="hide-element" id="map-latitud">'+ value.latitud + '</span>' +
      '<span class="hide-element" id="map-longitud">'+ value.longitud + '</span>'
    '</a></li>'
  });
  $('#maps').html(output).listview("refresh");
}

/*Función que se encarga de rellenar la lista
de POI de la aplicacion de un mapa dado con los
diferentes elementos del POI*/
populateListPoi = function(data){
  var TAG = "populateListPoi";
  var output = '';
  $.each(data, function (index, value) {
    output += '<li><a  class="poi-element" href="#detail-poi">' +
      '<p class="distancia"><strong>' + value.distancia_poi + '</strong> Kilometros</p>' +
      '<h2>' + value.titulo + '</h2>' +
      '<p><strong>'+ value.categoria +'</strong></p>' +
      '<span class="hide-element">'+ index + '</span>'
    '</a></li>'
  });
  $('#pois').html(output).listview("refresh");
}
function poiByCategory(id,categoria){
  $.ajax({
    url:'http://tfg1617maps.zapto.org:8080/categoryfilter?id_mapa='+id+'&categoria='+categoria,
    method: 'get',
    success : function(res){
      addDistance(res.poiList)
    },
    error: function () {
      alert('No se puede filtrar en estos momentos.');
    }
  });
}
function addDistance(data){
  var id_mapa = getIdMap(idMapKey)
  var poiskey = "poi_map_" +id_mapa
  var ubicacion = getUserLocation(userLocationKey)
  for(var i = 0; i<data.length;i++){
    var posicionPOI = JSON.parse('{"lat":"'+ data[i].latitud +'","lon":"'+ data[i].longitud + '"}');
    var distancia = haversineDistance(ubicacion,posicionPOI)
    data[i].distancia_poi = distancia;
  }
  setPOISOrdered(data,orderedKey)
  populateListPoi(data);
}
loadCategoria = function(id_mapa){
  var TAG = "loadCategoria";
  console.log("pasamos por aqui");
  $(document).ready(function() {
       $.ajax({
         url:'http://tfg1617maps.zapto.org:8080/categoria?id_mapa=' + id_mapa,
         method: 'get',
         success : function(res){
           console.log(res.categoria);
           var select = document.getElementById('select-choice-a');
           console.log("el select es: "+select);
           $.each(res.categoria, function (index, value) {
             console.log("creando parametros");
             var opt = document.createElement('option');
             opt.value = opt.text=value.categoria;
             select.appendChild(opt);
           })
           select.selectmenu('refresh', true);
         },
         error: function () {
           alert('Hay un problema para obtener el listado de categorias del mapa dado');
           return null;
         }
       });
  });
}
