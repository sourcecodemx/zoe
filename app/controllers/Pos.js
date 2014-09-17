/* globals define, _, google, steroids, Backbone, ActivityIndicator, InfoBox */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var config = require('config');

	var Place = Backbone.Model.extend({
		idAttribute: 'objectId'
	});
	var Places = Backbone.Collection.extend({
		model: Place
	});

	return Controller.extend({
		id: 'pos-page',
		template: require('http://localhost/javascripts/templates/pos.js'),
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {

			});

			return events;
		})(),
		title: 'Puntos de Venta',
		markers: [],
		loading: false,
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.collection = new Places();

			this.listenTo(this.collection, 'reset', this.addAll, this);

			window.addEventListener('message', this.onMessage.bind(this));

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			leftButton.imageAsOriginal = false;
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/location@2x.png';
			rightButton.onTap = this.onRightButton.bind(this);
			rightButton.imageAsOriginal = false;

			steroids.view.navigationBar.update({
				title: this.title,
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

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
				closeBoxMargin: '12px 4px 2px 2px',
			});

			return this.render();
		},
		addAll: function(){
			this.collection.each(this.addMarker.bind(this));

			ActivityIndicator.hide();
		},
		addMarker: function(model){
			var position = model.get('location');
			var box = this.infowindow;
			var map = this.map;
			var image = {
				url: '/images/map_pin.png',
				scaledSize: new google.maps.Size(15, 40),
				size: new google.maps.Size(15, 40),
				origin: new google.maps.Point(0,0)
			};
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(position.latitude, position.longitude),
				map: this.map,
				title: model.get('nombre'),
				animation: google.maps.Animation.DROP,
				icon: image
			});
			
			var content = require('http://localhost/javascripts/templates/pos_info_window.js')({data: model.toJSON()});
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
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'posView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		onShow: function(){
			navigator.geolocation.getCurrentPosition(
				this.onGeolocation.bind(this),
				this.onGeolocationError.bind(this),
				config.GEO.DEFAULT
			);
		},
		onCenterChange: function(){
			if((this.map.getZoom() < 12) || this.loading){
				return;
			}

			ActivityIndicator.hide();

			var position = this.map.getCenter();
			var distanceFromLastPosition = Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(position, this.currentCenter)/1000);

			//Fetch new data only if user has moved 10kms from their last position
			if(distanceFromLastPosition >= 10){
				ActivityIndicator.show('Cargando');
				var latlng = {latitude: position.lat(), longitude: position.lng()};
				this.loading = true;
				window.postMessage({message: 'pos:fetch', position: latlng});
			}

			this.currentCenter = position;
		},
		onRightButton: function(){
			this.freestyle = false;
			
			this.currentCenter = this.map.getCenter();
			navigator.geolocation.getCurrentPosition(
				this.onGeolocation.bind(this),
				this.onGeolocationError.bind(this),
				config.GEO.DEFAULT
			);
		},
		onGeolocation: function(position){
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
				var image = {
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
					title: 'Mi ubicacion',
					animation: google.maps.Animation.DROP,
					icon: image
				});

				google.maps.event.addListener(this.map, 'center_changed', this.onCenterChange.bind(this));
				google.maps.event.addListener(this.map, 'zoom_changed', this.onCenterChange.bind(this));
			}

			this.currentCenter = this.map.getCenter();
			this.currentZoom = this.map.getZoom();
			this.loading = true;
			window.postMessage({message: 'pos:fetch', position: position.coords});
		},
		onGeolocationError: function(error){
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

				if(data.places.length){
					this.removeAll();
					this.collection.reset(data.places);
				}else{
					ActivityIndicator.hide();
					this.onError(null, {message: 'Al parecer no hay ningun punto de venta cercano a ti, intenta de nuevo.'});
				}
				break;
			case 'pos:fetch:error':
				this.onError(null, data.error);
				break;
			}
		}
	});
});