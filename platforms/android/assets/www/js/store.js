var mapKey ="mapas"
var idMapKey = "id_mapa"
var titleKey = "title_map"
var mapLocationKey = "position_map"
var detailPoiKey = "detailPoi"
var userLocationKey = "ubicacion"
var orderedKey = "orderedKey"

function setMapas(data, key){
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getMapas(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removeMapas(key){
  window.localStorage.removeItem(key);
}

function setPOIS(data,key){
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getPOIS(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removePOIS(key){
  window.localStorage.removeItem(key);
}

function setIdMap(data, key){
  window.localStorage.setItem(key, data);
}
function getIdMap(key){
  return window.localStorage.getItem(key);
}
function removeIdMap(key){
  window.localStorage.removeItem(key);
}

function setPOISByDistance(data,key){
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getPOISByDistance(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removePoisByDistance(key){
  window.localStorage.removeItem(key);
}

function setPOISOrdered(data,key){
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getPOISOrdered(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removePOISOrdered(key){
  window.localStorage.removeItem(key);
}

function setTitleMap(data, key){
  window.localStorage.setItem(key, data);
}
function getTitleMap(key){
  return window.localStorage.getItem(key);
}
function removeTitleMap(key){
  window.localStorage.removeItem(key);
}

function setMapLocation(data, key){
  window.localStorage.setItem(key, data);
}
function getMapLocation(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removeMapLocation(key){
  window.localStorage.removeItem(key);
}

function setDetailPoi(data, key){
  window.localStorage.setItem(key, JSON.stringify(data));
}
function getDetailPoi(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removeDetailPoi(key){
  window.localStorage.removeItem(key);
}

function setUserLocation(data, key){
  window.localStorage.setItem(key, data);
}
function getUserLocation(key){
  return JSON.parse(window.localStorage.getItem(key));
}
function removeUserLocation(key){
  window.localStorage.removeItem(key);
}
