/* globals define, _, steroids, Parse */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var Modal      = require('http://localhost/controllers/core/Modal.js');
	var template   = require('http://localhost/javascripts/templates/premier.js');

	var Index = Controller.extend({
		id: 'premier-page',
		template: template,
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #information': 'info'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.views.information = new steroids.views.WebView({location: 'http://localhost/views/Premier/information.html', id: 'premierInformationView'});
			this.views.information.preload();

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu.png';
			leftButton.onTap = this.onLeftButton.bind(this);

			steroids.view.navigationBar.update({
				title: 'Zoé Water Premier',
				buttons: {
					left: [leftButton]
				}
			});
			steroids.view.navigationBar.show();

			return this.render();
		},
		info: function(){
			steroids.modal.show({view: this.views.information});
		}
	});

	var Information = Modal.extend({
		template: require('http://localhost/javascripts/templates/premier_modal_information.js'),
		id: 'premier-information-page',
		initialize: function(){
			Modal.prototype.initialize.apply(this, arguments);

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
		submit: function(e){
			window.showLoading('Enviando');

			if(e && e.preventDefault){
				e.preventDefault();
			}

			Parse.Cloud.run('contact', {
					name: this.dom.name.val(),
					email: this.dom.email.val(),
					phone: this.dom.phone.val()
				})
				.done(function(){
					window.showLoading('Mensaje enviado');
					_.delay(window.hideLoading.bind(window), 2000);
					this.dom.form.trigger('reset');
				}.bind(this))
				.fail(function(){
					window.hideLoading();
					_.delay(function(){
						navigator.notification.alert('No hemos podido enviar el mensaje', $.noop, 'Error');
					}, 1);
				});
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'premierInformationView'){
				var leftButton = new steroids.buttons.NavigationBarButton();
				
				leftButton.imagePath = '/images/close.png';
				leftButton.onTap = this.onLeftButton.bind(this);

				steroids.view.navigationBar.setAppearance({
					tintColor: '#000000'
				});

				steroids.view.navigationBar.update({
					title: 'Informacion',
					closeButton: leftButton,
					buttons: {
						left: [leftButton]
					}
				});

				steroids.view.navigationBar.show();
			}
		}
	});

	return {
		Index: Index,
		Information: Information
	};
});