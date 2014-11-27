/* globals define, User, forge, _ */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'settings-name-page',
		template: require('templates/settings_name'),
		title: 'Cambiar Nombre',
		titleImage: 'images/titles/settings-name.png',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Get username
			this.data.username = User.current().get('username');

			this.render();
		},
		onRender: function(){
			this.dom = {
				name: this.$el.find('#username'),
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

			if(this.titleImage){
				forge.topbar.setTitleImage(this.titleImage, _.noop, _.noop);
			}else{
				forge.topbar.setTitle(this.title);
			}

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

				var name = this.dom.name.val();

				if(!name || !name.length){
					throw new Error('Por favor introduce tu nombre de usuario.');
				}else if(name === this.data.username){
					throw new Error('Ese es tu nombre de usuario actual, no hay necesidad de guardarlo de nuevo.');
				}

				window.showLoading('Guardando');
				User.current()
					.save('username', name)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			window.hideLoading();
			window.showLoading('Tu nombre de usuario se ha actualizado.');
			setTimeout(window.hideLoading.bind(window), 2000);
		}
	});
});