/* global define, Parse */
define(function(){
	'use strict';
	return Parse.Object.extend({
		className: 'File',
		initialize: function(){
			console.log('initialize file model');
		}
	});
});