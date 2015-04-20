/* global define, device */
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
		//Get user instance
		window.User = User;
		//Initialize parse
		Parse.initialize(config.PARSE.ID, config.PARSE.JSKEY);

		switch(device.platform){
		case 'iOS': $('body').addClass('platform-ios platform-cordova'); break;
		}
	}
);