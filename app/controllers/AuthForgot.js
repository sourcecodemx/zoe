/* globals define, steroids, _, forge */
define(function(require){
	'use strict';

	var Controller      = require('Controller');

	/**
	* Signup Controller
	* 
	* Takes care of capturing the username and email
	* saves data to localstorage and move the user to the next
	* screen if eveything is in place
	*/
	return Controller.extend({
		id: 'auth-forgot-password-page',
		template: require('templates/auth_forgot_password'),
		events: {
			'submit form': 'submit'
		},
		title: 'Recuperar Contraseña',
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

			return this.render();
		},
		onRender: function(){
			this.dom = {
				email: this.$el.find('#email'),
				form: this.$el.find('form')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'authForgotView')){
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

				if(!this.online){
					this.offlineError();
					return;
				}

				var email = this.dom.email.val();

				if(_.isEmpty(email)){
					throw new Error('Por favor ingresa tus correo electronico.');
				}

				forge.notification.showLoading('Enviando');
				window.postMessage({message: 'user:forgot:request', email: email});
			}catch(e){
				Controller.prototype.onError.call(this, null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.alert('Listo!', 'Se ha enviado un mensaje de recuperacion de contraseña a la direccion de correo especificada.');
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'user:forgot:success':
				this.onSuccess();
				break;
			case 'user:forgot:error':
				this.onError(null, data.error);
				break;
			}
		}
	});
});