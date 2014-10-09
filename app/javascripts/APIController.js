/* global define, Parse, Pusher, Zoe, forge, User */
define(function(require){
	'use strict';

	forge.logging.info('APIController loaded');
	//Collections
	var Images = require('collections/Images');
	var Blog   = require('collections/Blog');
	//Configuration
	var config = require('config');
	//Require Pusher library
	require('pusher');

	//API Controller
	var Controller = function(){
		window.addEventListener('message', this.onMessage.bind(this));

		this.images = new Images();
		this.blog   = new Blog();
		this.user   = User.current();

		Pusher.log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		};

		var pusher = new Pusher(config.PUSHER.KEY);
		var channel = pusher.subscribe('main');
		//Subscribe to main channel
		channel.bind('main', function(data) {
			var message = data;
			var lastReceived = Zoe.storage.getItem('last-received-message');

			if(!lastReceived){
				//Set last-received-message to expire in 60 minutes
				Zoe.storage.setItem('last-received-message', true, 1000*60*60);
				navigator.notification.vibrate();
				forge.notification.alert('Zoe Mensajes', message);
			}
		});

		return this;
	};

	Controller.prototype = {
		onMessage: function(event){
			var data = event.data;

			switch(data.message){
			/**
			*
			*
			* Zoe POS Events
			*
			*/
			case 'pos:fetch':
				var location = new Parse.GeoPoint({latitude: data.position.latitude, longitude: data.position.longitude});
				var pos = Parse.Object.extend('POS');
				var posquery = new Parse.Query(pos);

				posquery
					.near('location', location)
					.withinKilometers('location', location, 10)
					.find()
					.then(function(places){
						window.postMessage({message: 'pos:fetch:success', places: places});
					})
					.fail(function(error){
						window.postMessage({message: 'pos:fetch:error', error: error});
					});
				break;
			}
		}
	};

	return new Controller();
});