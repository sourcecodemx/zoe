/* globals define, Camera */
define('config', function(){
	'use strict';

	return {
		PARSE: {
			ID: 'Li087ST1O7bYBGKxhFQhWwlKnPRy4jJ2575mz7C3',
			JSKEY: 'ex5SBIHB9bNN9ELyx1ZRFoqiWVfrl5SIukRct2zt'
		},
		FB: {
			DEFAULT_PERMISSION: ['email', 'read_stream'],
			BROADCAST_PERMISSION: [],
			APP_ID: '733603660030225',
			APP_NAME: 'Zoe Water Dev'
		},
		MAPBOX: {
			ID: 'jtanori.j9ab13k4',
			TOKEN: 'pk.eyJ1IjoianRhbm9yaSIsImEiOiItaTAtRGZjIn0.KY5t660Lp8nPlAEOcCP_LQ'
		},
		GOOGLE: {
			MAPS: {
				API_KEY: 'AIzaSyDrn-K18_6y9j9Vc-HzEO0jpzURmDwdaNg'
			}
		},
		CAMERA: {
			DEFAULT: {
				quality: 80,
				allowEdit: true,
				encodingType: Camera.EncodingType.JPEG,
				destinationType: Camera.DestinationType.DATA_URL,
				targetWidth: 600,
				targetHeight: 600
			}
		},
		GEO: {
			DEFAULT: { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true },
			DEFAULT_CENTER: {lat: 23.634501, lng: -102.552784},
			DEFAULT_ZOOM: 6
		}
	};
});