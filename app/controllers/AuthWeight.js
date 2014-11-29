/* globals define, User, forge */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'auth-weight-page',
		template: require('templates/signup_weight'),
		title: 'Configurar Peso',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Get username
			this.data.weight = User.current().get('weight') || 0;

			var settings = User.current().get('settings');
			if(settings && settings.consumptionType === 'custom'){
				this.data.liters = this.data.weight * 0.036;
				this.data.weight = 0;
			}
			this.render();
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#weight'),
				form: this.$el.find('form'),
				content: this.$el.find('.page-content')
			};
		},
		onShow: function(){
			this.setupButtons();
			this.bounceInUp();
		},
		hide: function(){
			this.bounceOutDown();
			this.trigger('hide');
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

				var weight = parseInt(this.dom.weight.val(), 10);
				if(!weight){
					throw new Error('Por favor introduce tu peso.');
				}else if(weight<=40){
					throw new Error('El peso no puede ser menor de 40kgs.');
				}else if(weight === this.data.weight){
					throw new Error('Ese es tu peso actual, no hay necesidad de guardarlo de nuevo.');
				}
				//Set weight
				var data = {weight: weight, settings: {consumptionType: 'weight'}};

				forge.notification.showLoading('Guardando');

				User.current()
					.save(data)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu consumo ha sido actualizado.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});