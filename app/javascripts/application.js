/* globals require, define, forge */
require.config({
	paths: {
		//Core libraries
		aspect:      '../components/aspect.js/src/aspect',
		backbone:    '../components/backbone/backbone',
		functional:  '../components/aspect.js/src/functional',
		jquery:      '../components/jquery/dist/jquery.min',
		underscore:  '../components/lodash/dist/lodash.min',
		parse:       '../components/parse-1.2.19.min/index',
		pusher:      '../components/pusher/dist/pusher.min',
		sha3:        '../components/cryptojslib/rollups/sha3',
		hammerjs:    '../components/hammerjs/hammer.min',
		jqueryhammer:'../components/jquery-hammerjs/jquery.hammer',
		async:       '../components/requirejs-plugins/src/async',

		templates:   '../javascripts/templates',
		models:      '../models',
		collections: '../collections',
		jade:        '../javascripts/templates/jade',
		setup:       '../javascripts/setup',
		mixins:      '../javascripts/mixins',
		polyfill:    '../javascripts/polyfill',
		user:        '../javascripts/user',

		//Base classes
		Detachable:   '../controllers/core/Detachable',
		Controller:   '../controllers/core/Controller',
		Modal:        '../controllers/core/Modal',
		Root:         '../controllers/core/Root',
		HTMLModal:    '../ui/Modal',
		ShareModal:   '../ui/ShareModal',
		Router:       '../javascripts/Router',
		Redirect:     '../javascripts/Redirect',

		//Pages
		About:        '../controllers/About',
		Auth :        '../controllers/Auth',
		AuthForgot:   '../controllers/AuthForgot',
		AuthPassword: '../controllers/AuthPassword',
		AuthLogin:    '../controllers/AuthLogin',
		AuthSignup:   '../controllers/AuthSignup',
		AuthWeight:   '../controllers/AuthWeight',
		Blog:         '../controllers/Blog',
		BlogEntry:    '../controllers/BlogEntry',
		Gallery:      '../controllers/Gallery',
		GalleryPhoto: '../controllers/GalleryPhoto',
		Home:         '../controllers/Home',
		Pos:          '../controllers/Pos',
		Premier:      '../controllers/Premier',
		PremierInformation: '../controllers/PremierInformation',
		Settings:            '../controllers/Settings',
		SettingsEmail:       '../controllers/SettingsEmail',
		SettingsName:        '../controllers/SettingsName',
		SettingsPassword:    '../controllers/SettingsPassword',
		SettingsConsumption: '../controllers/SettingsConsumption',
		Stats:        '../controllers/Stats',
		Store:        '../controllers/Store',
		TOS:          '../controllers/TOS',
		Header:       '../controllers/Header'
	},
	shim: {
		aspect: {
			deps: ['functional'],
			exports: 'aspect'
		},
		backbone: {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		jquery: {
			exports: '$'
		},
		jqueryhammer: {
			deps: ['hammerjs']
		},
		underscore: {
			exports: '_'
		},
		mixins: {
			deps: ['underscore']
		},
		parse: {
			exports: 'Parse'
		},
		setup: {
			deps: ['parse']
		},
		Router: {
			deps: ['backbone', 'parse', 'config', 'setup']
		}
	}
});

// convert Google Maps into an AMD module
define('gmaps', ['async!http://maps.googleapis.com/maps/api/js?key=AIzaSyA3NJBfy8jSTRtqab54gmzqiCaWzsB6Le4&libraries=geometry'],
function(){
	'use strict';
    // return the gmaps namespace for brevity
    return window.google.maps;
});

//Main require
require(
	['setup', 'Router'],
	function(setup, Router){
		'use strict';
		
		try{
			window.App = new Router();

			var onPush = function(){
				forge.parse.setBadgeNumber(0);
			};
			var onPushError = function(){
			};
			forge.event.messagePushed.addListener(onPush, onPushError);
		}catch(e){
			forge.logging.critical(e, e.stack, e.message);
		}
	}
);