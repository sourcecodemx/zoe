/* globals define, steroids, forge  */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'settings-password-page',
		template: require('templates/settings_password'),
		events: {
			'click .back-button': 'back'
		},
		title: 'Cambiar Contraseña',
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

				if(!this.online){
					this.offlineError();
					return;
				}

				var password = this.dom.password.val();
				var confirmation = this.dom.passwordConfirmation.val();

				if(!password || !confirmation){
					throw new Error('Por favor introduce tu nueva contraseña y su confirmacion.');
				}else if(password !== confirmation){
					throw new Error('La contraseña no parece conincidir con la confirmacion.');
				}

				forge.notification.showLoading('Guardando');
				window.postMessage({message: 'user:password:save', password: password});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu contraseña ha sido actualizada.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
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