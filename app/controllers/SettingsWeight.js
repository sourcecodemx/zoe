/* globals define, User, forge  */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'settings-weight-page',
		template: require('templates/settings_weight'),
		title: 'Cambiar Peso',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Get username
			this.data.weight = User.current().get('weight') || 0;

			this.render();
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#weight'),
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

				var weight = parseInt(this.dom.weight.val(), 10);

				if(!weight){
					throw new Error('Por favor introduce tu peso.');
				}else if(weight<=40){
					throw new Error('El peso no puede ser menor de 40.');
				}else if(weight === this.data.weight){
					throw new Error('Ese es tu peso actual, no hay necesidad de guardarlo de nuevo.');
				}

				forge.notification.showLoading('Guardando');

				User.current()
					.save('weight', weight)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu peso ha sido actualizado.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});