/* globals define, steroids, _ */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		id: 'settings-page',
		template: require('http://localhost/javascripts/templates/settings.js'),
		title: 'Configuracion',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #signout': 'signout'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});

			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsIndexView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		signout: function(){
			//Broadcast signout message
			window.postMessage({message: 'user:logout'});

			setTimeout(function(){
				//Back to the home page
				steroids.layers.popAll();
			}, 1);
		}
	});
});