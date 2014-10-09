/* globals define, _, google, forge, Backbone */
define(function(require){
	'use strict';

	var Controller = require('Root');
	var config = require('config');

	var Place = Backbone.Model.extend({
		idAttribute: 'objectId'
	});

	var Places = Backbone.Collection.extend({
		model: Place
	});

	return Controller.extend({
		id: 'pos-page',
		template: require('templates/pos'),
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {

			});

			return events;
		})(),
		title: 'Puntos de Venta',
		markers: [],
		loading: false,
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			this.collection = new Places();

			this.listenTo(this.collection, 'reset', this.addAll, this);

			window.addEventListener('message', this.onMessage.bind(this));

			if(this.online){
				this._createInfoWindow();
			}

			return this.render();
		},
		addAll: function(){
			this.collection.each(this.addMarker.bind(this));

			forge.notification.hideLoading();
		},
		addMarker: function(model){
			var position = model.get('location');
			var box = this.infowindow;
			var map = this._getMap();
			var image = {
				url: '/images/map_pin.png',
				scaledSize: new google.maps.Size(15, 40),
				size: new google.maps.Size(15, 40),
				origin: new google.maps.Point(0,0)
			};
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(position.latitude, position.longitude),
				map: map,
				title: model.get('nombre'),
				animation: google.maps.Animation.DROP,
				icon: image
			});
			
			var content = require('templates/pos_info_window')({data: model.toJSON()});
			google.maps.event.addListener(marker, 'click', function() {
				box.setContent(content);
				box.open(map, this);
			});
			this.markers.push(marker);
		},
		removeAll: function(){
			_.each(this.markers, this.removeMarker, this);
			this.markers = [];
			this.collection.reset(null);
		},
		removeMarker: function(marker){
			marker.setMap(null);
			marker = null;
		},
		onRender: function(){
			//Call base method
			Controller.prototype.onRender.call(this);
			//Create map
			this.dom.map = this.$el.find('#map');
			//Try creating the map
			this._getMap();
		},
		onShow: function(){
			Controller.prototype.onShow.call(this);

			forge.topbar.addButton({
				icon: 'images/location@2x.png',
				position: 'right',
				prerendered: true
			}, this.onRightButton.bind(this));

			if(this.online){
				forge.notification.showLoading('Cargando');
				forge.geolocation.getCurrentPosition(
					this.onGeolocation.bind(this),
					this.onGeolocationError.bind(this),
					config.GEO.DEFAULT
				);
			}else{
				this.onContentError({message: 'No es posible cargar el mapa.'});
			}
		},
		onCenterChange: function(){
			if((this._getMap().getZoom() < 12) || this.loading){
				return;
			}

			forge.notification.hideLoading();

			var position = this._getMap().getCenter();
			var distanceFromLastPosition = Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(position, this.currentCenter)/1000);

			//Fetch new data only if user has moved 10kms from their last position
			if(distanceFromLastPosition >= 10){
				forge.notification.showLoading('Cargando');
				var latlng = {latitude: position.lat(), longitude: position.lng()};
				this.loading = true;
				window.postMessage({message: 'pos:fetch', position: latlng});
			}

			this.currentCenter = position;
		},
		onRightButton: function(){
			if(this.online){
				this.freestyle = false;
				forge.geolocation.getCurrentPosition(
					this.onGeolocation.bind(this),
					this.onGeolocationError.bind(this),
					config.GEO.DEFAULT
				);
			}else{
				this.offlineError();
			}
			
		},
		onGeolocation: function(position){
			forge.notification.hideLoading();

			this.position = position;
			this.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

			if(this.map){
				this.map.setOptions({
					center: this.location,
					zoom: 12
				});
				this.marker.setOptions({
					center: this.location
				});
			}else{
				this._getMap();
			}

			this.currentCenter = this.map.getCenter();
			this.currentZoom = this.map.getZoom();
			this.loading = true;

			window.postMessage({message: 'pos:fetch', position: position.coords});
		},
		onGeolocationError: function(error){
			forge.logging.info(error, 'geolocation error');

			switch(error.code){
			case 2:
				error.message = 'Ubicacion no disponible.';
				break;
			case 3:
				error.message = 'Ubicacion temporalmente no disponible';
				break;
			}

			this.onError(null, error);
			//Render map in default position (Mexico)
			this.onGeolocation({coords: {latitude: config.GEO.DEFAULT_CENTER.lat, longitude: config.GEO.DEFAULT_CENTER.lng}});
		},
		onFreestyle: function(index){
			switch(index){
			case 1:
				this.freestyle = true;
				break;
			}
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'pos:fetch:success':
				this.loading = false;
				forge.notification.hideLoading();
				/*
				if(data.places.length){
					this.removeAll();
					this.collection.reset(data.places);
				}else{
					forge.notification.hideLoading();
					this.onError(null, {message: 'Al parecer no hay ningun punto de venta cercano a ti, intenta de nuevo.'});
				}*/
				break;
			case 'pos:fetch:error':
				this.onError(null, data.error);
				break;
			}
		},
		onOnline: function(){
			Controller.prototype.onOnline.call(this);

			this._createInfoWindow();
		},
		_getMap: function(){

			if(this.map instanceof google.maps.Map){
				return this.map;
			}

			if(!this.position){
				this.position = config.GEO.DEFAULT_CENTER;
			}

			if(!this.location){
				this.location = new google.maps.LatLng(this.position.lat, this.position.lng);
			}

			this.image = {
				url: '/images/user_marker@2x.png',
				scaledSize: new google.maps.Size(30, 30),
				anchor: new google.maps.Point(10, 10)
			};
			this.map = new google.maps.Map(this.dom.map[0], {
				center: this.location,
				zoom: 12,
				zoomControl: false,
				streetViewControl: false
			});
			this.marker = new google.maps.Marker({
				position: this.location,
				map: this.map,
				title: '',
				animation: google.maps.Animation.DROP,
				icon: this.image
			});

			google.maps.event.addListener(this.map, 'center_changed', this.onCenterChange.bind(this));
			google.maps.event.addListener(this.map, 'zoom_changed', this.onCenterChange.bind(this));

			return this.map;
		},
		_createInfoWindow: function(){
			require(['infobox'], function(InfoBox){
				this.infowindow = new InfoBox({
					content: '',
					maxWidth: 280,
					pixelOffset: new google.maps.Size(-140, 0),
					zIndex: null,
					boxStyle: {
						background: 'url("http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif") no-repeat',
						opacity: 0.75,
						width: '280px'
					},
					closeBoxMargin: '12px 4px 2px 2px'
				});	
			}.bind(this));
		}
	});
});