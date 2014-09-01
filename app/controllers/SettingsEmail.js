/* globals define, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	
	return Controller.extend({
		id: 'settings-email-page',
		template: require('http://localhost/javascripts/templates/settings_email.js'),
		title: 'Cambiar Correo',
		events: {
			'click .back-button': 'back'
		},
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
			if(event && event.target && (event.target.webview.id === 'settingsEmailView')){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
	});
});