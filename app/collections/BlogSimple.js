/* globals define */
define(['backbone'], function(Backbone){
	'use strict';

	var Entry = Backbone.Model.extend({
		initialize: function(){
			console.log('initialize entry model');
		}
	});
	
	return Backbone.Collection.extend({
		model: Entry,
		url: 'http://saludalcalina.com/feed/',
		//url: '',
		initialize: function(){
			console.log('initialize blog collection');
		}
	});
});