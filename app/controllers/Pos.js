/* globals define, _, L */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var template = require('http://localhost/javascripts/templates/pos.js');
	var config = require('config');

	var Index = Controller.extend({
		id: 'pos-page',
		template: template,
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {

			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			return this.render();
		},
		onRender: function(){
			//Call base method
			Controller.prototype.onRender.call(this);
			//Create map
			this.dom.map = this.$el.find('#map');
			this.map = L.mapbox.map(
				this.dom.map[0],
				config.MAPBOX.ID,
				{
					zoomControl: false,
					attributionControl: false,
					accessToken: config.MAPBOX.TOKEN,
					updateWhenIdle:false
				}
			);
		}
	});

	return {
		Index: Index
	};
});