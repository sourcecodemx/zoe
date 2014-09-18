/* globals define, steroids, CryptoJS, facebookConnectPlugin, _, ActivityIndicator, Parse, alert */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var config     = require('config');

	//Require crypto library
	require('http://localhost/components/cryptojslib/rollups/sha3.js');

	/**
	* Index Controller
	* 
	* Provides authentication options:
	* - Facebook
	* - Login (Parse)
	* - Signup
	*/
	return Controller.extend({
		id: 'index-page',
		template: require('http://localhost/javascripts/templates/index.js'),
		hideFx: 'fadeOut',
		showFb: 'fadeIn',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #facebook': 'facebook'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.messageListener();

			this.weightView = new steroids.views.WebView({location: 'http://localhost/views/Auth/weight.html',id: 'signupWeightView'});
			this.weightView.preload();

			//Nivigationbar
			steroids.view.navigationBar.update({
				title: ''
			});
			steroids.view.navigationBar.hide();

			return this.render();
		},
		onRender: function(){
			this.dom.weight = this.$el.find('#weight');
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'index') && $('#index-page').length){
				steroids.view.navigationBar.hide();
			}
		},
		onMe: function(response){
			var data = {
				email: response.email,
				username: response.id,
				password: CryptoJS.SHA3(response.id).toString(),
				firstName: response.first_name || '',
				lastName: response.last_name || '',
				fullName: response.name || '',
				gender: response.gender || '',
				facebook: true
			};

			//Atempt saving the user
			window.postMessage({message: 'user:fbsignup', user: data});
		},
		onFBSignupSuccess: function(){
			ActivityIndicator.hide();

			var user = Parse.User.current();
			if(!user.get('weight')){
				this.dom.weight.trigger('click');
			}

			window.postMessage({message: 'user:fblogin:success'});
		},
		onFBError: function(response){
			ActivityIndicator.hide();
			steroids.logger.log(response);
			alert(JSON.stringify(response));
			setTimeout(function(){
				navigator.notification.alert('No hemos podido iniciar sesion con Facebook, por favor intenta de nuevo.', $.noop, 'Ups!');
			}, 1);
		},
		onError: function(){
			ActivityIndicator.hide();
			Controller.prototype.onError.apply(this, Array.prototype.slice.call(arguments));
		},
		facebook: function(){
			if(!this.online){
				this.offlineError();
				return;
			}
			
			var me = function(){
				ActivityIndicator.show('Autenticando');
				facebookConnectPlugin.api(
					'/me',
					config.FB.DEFAULT_PERMISSION,
					this.onMe.bind(this),
					this.onFBError.bind(this)
				);
			}.bind(this);

			facebookConnectPlugin.getLoginStatus(function(response){
				if(response && response.status === 'connected'){
					me();
				}else{
					facebookConnectPlugin.login(
						config.FB.DEFAULT_PERMISSION,
						me,
						this.onFBError.bind(this)
					);
				}
			}.bind(this), function(){
				ActivityIndicator.hide();
				navigator.notification.alert('No hemos podido iniciar sesion con Facebook.');
			}.bind(this));
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'user:fbsignup:success':
				this.onFBSignupSuccess();
				break;
			case 'user:fbsignup:error':
				this.onError(null, data.error);
				break;
			}
		},
		onDestroy: function(){
			window.removeEventListener('message', this.onMessage.bind(this));
		}
	});
});