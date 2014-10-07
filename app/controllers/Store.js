/* globals define, _ */
define(function(require){
	'use strict';

	var Controller = require('Root');

	return Controller.extend({
		id: 'store-page',
		template: require('templates/store'),
		title: 'Tienda',
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
});