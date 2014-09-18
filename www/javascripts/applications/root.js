/* globals require, steroids */
require.config({
	paths: {
		//Core libraries
		aspect:      'http://localhost/components/aspect.js/src/aspect',
		backbone:    'http://localhost/components/backbone/backbone',
		functional:  'http://localhost/components/aspect.js/src/functional',
		jquery:      'http://localhost/components/jquery/dist/jquery.min',
		underscore:  'http://localhost/components/lodash/dist/lodash.min',
		progressCircle: 'http://localhost/javascripts/progressCircle',
		offline:     'http://localhost/javascripts/offline',

		templates:   'http://localhost/javascripts/templates',
		jade:        'http://localhost/javascripts/templates/jade',
		mixins:      'http://localhost/javascripts/mixins',
		polyfill:    'http://localhost/javascripts/polyfill',
		config:      'http://localhost/javascripts/config'
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
		progressCircle: {
			deps: ['jquery']
		}
	}
});

//Main require
require(
	['underscore', 'jquery', 'backbone', 'aspect', 'polyfill', 'jade', 'config'],
	function(){
		'use strict';
		//Set background color
		steroids.view.setBackgroundColor('#33465d');
		//Notify parent window that we're ready to rumble
		window.dispatchEvent(window.setupEvent);
	}
);