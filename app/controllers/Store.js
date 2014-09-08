/* globals define, steroids, _ */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');

	return Controller.extend({
		id: 'store-page',
		template: require('http://localhost/javascripts/templates/store.js'),
		title: 'Tienda',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {

			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);

			steroids.view.navigationBar.update({
				title: this.title,
				buttons: {
					left: [leftButton]
				}
			});
			steroids.view.navigationBar.show();

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'storeView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		}
	});
});