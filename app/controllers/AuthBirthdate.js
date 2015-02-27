/* globals define, User, forge, _ */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var moment = require('moment');

	return Controller.extend({
		id: 'auth-weight-page',
		template: require('templates/signup_birthdate'),
		title: 'Configurar Fecha de Nacimiento',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Get username
			this.data.birthdate = User.current().get('birthdate');

			this.render();
		},
		onRender: function(){
			this.dom = {
				date: this.$el.find('#birthdate'),
				form: this.$el.find('form'),
				content: this.$el.find('.page-content')
			};
		},
		onShow: function(){
			this.setupButtons();
			this.bounceInUp();

			_.delay(this.focus.bind(this), 1000);
		},
		focus: function(){
			this.dom.date.trigger('focus');
		},
		hide: function(){
			var date = this.dom.date.val();
			if(moment(date).isValid()){
				this.bounceOutDown();
				this.trigger('hide');
			}else{
				forge.notification.alert('¡Hey!', 'Es necesario definir tu fecha de nacimiento para continuar usando Zoe Water Movil.');
			}
		},
		setupButtons: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/close@2x.png',
				prerendered: true
			}, this.hide.bind(this));
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

				var d = new Date(this.dom.date.val());
				if(!d){
					throw new Error('Por favor introduce tu fecha de nacimeinto.');
				}else if(!moment(d).isValid()){
					throw new Error('Por favor introduce una fecha de nacimiento valida');
				}

				forge.notification.showLoading('Guardando');

				User.current()
					.save('birthdate', d)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu fecha de nacimiento ha sido actualizada.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});