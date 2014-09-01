/* globals define, steroids, _ */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var template = require('http://localhost/javascripts/templates/about.js');

	return Controller.extend({
		id: 'about-page',
		template: template,
		title: '¿Que es Zoé Water?',
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
				title: this.title,
				buttons: {
					left: [leftButton]
				}
			});

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'aboutIndexView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		}
	});
	
});