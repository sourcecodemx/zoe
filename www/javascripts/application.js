/* globals require */
require.config({
	paths: {
		//Core libraries
		aspect:      'http://localhost/components/aspect.js/src/aspect',
		backbone:    'http://localhost/components/backbone/backbone',
		functional:  'http://localhost/components/aspect.js/src/functional',
		jquery:      'http://localhost/components/jquery/dist/jquery.min',
		underscore:  'http://localhost/components/lodash/dist/lodash.min',
		parse:       'http://localhost/components/parse-1.2.19.min/index',
		pusher:      'http://localhost/components/pusher/dist/pusher.min',

		templates:   'http://localhost/javascripts/templates',
		jade:        'http://localhost/javascripts/templates/jade',
		setup:       'http://localhost/javascripts/setup',
		mixins:      'http://localhost/javascripts/mixins',
		polyfill:    'http://localhost/javascripts/polyfill',
		user:        'http://localhost/javascripts/user',

		//MVC
		//TODO: Setup modules for MVC blocks
		Auth :        'http://localhost/controllers/Auth',
		Home :        'http://localhost/controllers/Home',
		TOS:          'http://localhost/controllers/TOS',
		APIController:'http://localhost/javascripts/APIController'
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