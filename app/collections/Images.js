/* globals define, Parse */
define(['http://localhost/models/File.js'], function(Model){
	'use strict';
	
	return Parse.Collection.extend({
		model: Model
	});
});