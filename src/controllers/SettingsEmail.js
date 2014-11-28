/* globals define, User, forge  */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'settings-email-page',
		template: require('templates/settings_email'),
		title: 'Cambiar Correo',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Get username
			this.data.email = User.current().get('email');

			this.render();
		},
		onRender: function(){
			this.dom = {
				email: this.$el.find('#email'),
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

				var email = this.dom.email.val();

				if(!email || !email.length){
					throw new Error('Por favor introduce to correo electronico.');
				}else if(email === this.data.email){
					throw new Error('Ese es tu correo actual, no hay necesidad de guardarlo de nuevo.');
				}

				forge.notification.showLoading('Guardando');
				User.current()
					.save('email', email)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu correo ha sido actualizado.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});