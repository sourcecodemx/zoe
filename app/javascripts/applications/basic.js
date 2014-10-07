/* globals require, steroids */
require.config({
	paths: {
		jade:        'javascripts/templates/jade',
		jquery:      'components/jquery/dist/jquery.min'
	}
});

//Main require
require(
	['jade', 'jquery'],
	function(){
		'use strict';
		//Set background color
		steroids.view.setBackgroundColor('#33465d');
		//Notify parent window that we're ready to rumble
		window.dispatchEvent(window.setupEvent);
	}
);