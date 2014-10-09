/* globals define, _, forge, Parse, User */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'auth-forgot-password-page',
		template: require('templates/auth_forgot_password'),
		title: 'Recuperar Contraseña',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		},
		update: function(days){
			this.collection.reset(days);

			return this;
		},
		hide: function(){
			this.bounceOutDown();
			this.trigger('hide');
			_.delay(this._detach.bind(this), 1000);
		},
		onRender: function(){
			this.dom.content = this.$el.find('.page-content');
			this.dom.email = this.$el.find('#forgotEmail');
		},
		onShow: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				icon: 'images/close@2x.png',
				position: 'left',
				prerendered: true
			}, this.hide.bind(this));

			this.bounceInUp();
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
					throw new Error('Por favor ingresa tu correo electronico.');
				}

				forge.notification.showLoading('Enviando');

				//Send forgot password email
				var forgotModel = Parse.Object.extend({className: '_User'});
				var forgotQuery = new Parse.Query(forgotModel);

				//Check if user is not a FB user
				forgotQuery.equalTo('email', email);
				forgotQuery.first({
					success: function(user){
						if(user && user.get('facebook')){
							this.onError(null, {message: 'Ese correo esta registrado como usuario de Facebook, puedes iniciar sesion automaticamente desde la pantalla de inicio usando el boton de Facebook.'});
						}else{
							User.requestPasswordReset(email, {
								success: this.onSuccess.bind(this),
								error: function(error) {
									switch(error.code){
									case 205:
										error.message = 'No existe usuario para el correo ' + email;
										break;
									}

									this.onError(null, error);
								}.bind(this)
							});
						}
					}.bind(this),
					error: function(e){
						this.onError(null, e);
					}.bind(this)
				});
			}catch(e){
				Controller.prototype.onError.call(this, null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.alert('Listo!', 'Se ha enviado un mensaje de recuperacion de contraseña a la direccion de correo especificada.');
		}
	});
});