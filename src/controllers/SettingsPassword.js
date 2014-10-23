/* globals define, User, forge  */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'settings-password-page',
		template: require('templates/settings_password'),
		title: 'Cambiar Contraseña',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
			
			this.render();
		},
		onRender: function(){
			this.dom = {
				password: this.$el.find('#password'),
				passwordConfirmation: this.$el.find('#passwordConfirmation'),
				content: this.$el.find('.page-content')
			};
		},
		onShow: function(){
			this.setupButtons();
			this.bounceInRight();
		},
		hide: function(){
			this.bounceOutRight();
			this.trigger('hide');
		},
		setupButtons: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));
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
				User.current()
					.save('password', password)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu contraseña ha sido actualizada.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});