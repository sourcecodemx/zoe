/* globals define, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var AuthWeight = require('Auth.Weight');

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
			window.hideLoading();
		}
	});
});