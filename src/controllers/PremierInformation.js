/* globals define, _, forge, Parse */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var template = require('templates/premier_modal_information');

	return Controller.extend({
		id: 'premier-information-page',
		template: template,
		title: 'Informacion',
		titleImage: 'images/titles/premier-information.png',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		},
		hide: function(){
			this.dom.content.removeClass('bounseInUp').addClass('bounceOutDown');
			this.trigger('hide');
			_.delay(this._detach.bind(this), 1000);
		},
		onRender: function(){
			this.dom = {
				form: this.$el.find('form'),
				name: this.$el.find('#name'),
				email: this.$el.find('#email'),
				phone: this.$el.find('#phone'),
				content: this.$el.find('.page-content')
			};
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			this.dom.form.trigger('reset');
			forge.notification.alert('¡Gracias!', 'Nos podremos en contacto contigo');
		},
		onShow: function(){
			forge.topbar.setTint([0,0,0,255]);
			
			if(this.titleImage){
				forge.topbar.setTitleImage(this.titleImage, _.noop, _.noop);
			}else{
				forge.topbar.setTitle(this.title);
			}
			
			forge.topbar.removeButtons();
			forge.topbar.addButton({
				icon: 'images/close@2x.png',
				position: 'left',
				prerendered: true
			}, this.hide.bind(this));

			this.dom.content.removeClass('bounceOutDown').addClass('bounceInUp');
		},
		submit: function(e){
			try{
				forge.notification.showLoading('Enviando');

				if(e && e.preventDefault){
					e.preventDefault();
				}

				var name = this.dom.name.val();
				var email = this.dom.email.val();
				var phone = this.dom.phone.val();

				if(!name || !email || !phone){
					throw new Error('Todos los campos son obligatorios, por favor intente de nuevo.');
				}

				Parse.Cloud
					.run('contact', {name: name, email: email, phone: phone})
					.done(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		}
	});
});