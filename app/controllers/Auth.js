/* globals define, steroids, Parse, _, Zoe, facebookConnectPlugin */
define(function(require){
	'use strict';

	var Controller      = require('http://localhost/controllers/core/Controller.js');
	var Modal           = require('http://localhost/controllers/core/Modal.js');
	var config          = require('config');

	/**
	* Index Controller
	* 
	* Provides authentication options:
	* - Facebook
	* - Login (Parse)
	* - Signup
	*/
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
		facebook: function(){
			facebookConnectPlugin.login(
				config.FB.DEFAULT_PERMISSION,
				this.onFBSignup.bind(this),
				this.onFBError.bind(this)
			);
		},
		onFBSignup: function(){
			console.log('fbsignup', arguments);
		},
		onFBError: function(e){
			console.log('fberror', e, typeof e);
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

	/**
	* Signup Controller
	* 
	* Takes care of capturing the username and email
	* saves data to localstorage and move the user to the next
	* screen if eveything is in place
	*/
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
		}
	});

	/**
	* Signup2 Controller
	* 
	* Takes care of capturing password and password confirmation
	* tries to create a Parse user, if everything goes smooth
	* takes the user to the weight setup screen
	*/
	var SignupPassword = Signup.extend({
		id: 'signup-password-page',
		template: require('http://localhost/javascripts/templates/signup_password.js'),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);
			//Create weight view
			this.weightView = new steroids.views.WebView({location: 'http://localhost/views/Auth/weight.html',id: 'signupWeightView'});
			this.tosView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/tos.html', id: 'tos'});
			//Preload view (TOS is preloaded by default)
			this.weightView.preload();

			this.render();
		},
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
				var user;

				this.$el.find(':focus').trigger('blur');

				if(!_.isEmpty(prefilledData) && !_.isEmpty(password) && !_.isEmpty(confirmation) && (password === confirmation)){
					window.showLoading('Guardando...');

					//Add password to the object
					prefilledData.password = password;

					//start creating user
					user = new Parse.User();
					user.set(prefilledData);

					//Atempt saving the user
					user.signUp(
						null,
						{
							success: this.onSuccess.bind(this),
							error: this.onError.bind(this)
						}
					);
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

			setTimeout(function(){
				//Push weight view
				steroids.layers.push({
					view: this.weightView,
					navigationBar: false
				});
				//Hide loading indicator
				window.hideLoading();
			}.bind(this), 1);
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
				if(this.tosView){
					this.tosView.unload();
				}
				break;
			case 'signup_weight':
				if(this.weightView){
					this.weightView.unload();
				}
				break;
			}
		}
	});

	var SignupWeight = Controller.extend({
		id: 'signup-weight-page',
		template: require('http://localhost/javascripts/templates/signup_weight.js'),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.render();
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#weight')
			};
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				window.showLoading('Guardando...');

				var w = parseInt(this.dom.weight.val(), 10);
				var user = Parse.User.current();

				if(!_.isNaN(w) && _.isNumber(w)){
					user.save({weight: w}, {
						success: this.onSuccess.bind(this),
						error: this.onError.bind(this)
					});
				}else{
					throw new Error('INVALID_DATA');
				}
			}catch(e){
				window.hideLoading();
				console.log(e);
			}
		},
		onSuccess: function(){
			window.hideLoading();

			window.postMessage({
				message: 'signup_weight'
			});

			this.back();
		},
		onError: function(){
			window.hideLoading();
			console.log(arguments, 'error');
		},
		back: function(){
			console.log('back');
			setTimeout(function(){
				steroids.layers.popAll();
			}, 1);
		}
	});

	/**
	* Login Controller
	* 
	* Takes care of authenticating users with a Parse account
	*/
	var Login = Controller.extend({
		id: 'login-page',
		template: require('http://localhost/javascripts/templates/login.js'),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

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

				this.$el.find(':focus').trigger('blur');

				if(!_.isEmpty(u) && !_.isEmpty(p)){
					window.showLoading('Validando...');

					Parse.User.logIn(
						u, p,
						{
							success: this.onSuccess.bind(this),
							error: this.onError.bind(this)
						}
					);
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
			//Go back to the top most view
			steroids.layers.popAll();
			//Hide loading indicator
			window.hideLoading();
			//Reset form
			this.reset();
		},
		onError: function(model, error){
			window.hideLoading();

			setTimeout(function(){
				navigator.notification.alert(this.message, $.noop, 'Ups!');
			}.bind(error), 1);
		}
	});

	/**
	* TOS Controller
	* 
	* Displays the Application's terms of service
	*/
	var TOS = Modal.extend({
		id: 'tos-page',
		template: require('http://localhost/javascripts/templates/tos.js'),
		events: (function () {
			var events = _.extend({}, Modal.prototype.events, {

			});

			return events;
		})(),
		initialize: function(){
			Modal.prototype.initialize.apply(this, arguments);

			return this.render();
		}
	});

	return {
		Index: Index,
		signup: {
			Credentials: Signup,
			Password: SignupPassword,
			Weight: SignupWeight
		},
		Login: Login,
		TOS: TOS
	};
});