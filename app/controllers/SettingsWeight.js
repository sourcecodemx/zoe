/* globals define, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var AuthWeight = require('http://localhost/controllers/AuthWeight.js');

	return AuthWeight.extend({
		id: 'settings-weight-page',
		template: require('http://localhost/javascripts/templates/settings_weight.js'),
		title: 'Cambiar Peso',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});

			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			this.messageListener();
			this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsWeightView')){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		back: function(){
			setTimeout(function(){
				steroids.layers.pop();
			}, 1);
		},
		onSuccess: function(){
			window.showLoading('Tu peso ha sido cambiado.');
			setTimeout(window.hideLoading.bind(window), 2000);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:weight:success':
				this.onSuccess();
				break;
			case 'user:weight:error':
				this.onError(null, event.data.error);
			}
		}
	});
});