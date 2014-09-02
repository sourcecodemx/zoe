/* globals define, steroids, Zoe, _ */
define(function(require){
	'use strict';

	var Signup     = require('http://localhost/controllers/Auth.js');
	var Controller = require('http://localhost/controllers/core/Controller.js');

	/**
	* Signup2 Controller
	* 
	* Takes care of capturing password and password confirmation
	* tries to create a Parse user, if everything goes smooth
	* takes the user to the weight setup screen
	*/
	return Signup.extend({
		id: 'signup-password-page',
		template: require('http://localhost/javascripts/templates/signup_password.js'),
		backButton: true,
		title: '2. Crear cuenta',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);
			//Create weight view
			this.weightView = new steroids.views.WebView({location: 'http://localhost/views/Auth/weight.html',id: 'signupWeightView'});
			this.tosView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/tos.html', id: 'tos'});
			//Preload view (TOS is preloaded by default)
			this.weightView.preload();

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});
			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			this.messageListener();

			this.render();
		},
		onRender: function(){
			this.dom = {
				password: this.$el.find('#password'),
				passwordConfirmation: this.$el.find('#passwordConfirmation'),
				form: this.$el.find('form')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'signupPasswordView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var prefilledData = Zoe.storage.getItem('signup_prefill');
				var password = this.dom.password.val();
				var confirmation = this.dom.passwordConfirmation.val();

				if(!_.isEmpty(prefilledData) && !_.isEmpty(password) && !_.isEmpty(confirmation) && (password === confirmation)){
					window.showLoading('Creando Cuenta');

					//Add password to the object
					prefilledData.password = password;

					//Atempt saving the user
					window.postMessage({message: 'user:signup', user: prefilledData});
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
				this.onError(null, e);
			}finally{

			}
		},
		onSuccess: function(){
			//Remove prefilled data
			Zoe.storage.removeItem('prefilled_data');

			this.reset();

			setTimeout(function(){
				//Push weight view
				steroids.layers.push({
					view: this.weightView
				});
				//Hide loading indicator
				window.hideLoading();
			}.bind(this), 1);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:signup:success':
				this.onSuccess();
				break;
			case 'user:signup:error':
				this.onError(null, event.data.error);
				break;
			}
		}
	});
});