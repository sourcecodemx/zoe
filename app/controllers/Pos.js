/* globals define, _, L, steroids */
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

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/pointer.png';
			rightButton.onTap = this.onRightButton.bind(this);

			steroids.view.navigationBar.update({
				title: 'Puntos de Venta',
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

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