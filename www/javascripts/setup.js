/* global define, steroids */
define(
	'setup',
	[
		'underscore',
		'parse',
		'config',
		'user'
	],
	function(_, Parse, config){
		'use strict';

		// Set the views' default backround
		steroids.view.setBackgroundColor('#33465d');
		//Initialize Parse
		Parse.initialize(config.PARSE.ID, config.PARSE.JSKEY);
	}
);