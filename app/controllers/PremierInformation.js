/* globals define, steroids, ActivityIndicator  */
define(function(require){
	'use strict';

	var Modal = require('http://localhost/controllers/core/Modal.js');

	return Modal.extend({
		template: require('http://localhost/javascripts/templates/premier_modal_information.js'),
		id: 'premier-information-page',
		title: 'Informacion',
		initialize: function(){
			Modal.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

			var leftButton = new steroids.buttons.NavigationBarButton();
				
			leftButton.imagePath = '/images/close@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);

			steroids.view.navigationBar.update({
				title: this.title,
				closeButton: leftButton,
				buttons: {
					left: [leftButton]
				}
			});

			return this.render();
		},
		onRender: function(){
			this.dom = {
				form: this.$el.find('form'),
				name: this.$el.find('#name'),
				email: this.$el.find('#email'),
				phone: this.$el.find('#phone')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'premierInformationView'){
				steroids.view.navigationBar.setAppearance({
					tintColor: '#000000'
				});

				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		onSuccess: function(){
			ActivityIndicator.hide();
			ActivityIndicator.show('Mensaje enviado');
			setTimeout(ActivityIndicator.hide.bind(window), 2000);
			this.dom.form.trigger('reset');
		},
		submit: function(e){
			try{
				ActivityIndicator.show('Enviando');

				if(e && e.preventDefault){
					e.preventDefault();
				}

				var name = this.dom.name.val();
				var email = this.dom.email.val();
				var phone = this.dom.phone.val();

				if(!name || !email || !phone){
					throw new Error('Todos los campos son obligatorios, por favor intente de nuevo.');
				}

				window.postMessage({
					message: 'premier:contact',
					details: {
						name: name,
						email: email,
						phone: phone
					}
				});
			}catch(e){
				this.onError(null, e);
			}
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'premier:contact:success':
				this.onSuccess();
				break;
			case 'premier:contact:error':
				this.onError(null, data.error);
				break;
			}
		}
	});
});