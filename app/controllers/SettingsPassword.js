/* globals define, steroids, ActivityIndicator  */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		id: 'settings-password-page',
		template: require('http://localhost/javascripts/templates/settings_password.js'),
		events: {
			'click .back-button': 'back'
		},
		title: 'Cambiar Contrasena',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

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
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		onRender: function(){
			this.dom = {
				password: this.$el.find('#password'),
				passwordConfirmation: this.$el.find('#passwordConfirmation')
			};
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var password = this.dom.password.val();
				var confirmation = this.dom.passwordConfirmation.val();

				if(!password || !confirmation){
					throw new Error('Por favor introduce tu nueva contrasena y su confirmacion.');
				}else if(password !== confirmation){
					throw new Error('La contrasena no parece conincidir con la confirmacion.');
				}

				ActivityIndicator.show('Guardando');
				window.postMessage({message: 'user:password:save', password: password});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			ActivityIndicator.hide();
			ActivityIndicator.show('Tu contrasena ha sido actualizada.');
			setTimeout(ActivityIndicator.hide.bind(window), 2000);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:password:success':
				this.onSuccess();
				break;
			case 'user:password:error':
				this.onError(null, event.data.error);
			}
		}
	});
});