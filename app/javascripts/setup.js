/* global define */
define(
	'setup',
	[
		'underscore',
		'backbone',
		'parse',
		'config',
		'user'
	],
	function(_, Backbone, Parse, config, User){
		'use strict';

		// Set the views' default backround
		//steroids.view.setBackgroundColor('#33465d');
		//Get user instance
		window.User = User;
		//Initialize parse
		Parse.initialize(config.PARSE.ID, config.PARSE.JSKEY);
	}
);