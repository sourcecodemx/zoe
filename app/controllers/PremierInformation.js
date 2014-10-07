/* globals define, forge, Parse */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		template: require('templates/premier_modal_information'),
		id: 'premier-information-page',
		title: 'Informacion',
		onRender: function(){
			this.dom = {
				form: this.$el.find('form'),
				name: this.$el.find('#name'),
				email: this.$el.find('#email'),
				phone: this.$el.find('#phone')
			};
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			this.dom.form.trigger('reset');
			forge.notification.alert('¡Gracias!', 'Nos podremos en contacto contigo');
		},
		onShow: function(){
			Controller.prototype.onShow.call(this);

			if(forge.is.mobile()){
				forge.topbar.setTint([0,0,0,255]);
				forge.topbar.setTitle(this.title);
				forge.topbar.removeButtons();
				forge.topbar.addButton({
					icon: 'images/close@2x.png',
					position: 'left',
					prerendered: true
				}, this.hide.bind(this));	
			}
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