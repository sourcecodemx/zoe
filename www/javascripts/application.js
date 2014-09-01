/* globals require */
require.config({
	paths: {
		//Core libraries
		aspect:      'http://localhost/components/aspect.js/src/aspect',
		backbone:    'http://localhost/components/backbone/backbone',
		functional:  'http://localhost/components/aspect.js/src/functional',
		//gsap:        'http://localhost/components/gsap/src/minified/TweenLite.min',
		jquery:      'http://localhost/components/jquery/dist/jquery.min',
		jquerygsap:  'http://localhost/components/gsap/src/minified/jquery.gsap.min',
		underscore:  'http://localhost/components/lodash/dist/lodash.min',
		parse:       'http://localhost/components/parse-1.2.19.min/index',
		//timeline:    'http://localhost/components/gsap/src/minified/TimelineLite.min',
		//timelineCSS: 'http://localhost/components/gsap/src/minified/plugins/CSSPlugin.min',

		templates:   'http://localhost/javascripts/templates',
		jade:        'http://localhost/javascripts/templates/jade',
		setup:       'http://localhost/javascripts/setup',
		mixins:      'http://localhost/javascripts/mixins',
		polyfill:    'http://localhost/javascripts/polyfill',
		spinner:     'http://localhost/javascripts/spinner',

		//MVC
		//TODO: Setup modules for MVC blocks
		Auth :              'http://localhost/controllers/Auth',
		'Auth.Login':       'http://localhost/controllers/AuthLogin',
		'Auth.Signup':      'http://localhost/controllers/AuthSignup',
		'Auth.Password':    'http://localhost/controllers/AuthPassword',
		'Auth.Weight':      'http://localhost/controllers/AuthWeight',

		Settings:            'http://localhost/controllers/Settings',
		'Settings.Email':    'http://localhost/controllers/SettingsEmail',
		'Settings.Name':     'http://localhost/controllers/SettingsName',
		'Settings.Password': 'http://localhost/controllers/SettingsPassword',
		'Settings.Weight':   'http://localhost/controllers/SettingsWeight',

		Home :    'http://localhost/controllers/Home',
		TOS:      'http://localhost/controllers/TOS',
		SettingsController: 'http://localhost/controllers/Settings',
		GalleryController:  'http://localhost/controllers/Gallery',
		BlogController:     'http://localhost/controllers/Blog',
		PremierController:  'http://localhost/controllers/Premier',
		PosController:      'http://localhost/controllers/Pos',
		StatsController:    'http://localhost/controllers/Stats',
		AboutController:    'http://localhost/controllers/About',
		APIController:      'http://localhost/javascripts/APIController'
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
		},/*
		jquerygsap: {
			deps: ['jquery', 'gsap']
		},*/
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
		}
	}
});

//Main require
require(
	['setup'],
	function(){
		'use strict';

		//Notify parent window that we're ready to rumble
		window.dispatchEvent(window.setupEvent);
	}
);