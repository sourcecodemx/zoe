/* globals require */
require.config({
	paths: {
		//Core libraries
		aspect:      'http://localhost/components/aspect.js/src/aspect',
		backbone:    'http://localhost/components/backbone/backbone',
		functional:  'http://localhost/components/aspect.js/src/functional',
		hammerjs:    'http://localhost/components/hammerjs/hammer.min',
		jqueryhammer:'http://localhost/components/jquery-hammerjs/jquery.hammer.min',
		underscore:  'http://localhost/components/lodash/dist/lodash.min',
		parse:       'http://localhost/components/parse-1.2.19.min/index',

		templates:   'http://localhost/javascripts/templates',
		jade:        'http://localhost/javascripts/templates/jade',
		setup:       'http://localhost/javascripts/setup',

		//MVC
		//TODO: Setup modules for MVC blocks
		AuthController : 'http://localhost/controllers/Auth',
		HomeController : 'http://localhost/controllers/Home'
	},
	shim: {
		aspect: {
			deps: ['functional'],
			exports: 'aspect'
		},
		backbone: {
			deps: ['underscore'],
			exports: 'Backbone'
		},
		jqueryhammer: {
			deps: ['hammerjs']
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