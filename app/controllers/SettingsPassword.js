/* globals define, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		id: 'settings-password-page',
		template: require('http://localhost/javascripts/templates/settings_password.js'),
		events: {
			'click .back-button': 'back'
		},
		title: 'Cambiar Password',
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
			if(event && event.target && (event.target.webview.id === 'settingsPasswordView')){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
	});
});