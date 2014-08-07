/* globals require */
require.config({
	paths: {
		//Core libraries
		aspect:      'http://localhost/components/aspect.js/src/aspect',
		backbone:    'http://localhost/components/backbone/backbone',
		functional:  'http://localhost/components/aspect.js/src/functional',
		gsap:        'http://localhost/components/gsap/src/minified/TweenLite.min',
		hammerjs:    'http://localhost/components/hammerjs/hammer.min',
		jquery:      'http://localhost/components/jquery/dist/jquery.min',
		jquerygsap:  'http://localhost/components/gsap/src/minified/jquery.gsap.min',
		jqueryhammer:'http://localhost/components/jquery-hammerjs/jquery.hammer.min',
		underscore:  'http://localhost/components/lodash/dist/lodash.min',
		parse:       'http://localhost/components/parse-1.2.19.min/index',
		timeline:    'http://localhost/components/gsap/src/minified/TimelineLite.min',
		timelineCSS: 'http://localhost/components/gsap/src/minified/plugins/CSSPlugin.min',

		templates:   'http://localhost/javascripts/templates',
		jade:        'http://localhost/javascripts/templates/jade',
		setup:       'http://localhost/javascripts/setup',

		//MVC
		//TODO: Setup modules for MVC blocks
		AuthController :    'http://localhost/controllers/Auth',
		HomeController :    'http://localhost/controllers/Home',
		SettingsController: 'http://localhost/controllers/Settings'
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
		jquerygsap: {
			deps: ['jquery', 'gsap']
		},
		jqueryhammer: {
			deps: ['jquery', 'hammerjs']
		},
		underscore: {
			exports: '_'
		},
		parse: {
			exports: 'Parse',
			deps: ['backbone']
		},
		setup: {
			deps: ['parse']
		},
		controllers: {
			deps: ['backbone', 'parse']
		}
	}
});

//Main require
require(
	['setup', 'parse'],
	function(){
		'use strict';

		//Notify parent window that we're ready to rumble
		window.dispatchEvent(window.setupEvent);
	}
);