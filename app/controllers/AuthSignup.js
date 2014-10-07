/* globals define, steroids, Zoe, _ */
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
		id: 'signup-page',
		template: require('templates/signup'),
		events: {
			'click #tos': 'showView',
			'click .back-button': 'back',
			'submit form': 'submit'
		},
		title: '1. Crear cuenta',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.tosView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/tos.html', id: 'tos'});
			this.signupPasswordView = new steroids.views.WebView({location: 'http://localhost/views/Auth/new_password.html', id: 'signupPassword'});

			this.signupPasswordView.preload();
			
			this.messageListener();
			
			steroids.view.navigationBar.update({
				title: this.title
			});

			return this.render();
		},
		onRender: function(){
			this.dom = {
				username: this.$el.find('#username'),
				email: this.$el.find('#email'),
				form: this.$el.find('form')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'authNewView')){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		tos: function(){
			setTimeout(function(){
				steroids.modal.show(this.tosView);
			}.bind(this), 1);
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

				if(_.isEmpty(this.dom.username) || _.isEmpty(this.dom.email)){
					throw new Error('Por favor ingresa tus credenciales.');
				}

				var data = {username: this.dom.username.val().toLowerCase(), email: this.dom.email.val().toLowerCase()};

				//Save items for the next step, will last for 10 minutes
				Zoe.storage.setItem('signup_prefill', data, ((new Date())*1) + 10*60*1000);
				//Take user to the next screen (password setup)
				setTimeout(function(){
					steroids.layers.push({
						view: this.signupPasswordView
					});
				}.bind(this), 1);
			}catch(e){
				Controller.prototype.onError.call(this, null, e);
			}
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:saved:signup':
				this.reset();
				break;
			}
		}
	});
});