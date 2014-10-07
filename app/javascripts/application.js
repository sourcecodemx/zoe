/* globals require */
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
		infobox:     '../javascripts/infobox',

		templates:   '../javascripts/templates',
		models:      '../models',
		collections: '../collections',
		jade:        '../javascripts/templates/jade',
		setup:       '../javascripts/setup',
		mixins:      '../javascripts/mixins',
		polyfill:    '../javascripts/polyfill',
		user:        '../javascripts/user',

		//Base classes
		APIController:'../javascripts/APIController',
		Detachable:   '../controllers/core/Detachable',
		Controller:   '../controllers/core/Controller',
		Modal:        '../controllers/core/Modal',
		Root:         '../controllers/core/Root',
		HTMLModal:    '../ui/Modal',
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
		Settings:     '../controllers/Settings',
		SettingsEmail: '../controllers/SettingsEmail',
		SettingsName: '../controllers/SettingsName',
		SettingsPassword: '../controllers/SettingsPassword',
		SettingsWeight: '../controllers/SettingsWeight',
		Stats:        '../controllers/Stats',
		Store:        '../controllers/Store',
		TOS:          '../controllers/TOS'
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
		APIController: {
			deps: ['parse']
		},
		Router: {
			deps: ['backbone', 'parse']
		}
	}
});

//Main require
require(
	['setup', 'Router'],
	function(setup, Router){
		'use strict';

		window.App = new Router();
		window.App.start();
	}
);