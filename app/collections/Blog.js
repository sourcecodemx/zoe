/* globals define, Backbone */
define(['http://localhost/models/Entry.js'], function(Model){
	'use strict';
	
	return Backbone.Collection.extend({
		model: Model,
		url: 'http://saludalcalina.com/feed/',
		initialize: function(){
			console.log('initialize blog collection');
		}
	});
});