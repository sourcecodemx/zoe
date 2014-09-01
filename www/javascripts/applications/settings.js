/* globals require */
require.config({
	paths: {
		//Core libraries
		aspect:      'http://localhost/components/aspect.js/src/aspect',
		backbone:    'http://localhost/components/backbone/backbone',
		functional:  'http://localhost/components/aspect.js/src/functional',
		jquery:      'http://localhost/components/jquery/dist/jquery.min',
		underscore:  'http://localhost/components/lodash/dist/lodash.min',

		templates:   'http://localhost/javascripts/templates',
		jade:        'http://localhost/javascripts/templates/jade',
		mixins:      'http://localhost/javascripts/mixins',
		polyfill:    'http://localhost/javascripts/polyfill',
		spinner:     'http://localhost/javascripts/spinner',

		Settings:            'http://localhost/controllers/Settings',
		'Settings.Email':    'http://localhost/controllers/SettingsEmail',
		'Settings.Name':     'http://localhost/controllers/SettingsName',
		'Settings.Password': 'http://localhost/controllers/SettingsPassword',
		'Settings.Weight':   'http://localhost/controllers/SettingsWeight',
		
		'Auth.Weight':       'http://localhost/controllers/AuthWeight'
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
		}
	}
});

//Main require
require(
	['aspect', 'underscore', 'jquery', 'backbone', 'spinner', 'polyfill'],
	function(){
		'use strict';

		//Notify parent window that we're ready to rumble
		window.dispatchEvent(window.setupEvent);
	}
);