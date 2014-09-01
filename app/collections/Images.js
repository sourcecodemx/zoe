/* globals define, Parse */
define(['http://localhost/models/File.js'], function(Model){
	'use strict';
	
	return Parse.Collection.extend({
		model: Model,
		query: (new Parse.Query(Model)).descending('createdAt').limit(24),
		prepend: function(model){
			this.add(model, {silent: true});
			this.trigger('prepend', model);
		}
	});
});