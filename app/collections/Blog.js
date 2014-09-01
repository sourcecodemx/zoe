/* globals define, Parse */
define(['http://localhost/models/Entry.js'], function(Model){
	'use strict';
	
	return Parse.Collection.extend({
		model: Model,
		query: (new Parse.Query(Model)).descending('createdAt').limit(10)
	});
});