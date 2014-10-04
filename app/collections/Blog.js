/* globals define, Parse */
define(['http://localhost/models/Entry.js', 'config'], function(Model, config){
	'use strict';
	
	return Parse.Collection.extend({
		model: Model,
		query: (new Parse.Query(Model)).descending('createdAt').limit(config.BLOG.LIMIT)
	});
});