/* globals define, steroids, Zoe, ActivityIndicator  */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var config = require('config');

	return Controller.extend({
		id: 'settings-name-page',
		template: require('http://localhost/javascripts/templates/settings_name.js'),
		title: 'Cambiar Nombre',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});

			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			//Get weight
			var user = Zoe.storage.getItem('Parse/' + config.PARSE.ID + '/currentUser');
			if(user){
				this.data.username = user.username;
			}

			this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsNameView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});
			}
		},
		onRender: function(){
			this.dom = {
				name: this.$el.find('#username')
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

				var name = this.dom.name.val();

				if(!name || !name.length){
					throw new Error('Por favor introduce tu nombre de usuario.');
				}else if(name === this.data.username){
					throw new Error('Ese es tu nombre de usuario actual, no hay necesidad de guardarlo de nuevo.');
				}

				ActivityIndicator.show('Guardando');
				window.postMessage({message: 'user:name:save', name: name});
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			ActivityIndicator.hide();
			ActivityIndicator.show('Tu nombre de usuario se ha actualizado.');
			setTimeout(ActivityIndicator.hide.bind(window), 2000);
		},
		onMessage: function(event){
			switch(event.data.message){
			case 'user:name:success':
				this.onSuccess();
				break;
			case 'user:name:error':
				this.onError(null, event.data.error);
			}
		}
	});
});