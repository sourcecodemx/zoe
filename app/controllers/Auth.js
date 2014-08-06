/* globals define, steroids */
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
			Controller.prototype.initialize.call(this, arguments);

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
		}
	});

	var Signup = Controller.extend({
		id: 'signup-page',
		template: require('http://localhost/javascripts/templates/signup.js'),
		events: {
			'click #tos': 'tos',
			'click .back-button': 'back'
		},
		initialize: function(){
			Controller.prototype.initialize.call(this, arguments);

			this.tosView =  new steroids.views.WebView({location: 'http://localhost/views/Auth/tos.html', id: 'tos'});

			return this.render();
		},
		onRender: function(){
			console.log('signup controller render complete');
		},
		tos: function(){
			setTimeout(function(){
				steroids.modal.show(this.tosView);
			}.bind(this), 1);
		}
	});

	var Login = Controller.extend({
		id: 'login-page',
		template: require('http://localhost/javascripts/templates/login.js'),
		events: {
			'click .back-button': 'back'
		},
		initialize: function(){
			Controller.prototype.initialize.call(this, arguments);

			return this.render();
		},
		onRender: function(){
			console.log('login controller render complete');
		}
	});

	var TOS = Controller.extend({
		id: 'tos-page',
		template: require('http://localhost/javascripts/templates/tos.js'),
		events: {
			'click .hide-modal': 'hideModal'
		},
		initialize: function(){
			Controller.prototype.initialize.call(this, arguments);

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
		Signup: Signup,
		Login: Login,
		TOS: TOS
	};
});