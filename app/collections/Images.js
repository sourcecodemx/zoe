/* globals define, Parse */
define(['http://localhost/models/File.js', 'config'], function(Model, config){
	'use strict';
	
	return Parse.Collection.extend({
		model: Model,
		query: (new Parse.Query(Model)).descending('createdAt').limit(config.GALLERY.LIMIT),
		prepend: function(model){
			this.add(model, {silent: true});
			this.trigger('prepend', model);
		}
	});
});