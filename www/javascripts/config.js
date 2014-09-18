/* globals define, Camera */
define('config', function(){
	'use strict';

	return {
		PARSE: {
			ID: 'Li087ST1O7bYBGKxhFQhWwlKnPRy4jJ2575mz7C3',
			JSKEY: 'ex5SBIHB9bNN9ELyx1ZRFoqiWVfrl5SIukRct2zt'
		},
		PUSHER: {
			KEY: 'f0f806e6c0165a801fb1'
		},
		FB: {
			DEFAULT_PERMISSION: ['email', 'read_stream'],
			BROADCAST_PERMISSION: [],
			APP_NAME: 'Zoe Water Movil'
		},
		CAMERA: {
			DEFAULT: {
				quality: 80,
				allowEdit: true,
				encodingType: Camera.EncodingType.JPEG,
				destinationType: Camera.DestinationType.DATA_URL,
				targetWidth: 500,
				targetHeight: 500
			}
		},
		GEO: {
			DEFAULT: { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true },
			DEFAULT_CENTER: {lat: 23.634501, lng: -102.552784},
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
		}
	};
});