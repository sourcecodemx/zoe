/* globals define, steroids, _ */
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

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ' '
			});
			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
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

				var u = this.dom.username.val();
				var p = this.dom.password.val();

				if(_.isEmpty(u) || _.isEmpty(p)){
					throw new Error('Por favor ingresa tus credenciales.');
				}

				window.showLoading('Autenticando');
				window.postMessage({message: 'user:save:login', user: {username: u, password: p}});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			_.delay(function(){console.log('on login success');}, 30000);
			//Go back to the top most view
			steroids.layers.popAll();
			//Hide loading indicator
			window.hideLoading();
			//Reset form
			this.reset();
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:saved:login':
				this.onSuccess();
				break;
			case 'user:saved:login:error':
				this.onError(null, event.data.error);
			}
		}
	});
});