/* globals define, steroids, _, ActivityIndicator  */
define(function(require){
	'use strict';

	var Controller      = require('http://localhost/controllers/core/Controller.js');

	//Require crypto library
	require('http://localhost/components/cryptojslib/rollups/sha3.js');
	/**
	* Login Controller
	* 
	* Takes care of authenticating users with a Parse account
	*/
	return Controller.extend({
		id: 'login-page',
		template: require('http://localhost/javascripts/templates/login.js'),
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

				ActivityIndicator.show('Autenticando');
				window.postMessage({message: 'user:login', user: {username: u, password: p}});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			ActivityIndicator.hide();
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