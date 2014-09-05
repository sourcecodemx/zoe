/* globals define, steroids, ActivityIndicator  */
define(function(require){
	'use strict';

	var Controller      = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		id: 'signup-weight-page',
		template: require('http://localhost/javascripts/templates/signup_weight.js'),
		title: 'Configuracion',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});
			steroids.view.navigationBar.update({
				title: this.title,
				backButton: null,
				overrideBackButton: true
			});

			this.messageListener();
			this.render();
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#weight'),
				form: this.$el.find('form')
			};
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'signupWeightView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var w = parseInt(this.dom.weight.val(), 10);

				if(!w){
					throw new Error('Necesitamos saber su pero para poder calcular el consumo optimo diario, por favor intente de nuevo');
				}else if(isNaN(w)){
					throw new Error('El peso debe ser un numero, por favor intente de nuevo.');
				}

				ActivityIndicator.show('Guardando');
				window.postMessage({message: 'user:weight:save', weight: w});
			}catch(e){
				this.onError(null, e);
			}
		},
		back: function(){
			this.reset();

			ActivityIndicator.hide();

			steroids.layers.popAll();
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:weight:success':
				this.back();
				break;
			case 'user:weight:error':
				this.onError(null, event.data.error);
			}
		}
	});
});