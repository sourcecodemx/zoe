/* globals define, steroids, Zoe, forge  */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var config = require('config');
	
	return Controller.extend({
		id: 'settings-email-page',
		template: require('templates/settings_email'),
		title: 'Cambiar Correo',
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

			var user = Zoe.storage.getItem('Parse/' + config.PARSE.ID + '/currentUser');
			if(user){
				this.data.email = user.email;
			}

			this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsEmailView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		onRender: function(){
			this.dom = {
				email: this.$el.find('#email')
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

				var email = this.dom.email.val();

				if(!email || !email.length){
					throw new Error('Por favor introduce to correo electronico.');
				}else if(email === this.data.email){
					throw new Error('Ese es tu correo actual, no hay necesidad de guardarlo de nuevo.');
				}

				forge.notification.showLoading('Guardando');
				window.postMessage({message: 'user:email:save', email: email});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu correo ha sido actualizado.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:email:success':
				this.onSuccess();
				break;
			case 'user:email:error':
				this.onError(null, event.data.error);
			}
		}
	});
});