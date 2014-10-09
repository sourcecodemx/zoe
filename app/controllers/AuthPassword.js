/* globals define, _, forge, User, Zoe, Backbone, aspect */
define(function(require){
	'use strict';

	var Controller  = require('Controller');
	var TOS = require('TOS');

	/**
	* Login Controller
	* 
	* Takes care of authenticating users with a Parse account
	*/
	return Controller.extend({
		id: 'signup-password-page',
		template: require('templates/signup_password'),
		title: '2. Crear cuenta',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #authTos': 'tos'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			aspect.add(this, ['bounceInLeft', 'bounceInRight'], this.setupButtons.bind(this), 'after');

			return this.render();
		},
		onRender: function(){
			this.dom = {
				password: this.$el.find('#password'),
				passwordConfirmation: this.$el.find('#passwordConfirmation'),
				form: this.$el.find('form'),
				content: this.$el.find('.page-content')
			};
		},
		onShow: function(){
			this.bounceInRight();
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

				var prefilledData = Zoe.storage.getItem('signup_prefill');
				var password = this.dom.password.val();
				var confirmation = this.dom.passwordConfirmation.val();

				if(!_.isEmpty(prefilledData) && !_.isEmpty(password) && !_.isEmpty(confirmation) && (password === confirmation)){
					forge.notification.showLoading('Creando Cuenta');

					//Add password to the object
					prefilledData.password = password;

					var user = new User();
					user.set('username', prefilledData.username);
					user.set('email', prefilledData.email);
					user.set('password', prefilledData.password);

					user.signUp(null, {
						success: this.onSuccess.bind(this),
						error: this.onError.bind(this)
					});
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
				Controller.prototype.onError.call(this, null, e);
			}
		},
		setupButtons: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));
		},
		tos: function(){
			if(this.views.tos){
				this.views.tos.show();
			}else{
				this.views.tos = new TOS().show();
			}

			this.listenToOnce(this.views.tos, 'hide', this.setupButtons.bind(this));
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			//Reset form
			this.reset();
			this.bounceOutRight();
			Zoe.storage.removeItem('signup_prefill');
			Backbone.history.navigate('#home/bounceInLeft', {trigger: true});
		}
	});
});