/* globals define, _, forge, User, Backbone */
define(function(require){
	'use strict';

	var Controller  = require('Controller');
	var Forgot      = require('AuthForgot');
	
	/**
	* Login Controller
	* 
	* Takes care of authenticating users with a Parse account
	*/
	return Controller.extend({
		id: 'login-page',
		template: require('templates/login'),
		title: 'Ingresa a tu cuenta',
		titleImage: 'images/titles/auth-login.png',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #forgot': 'forgot'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		},
		onRender: function(){
			this.dom = {
				username: this.$el.find('#username'),
				password: this.$el.find('#password'),
				form: this.$el.find('form'),
				content: this.$el.find('.page-content')
			};
		},
		onShow: function(){
			this.bounceInRight();
			this.setupButtons();
		},
		hide: function(){
			this.bounceOutRight();
			this.trigger('hide');
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

				window.showLoading('Autenticando');
				User.logIn(u.toLowerCase(), p)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onError: function(error){
			switch(error.code){
			case 101:
				error.message = 'Nombre de usuario o contraseña incorrectos';
				break;
			}
			
			Controller.prototype.onError.call(this, null, error);
		},
		onSuccess: function(){
			window.hideLoading();
			//Reset form
			this.reset();
			this.bounceOutRight();
			Backbone.trigger('user:login');
		},
		setupButtons: function(){
			forge.topbar.removeButtons();
			
			if(this.titleImage){
				forge.topbar.setTitleImage(this.titleImage, _.noop, _.noop);
			}else{
				forge.topbar.setTitle(this.title);
			}
			
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));
			forge.topbar.show();
		},
		forgot: function(){
			if(this.views.forgot){
				this.views.forgot.show();
			}else{
				this.views.forgot = new Forgot().show();
			}

			this.listenToOnce(this.views.forgot, 'hide', this.setupButtons.bind(this));
		}
	});
});