/* globals define, steroids, _, forge  */
define(function(require){
	'use strict';

	var Controller      = require('Controller');

	//Require crypto library
	require('sha3');

	/**
	* Login Controller
	* 
	* Takes care of authenticating users with a Parse account
	*/
	return Controller.extend({
		id: 'login-page',
		template: require('templates/login'),
		title: 'Ingresa a tu cuenta',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.messageListener();
			
			steroids.view.navigationBar.update({
				title: this.title
			});

			return this.render();
		},
		onRender: function(){
			this.dom = {
				username: this.$el.find('#username'),
				password: this.$el.find('#password'),
				form: this.$el.find('form')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'authLoginView')){
				steroids.view.navigationBar.update({
					title: this.title
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

				var u = this.dom.username.val();
				var p = this.dom.password.val();

				if(_.isEmpty(u) || _.isEmpty(p)){
					throw new Error('Por favor ingresa tus credenciales.');
				}

				forge.notification.showLoading('Autenticando');
				window.postMessage({message: 'user:login', user: {username: u.toLowerCase(), password: p}});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			//Go back to the top most view
			steroids.layers.popAll();
			//Hide loading indicator
			//Reset form
			this.reset();
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:login:success':
				this.onSuccess();
				break;
			case 'user:login:error':
				this.onError(null, event.data.error);
			}
		}
	});
});