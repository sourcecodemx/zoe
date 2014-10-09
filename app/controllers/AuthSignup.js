/* globals define, _, forge, Zoe, aspect */
define(function(require){
	'use strict';

	var Controller  = require('Controller');
	var Password    = require('AuthPassword');
	var TOS = require('TOS');

	/**
	* Login Controller
	* 
	* Takes care of authenticating users with a Parse account
	*/
	return Controller.extend({
		id: 'signup-page',
		template: require('templates/signup'),
		title: '1. Crear cuenta',
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
				username: this.$el.find('#username'),
				email: this.$el.find('#email'),
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

				if(_.isEmpty(this.dom.username) || _.isEmpty(this.dom.email)){
					throw new Error('Por favor ingresa tus credenciales.');
				}

				var data = {username: this.dom.username.val().toLowerCase(), email: this.dom.email.val().toLowerCase()};

				//Save items for the next step, will last for 10 minutes
				Zoe.storage.setItem('signup_prefill', data, ((new Date())*1) + 10*60*1000);
				
				if(this.views.authPassword){
					this.views.authPassword.show();
				}else{
					this.views.authPassword = new Password().show();
				}

				this.bounceOutLeft();
				this.listenToOnce(this.views.authPassword, 'hide', this.bounceInLeft.bind(this));
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
			forge.topbar.show();
		},
		tos: function(){
			if(this.views.tos){
				this.views.tos.show();
			}else{
				this.views.tos = new TOS().show();
			}

			this.listenToOnce(this.views.tos, 'hide', this.setupButtons.bind(this));
		}
	});
});