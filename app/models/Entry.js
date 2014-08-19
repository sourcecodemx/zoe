/* globals define, Backbone */
define(function(){
	'use strict';
	
	return Backbone.Model.extend({
		initialize: function(){
			console.log('initialize entry model');
		}
	});
});