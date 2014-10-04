/* globals define, Backbone */
define(function(){
	'use strict';
	
	var Img = Backbone.Model.extend({
		idAttribute: 'objectId'
	});

	return Backbone.Collection.extend({
		model: Img,
		url: '',
		prepend: function(model){
			model = this.add(model, {silent: true});
			this.trigger('prepend', model);
		}
	});
});