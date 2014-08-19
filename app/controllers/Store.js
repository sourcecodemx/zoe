/* globals define, _ */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var template = require('http://localhost/javascripts/templates/store.js');

	var Index = Controller.extend({
		id: 'store-page',
		template: template,
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {

			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			return this.render();
		}
	});

	return {
		Index: Index
	};
});