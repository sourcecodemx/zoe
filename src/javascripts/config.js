/* globals define */
define('config', function(){
	'use strict';

	return {
		PARSE: {
			//Prod
			ID: 'Li087ST1O7bYBGKxhFQhWwlKnPRy4jJ2575mz7C3',
			JSKEY: 'ex5SBIHB9bNN9ELyx1ZRFoqiWVfrl5SIukRct2zt'
			//Dev
			//ID: 'WhG4gZOUXz16xV4uLfDV4qLAjh3fDTl0DDxAwY0p',
			//JSKEY: '9q4nTLaRuPvEmdz4ztsXDabmjxmR0TuOxKkh3TeA'
		},
		PUSHER: {
			KEY: 'f0f806e6c0165a801fb1'
		},
		FB: {
			DEFAULT_PERMISSION: ['email', 'public_profile', 'publish_actions'],
			APP_NAME: 'Zoe Water Movil'
		},
		CAMERA: {
			DEFAULT: {height: 500, source: 'camera'},
			GALLERY: {height: 500, source: 'gallery'}
		},
		GEO: {
			DEFAULT: { enableHighAccuracy: true },
			DEFAULT_CENTER: {coords: {latitude: 19.432608, longitude: -99.133208}},
			DEFAULT_ZOOM: 6
		},
		DATE: {
			DAY: [
				'Domingo',
				'Lunes',
				'Martes',
				'Miercoles',
				'Jueves',
				'Viernes',
				'Sabado'
			]
		},
		GALLERY: {
			LIMIT: 24
		},
		BLOG: {
			LIMIT: 15
		}
	};
});