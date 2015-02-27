/* globals define, _, forge, Zoe, aspect, Backbone */
define(function(require){
	'use strict';

	var Controller  = require('Controller');
	var Password    = require('AuthPassword');
	var TOS = require('TOS');
	var moment = require('moment');

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

            Backbone.on('user:login', this.reset, this);

			return this.render();
		},
		onRender: function(){
			this.dom = {
				username: this.$el.find('#username'),
				email: this.$el.find('#email'),
				date: this.$el.find('#birthdate'),
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

				if(_.isEmpty(this.dom.username.val()) || _.isEmpty(this.dom.email.val())){
					throw new Error('Por favor ingresa tus credenciales.');
				}

				if(_.isEmpty(this.dom.date.val())){
					throw new Error('Por favor ingresa tus fecha de nacimiento.');
				}

				if(!moment(this.dom.date.val()).isValid()){
					throw new Error('Esa fecha de nacimiento parece invalida, por favor verificala.');
				}

				var data = {
					username: this.dom.username.val().toLowerCase(), 
					email: this.dom.email.val().toLowerCase(),
					birthdate: new Date(this.dom.date.val())
				};

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
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));
			forge.topbar.show();
		},
		tos: function(){
			this.blur();

			if(this.views.tos){
				this.views.tos.show();
			}else{
				this.views.tos = new TOS().show();
			}

			this.listenToOnce(this.views.tos, 'hide', this.setupButtons.bind(this));
		}
	});
});