/* globals define, _ */
define(function(require){
	'use strict';

	var Controller = require('Root');

	return Controller.extend({
		id: 'premier-page',
		template: require('templates/premier'),
		title: 'Zoé Water Premier',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #information': 'info'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			return this.render();
		},
		info: function(){
			if(!this.online){
				this.onError(null, {message: 'Es necesario contar con una conexion a internet para poder pedir informacion.'});
				return;
			}
			//TODO: Open premier information view
		}
	});
});