/* globals define, steroids, CryptoJS, facebookConnectPlugin, _, ActivityIndicator */
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
				'click #facebookSignup': 'facebook'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.messageListener();

			steroids.view.navigationBar.update({
				title: ''
			});
			steroids.view.navigationBar.hide();

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'index') && $('#index-page').length){
				steroids.view.navigationBar.hide();
			}
		},
		onMe: function(response){
			ActivityIndicator.show('Autenticando');

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

			/*
			//start creating user
			var user = new Parse.User();
			user.set(data);

			//Atempt saving the user
			user.signUp(
				null,
				{
					success: this.onFBSignupSuccess.bind(this),
					error: this.onFBSignupError.bind(this)
				}
			);
			*/
			//Atempt saving the user
			window.postMessage({message: 'user:save:fbsignup', user: data});
		},
		onFBSignupSuccess: function(){
			setTimeout(function(){
				//Push weight view
				steroids.layers.push({
					view: this.weightView
				});
				//Hide loading indicator
				ActivityIndicator.hide();

				window.postMessage({message: 'fbauth'});
			}.bind(this), 1);
		},
		onFBError: function(){
			ActivityIndicator.hide();
			setTimeout(function(){
				navigator.notification.alert('No hemos podido iniciar sesion con Facebook, por favor intenta de nuevo.', $.noop, 'Ups!');
			}, 1);
		},
		onFBLogin: function(){
			ActivityIndicator.hide();
			window.postMessage({message: 'fbauth'});
		},
		onClose: function(){
			this.signupView = null;
			this.loginView = null;
			this.weightView = null;
		},
		facebook: function(){
			ActivityIndicator.show('Autenticando');

			var me = function(){
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
			}.bind(this));
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'user:saved:fbsignup':
				this.onFBSignupSuccess();
				break;
			case 'user:saved:fbsignup:error':
				this.onError(null, data.error);
				break;
			}
		},
		onDestroy: function(){
			window.removeEventListener('message', this.onMessage.bind(this));
		}
	});
});