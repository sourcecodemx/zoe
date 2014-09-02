/* globals define, steroids, Zoe, _ */
define(function(require){
	'use strict';

	var Controller      = require('http://localhost/controllers/core/Controller.js');

	/**
	* Signup Controller
	* 
	* Takes care of capturing the username and email
	* saves data to localstorage and move the user to the next
	* screen if eveything is in place
	*/
	return Controller.extend({
		id: 'signup-page',
		template: require('http://localhost/javascripts/templates/signup.js'),
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
				username: this.$el.find('#username'),
				email: this.$el.find('#email'),
				form: this.$el.find('form')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'authNewView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
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

				var data = {username: this.dom.username.val(), email: this.dom.email.val()};

				if(_.isEmpty(data.username) || _.isEmpty(data.email)){
					throw new Error('Por favor ingresa tus credenciales.');
				}

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