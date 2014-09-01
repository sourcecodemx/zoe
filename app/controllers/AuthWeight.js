/* globals define, steroids */
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
				backButton: null
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
					title: this.title
				});
			}
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				window.showLoading('Guardando');

				var w = parseInt(this.dom.weight.val(), 10);
				window.postMessage({message: 'user:save:weight', weight: w});
			}catch(e){
				window.hideLoading();
				this.onError(null, e);
			}
		},
		back: function(){
			window.hideLoading();

			this.reset();

			setTimeout(function(){
				steroids.layers.popAll();
			}, 1);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:saved:weight':
				this.back();
				break;
			case 'user:saved:weight:error':
				this.onError(null, event.data.error);
			}
		}
	});
});