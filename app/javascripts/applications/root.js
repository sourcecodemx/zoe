/* globals require */
require.config({
	paths: {
		//Core libraries
		aspect:      '../components/aspect.js/src/aspect',
		backbone:    '../components/backbone/backbone',
		functional:  '../components/aspect.js/src/functional',
		jquery:      '../components/jquery/dist/jquery.min',
		underscore:  '../components/lodash/dist/lodash.min',
		progressCircle: '../javascripts/progressCircle',
		offline:     '../javascripts/offline',

		templates:   'javascripts/templates',
		jade:        'javascripts/templates/jade',
		mixins:      '../javascripts/mixins',
		polyfill:    '../javascripts/polyfill',
		config:      '../javascripts/config'
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
		//Notify parent window that we're ready to rumble
		window.dispatchEvent(window.setupEvent);
	}
);