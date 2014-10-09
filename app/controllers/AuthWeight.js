/* globals define, forge  */
define(function(require){
	'use strict';

	var Controller      = require('Controller');

	return Controller.extend({
		id: 'signup-weight-page',
		template: require('templates/signup_weight'),
		title: 'Configuracion',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			this.render();
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#weight'),
				form: this.$el.find('form')
			};
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

				var w = parseInt(this.dom.weight.val(), 10);

				if(!w){
					throw new Error('Necesitamos saber su pero para poder calcular el consumo optimo diario, por favor intente de nuevo');
				}else if(isNaN(w)){
					throw new Error('El peso debe ser un numero, por favor intente de nuevo.');
				}

				forge.notification.showLoading('Guardando');
				//window.postMessage({message: 'user:weight:save', weight: w});
			}catch(e){
				this.onError(null, e);
			}
		},
		back: function(){
			this.reset();

			forge.notification.hideLoading();
		}
	});
});