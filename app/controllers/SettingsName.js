/* globals define, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		id: 'settings-name-page',
		template: require('http://localhost/javascripts/templates/settings_name.js'),
		events: {
			'click .back-button': 'back'
		},
		title: 'Cambiar Nombre',
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
			if(event && event.target && (event.target.webview.id === 'settingsNameView')){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
	});
});