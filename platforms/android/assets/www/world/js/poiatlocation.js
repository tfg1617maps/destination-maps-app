// implementation of AR-Experience (aka "World")
var World = {
	// true once data was fetched
	initiallyLoadedData: false,
	markerDrawable_directionIndicator: null,
	detailPoiKey: "detailPoi",
	data: null,
	createImageElement: function createImageElementFn(tamanio, markerDrawable_idle,markerLocation){
		var directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawable_directionIndicator, 0.1, {
        enabled: true,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });
		var markerImageDrawable_idle = new AR.ImageDrawable(markerDrawable_idle, tamanio, {
			zOrder: 0,
			opacity: 1.0,
			onClick: function imageClicked () {
				alert("prueba")
			}
		});
		var markerObject = new AR.GeoObject(markerLocation, {
			drawables: {
				cam: [markerImageDrawable_idle],
				indicator: directionIndicatorDrawable
			}
		});
	},
	createVideoElement: function createVideoElementFn(url, transparencia, tamanio,markerLocation){
		var directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawable_directionIndicator, 0.1, {
        enabled: true,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });
		if(transparencia=='yes'){
			var video = new AR.VideoDrawable(url, tamanio, {
					isTransparent: true,
					onLoaded: function videoLoaded() {
					},
					onPlaybackStarted: function videoPlaying () {
							video.enabled = true;
					},
					onFinishedPlaying: function videoFinished () {
							video.playing = false;
							video.enabled = false;
					},
					onClick: function videoClicked () {
							if (video.playing) {
									video.pause();
									video.playing = false;
									playButton.enabled = true;
							} else {
									video.resume();
									video.playing = true;
									playButton.enabled = true;
							}
					}
			});
		}else{
			var video = new AR.VideoDrawable(url, tamanio, {
					onLoaded: function videoLoaded() {
					},
					onPlaybackStarted: function videoPlaying () {
							video.enabled = true;
					},
					onFinishedPlaying: function videoFinished () {
							video.playing = false;
							video.enabled = false;
					},
					onClick: function videoClicked () {
							if (video.playing) {
									video.pause();
									video.playing = false;
									playButton.enabled = true;
							} else {
									video.resume();
									video.playing = true;
									playButton.enabled = true;
							}
					}
			});
		}
		var markerObject = new AR.GeoObject(markerLocation, {
			onEnterFieldOfVision : function(){
				video.resume();
				video.playing = true;
				playButton.enabled = true;
			},
			onExitFieldOfVision : function(){
				video.pause();
				video.playing = false;
				playButton.enabled = true;
			},
			drawables: {
				cam: [video],
				indicator: directionIndicatorDrawable
			}
		});
	},
	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {
		var elements = 0;
		var markers =[];
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");
		for (var element = 0; element < poiData.length; element++) {
			var elemento = poiData[element].elemento
			if(elemento != null){
				elements ++;
				markers.push(new AR.GeoLocation(poiData[element].latitude, poiData[element].longitude, poiData[element].altitude));
				if(elemento=='imagen'){
					//crear un elemento AR imagen
					//http://tfg1617maps.zapto.org:8080/downloads?name=file_image_1494415920530_esculturas.jpg
					//assets/JulianBesteiro.jpg
					var url = "http://tfg1617maps.zapto.org:8080/downloads?name="+poiData[element].archivo
					var markerDrawable_idle = new AR.ImageResource(url);
					World.createImageElement(poiData[element].tamanio,markerDrawable_idle,markers[element]);
				}else if(elemento=='video'){
					//creamos un elemento AR video
					var url = "http://tfg1617maps.zapto.org:8080/downloads?name="+poiData[element].archivo
					World.createVideoElement(url, poiData[element].transparencia, poiData[element].tamanio,markers[element]);
				}
			}
		}
		World.updateStatusMessage(elements + ' place loaded');
	},

	// updates status message shown in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {
		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {
		if (!World.initiallyLoadedData) {
			World.data = JSON.parse(window.localStorage.getItem(World.detailPoiKey));
			var latitud = Number(World.data.latitud)
			var longitud = Number(World.data.longitud)
			var poiData = [
				{
					"id": 1,
					"latitude": latitud,
					"longitude": longitud,
					"altitude": AR.CONST.UNKNOWN_ALTITUDE,
					"elemento": World.data.elemento1,
					"archivo": World.data.archivo1,
					"tamanio": Number(World.data.tamanio1),
					"transparencia": World.data.transparent1
				},
				{
					"id": 2,
					"latitude": (latitud + 0.1),
					"longitude": (longitud + 0.1),
					"altitude": AR.CONST.UNKNOWN_ALTITUDE,
					"elemento": World.data.elemento2,
					"archivo": World.data.archivo2,
					"tamanio": Number(World.data.tamanio2),
					"transparencia": World.data.transparent2
				},
				{
					"id": 3,
					"latitude": (latitud - 0.1),
					"longitude": (longitud - 0.1),
					"altitude": AR.CONST.UNKNOWN_ALTITUDE,
					"elemento": World.data.elemento3,
					"archivo": World.data.archivo3,
					"tamanio": Number(World.data.tamanio3),
					"transparencia": World.data.transparent3
				}
			];
			World.loadPoisFromJsonData(poiData);
			World.initiallyLoadedData = true;
		}
	},
};

/*
	Set a custom function where location changes are forwarded to. There is also a possibility to set AR.context.onLocationChanged to null. In this case the function will not be called anymore and no further location updates will be received.
*/
AR.context.onLocationChanged = World.locationChanged;