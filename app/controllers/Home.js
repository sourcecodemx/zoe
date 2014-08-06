/* globals define */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var template = require('http://localhost/javascripts/templates/home.js');

	var Index = Controller.extend({
		id: 'home',
		template: template,
		initialize: function(){
			Controller.prototype.initialize.call(this, arguments);

			return this.render();
		}
	});

	return {
		Index: Index
	};
});