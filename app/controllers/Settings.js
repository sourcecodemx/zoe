/* globals define, steroids, _, Zoe */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var config = require('config');

	return Controller.extend({
		id: 'settings-page',
		template: require('templates/settings'),
		title: 'Configuracion',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #signout': 'signout'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});

			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			return this.render();
		},
		onRender: function(){
			this.dom.name = this.$el.find('#updateName');
			this.dom.email = this.$el.find('#updateEmail');
			this.dom.password = this.$el.find('#updatePassword');
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsIndexView')){
				steroids.view.navigationBar.update({
					title: this.title,
					backButton: this.backButton
				});

				var user = Zoe.storage.getItem('Parse/' + config.PARSE.ID + '/currentUser');
				if(user && user.facebook){
					this.dom.name.hide();
					this.dom.email.hide();
					this.dom.password.hide();
				}else{
					this.dom.name.show();
					this.dom.email.show();
					this.dom.password.show();
				}
			}
		},
		signout: function(){
			//Broadcast signout message
			window.postMessage({message: 'user:logout'});

			setTimeout(function(){
				//Back to the home page
				steroids.layers.popAll();
			}, 1);
		}
	});
});