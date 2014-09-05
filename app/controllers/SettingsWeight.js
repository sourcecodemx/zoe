/* globals define, steroids, Zoe, ActivityIndicator */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var AuthWeight = require('http://localhost/controllers/AuthWeight.js');
	var config = require('config');

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

			//Get weight
			var user = Zoe.storage.getItem('Parse/' + config.PARSE.ID + '/currentUser');
			if(user){
				this.data.weight = user.weight || 0;
			}

			this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsWeightView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var weight = parseInt(this.dom.weight.val(), 10);

				if(!weight){
					throw new Error('Por favor introduce tu peso.');
				}else if(weight<=40){
					throw new Error('El peso no puede ser menor de 40.');
				}else if(weight === this.data.weight){
					throw new Error('Ese es tu peso actual, no hay necesidad de guardarlo de nuevo.');
				}

				ActivityIndicator.show('Guardando');
				window.postMessage({message: 'user:weight:save', weight: weight});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			ActivityIndicator.hide();
			ActivityIndicator.show('Tu peso ha sido actualizado.');
			setTimeout(ActivityIndicator.hide.bind(window), 2000);
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