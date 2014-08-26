/* globals define, _, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var template = require('http://localhost/javascripts/templates/about.js');

	var Index = Controller.extend({
		id: 'about-page',
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

			steroids.view.navigationBar.update({
				title: '¿Que es Zoé Water?',
				buttons: {
					left: [leftButton]
				}
			});
			steroids.view.navigationBar.show();

			return this.render();
		}
	});

	return {
		Index: Index
	};
});