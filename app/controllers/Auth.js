/* globals define, steroids, Parse, _, Zoe */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	var Index = Controller.extend({
		id: 'index-page',
		template: require('http://localhost/javascripts/templates/index.js'),
		events: {
			'click #facebookSignup': 'facebook',
			'click #mailSignup':     'signup',
			'click #signin':         'signin'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.signupView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/new.html', id: 'signup'});
			this.loginView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/login.html', id: 'login'});

			return this.render();
		},
		onRender: function(){
			console.log('index controller render complete');
		},
		facebook: function(){
			console.log('facebook signup');
		},
		signup: function(){
			setTimeout(
				function(){
					steroids.layers.push({
						view: this.signupView,
						navigationBar: false
					});
				}.bind(this),
				1
			);
		},
		signin: function(){
			setTimeout(
				function(){
					steroids.layers.push({
						view: this.loginView,
						navigationBar: false
					});
				}.bind(this),
				1
			);
		},
		onClose: function(){
			this.signupView = null;
			this.loginView = null;
		}
	});

	var Signup = Controller.extend({
		id: 'signup-page',
		template: require('http://localhost/javascripts/templates/signup.js'),
		events: {
			'click #tos': 'tos',
			'click .back-button': 'back',
			'submit form': 'submit'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.tosView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/tos.html', id: 'tos'});
			this.signupPasswordView = new steroids.views.WebView({location: 'http://localhost/views/Auth/new_password.html', id: 'signupPassword'});

			window.addEventListener('message', this.onMessage.bind(this));

			return this.render();
		},
		onRender: function(){
			this.dom = {
				username: this.$el.find('#username'),
				email: this.$el.find('#email'),
				form: this.$el.find('form')
			};
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

				//Save items for the next step, will last for 10 minutes
				Zoe.storage.setItem('signup_prefill', data, ((new Date())*1) + 10*60*1000);
				//Take user to the next screen (password setup)
				setTimeout(function(){
					steroids.layers.push({
						view: this.signupPasswordView,
						navigationBar: false
					});
				}.bind(this), 1);
			}catch(e){
				
			}
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'signup':
				this.reset();
				break;
			}
		},
		reset: function(){
			if(this.dom.form){
				this.dom.form.trigger('reset');
			}
		}
	});

	var Signup2 = Signup.extend({
		id: 'signup-password-page',
		template: require('http://localhost/javascripts/templates/signup_password.js'),
		onRender: function(){
			this.dom = {
				password: this.$el.find('#password'),
				passwordConfirmation: this.$el.find('#passwordConfirmation'),
				form: this.$el.find('form')
			};
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var prefilledData = Zoe.storage.getItem('signup_prefill');
				var password = this.dom.password.val();
				var confirmation = this.dom.passwordConfirmation.val();
				var user, cx;

				this.$el.find(':focus').trigger('blur');

				if(!_.isEmpty(prefilledData) && !_.isEmpty(password) && !_.isEmpty(confirmation) && (password === confirmation)){
					//Add password to the object
					prefilledData.password = password;
					
					//Context passed to timeout function
					cx = {s:this.onSuccess.bind(this), e: this.onError.bind(this), data: prefilledData};

					//Let's use a timeout to prevent the loading dialog to be cut off
					setTimeout(function(){
						window.showLoading('Guardando...');
						
						//start creating user
						user = new Parse.User();
						user.set(this.data);

						//Atempt saving the user
						user.signUp(
							null,
							{
								success: this.s,
								error: this.e
							}
						);
					}.bind(cx), 800);
				}else{
					if(_.isEmpty(prefilledData)){

						throw new Error('NO_PREFILLED_DATA');

					}else if(_.isEmpty(password)||_.isEmpty(confirmation)){

						throw new Error('INVALIDA_DATA');

					}else if(password !== confirmation){

						throw new Error('UNMATCHING_DATA');

					}
				}
			}catch(e){
				console.log(e.message);
			}finally{

			}
		},
		onSuccess: function(){
			//Remove prefilled data
			Zoe.storage.removeItem('prefilled_data');

			window.postMessage({
				message: 'signup',
				token: Parse.User.current()._sessionToken
			});

			//Create weight view
			this.weightView = new steroids.views.WebView({
				location: 'http://localhost/views/Settings/weight.html',
				id: 'weightView'
			});
			//Preload weight view
			this.weightView.preload();

			setTimeout(function(){
				//Push weight view
				steroids.layers.push({
					view: this.weightView,
					navigationBar: false
				});
				//Hide loading indicator
				window.hideLoading();
			}.bind(this), 500);
		},
		onError: function(model, error){
			window.hideLoading();

			setTimeout(function(){
				navigator.notification.alert(this.message, $.noop, 'Ups!');
			}.bind(error), 1);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'signup':
				this.reset();
				break;
			case 'signup_weight':
				if(this.weightView){
					this.weightView.unload();
				}
				break;
			}
		},
		reset: function(){
			if(this.dom.form){
				this.dom.form.trigger('reset');
			}
		}
	});

	var Login = Controller.extend({
		id: 'login-page',
		template: require('http://localhost/javascripts/templates/login.js'),
		events: {
			'click .back-button': 'back',
			'submit form': 'submit'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

			return this.render();
		},
		onRender: function(){
			this.dom = {
				username: this.$el.find('#username'),
				password: this.$el.find('#password'),
				form: this.$el.find('form')
			};
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var u = this.dom.username.val();
				var p = this.dom.password.val();
				var cx;

				this.$el.find(':focus').trigger('blur');

				if(!_.isEmpty(u) && !_.isEmpty(p)){

					cx = {s: this.onSuccess.bind(this), e: this.onError.bind(this), u: u, p: p};

					setTimeout(function(){

						window.showLoading('Validando...');

						Parse.User.logIn(
							this.u, this.p,
							{
								success: this.s,
								error: this.e
							}
						);
					}.bind(cx), 800);
				}
			}catch(e){
				console.log(e, e.message, e.stack);
			}
		},
		onSuccess: function(){
			//Broadcast login message
			window.postMessage({
				message: 'login',
				token: Parse.User.current()._sessionToken
			});
			//Reset form
			this.reset();

			setTimeout(function(){
				//Go back to the top most view
				steroids.layers.popAll();
				//Hide loading indicator
				window.hideLoading();
			}, 500);
		},
		onError: function(model, error){
			window.hideLoading();

			setTimeout(function(){
				navigator.notification.alert(this.message, $.noop, 'Ups!');
			}.bind(error), 1);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'login':
				
				break;
			}
		},
		reset: function(){
			if(this.dom.form){
				this.dom.form.trigger('reset');
			}
		}
	});

	var TOS = Controller.extend({
		id: 'tos-page',
		template: require('http://localhost/javascripts/templates/tos.js'),
		events: {
			'click .hide-modal': 'hideModal'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			return this.render();
		},
		onRender: function(){
			console.log('tos controller render complete');
		},
		hideModal: function(){
			steroids.modal.hide();
		}
	});

	return {
		Index: Index,
		signup: {
			Credentials: Signup,
			Password: Signup2
		},
		Login: Login,
		TOS: TOS
	};
});