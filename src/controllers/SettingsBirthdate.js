/* globals define, User, forge  */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var moment = require('moment');

	require('moment.locale');

	return Controller.extend({
		id: 'settings-birthdate-page',
		template: require('templates/settings_birthdate'),
		title: 'Cambiar Fecha de Nacimiento',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
			
			this.data.birthdate = moment(User.current().get('birthdate')).format('L');

			this.render();
		},
		onRender: function(){
			this.dom = {
				date: this.$el.find('#birthdate'),
				birthdate: this.$el.find('#currentBirthdate'),
				content: this.$el.find('.page-content')
			};
		},
		onShow: function(){
			this.setupButtons();
			this.bounceInRight();
		},
		hide: function(){
			this.bounceOutRight();
			this.trigger('hide');
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
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				if(!this.online){
					this.offlineError();
					return;
				}

				var birthdate = this.dom.date.val();

				if(!birthdate){
					throw new Error('Por favor introduce tu fecha de nacimiento.');
				}else if(!moment(birthdate).isValid()){
					throw new Error('Por favor introduce una fecha de nacimiento valida.');
				}

				forge.notification.showLoading('Guardando');
				User.current()
					.save('birthdate', new Date(birthdate))
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu fecha de nacimiento ha sido actualizada.');
			this.dom.birthdate.html(moment(User.current().get('birthdate')).format('L'));
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});