/* globals define, steroids, _, Parse */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var template = require('http://localhost/javascripts/templates/settings_home.js');
	var Auth = require('AuthController');

	var Index = Controller.extend({
		id: 'settings-page',
		template: template,
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #updateName': 'showView',
				'click #updateEmail': 'showView',
				'click #updatePassword': 'showView',
				'click #updateWeight': 'showView',
				'click #tos': 'showModal',
				'click #signout': 'signout'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			//Create views
			this.views = {
				name: new steroids.views.WebView({location: 'http://localhost/views/Settings/name.html', id: 'settingsNameView'}),
				email: new steroids.views.WebView({location: 'http://localhost/views/Settings/email.html', id: 'settingsEmailView'}),
				password: new steroids.views.WebView({location: 'http://localhost/views/Settings/password.html', id: 'settingsPasswordView'}),
				weight: new steroids.views.WebView({location: 'http://localhost/views/Settings/weight.html', id: 'weightView'}),
				tos: new steroids.views.WebView({location: 'http://localhost/views/Auth/tos.html', id: 'tos'})
			};
			//Preload all views
			_.each(this.views, function(v){v.preload();});

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'settingsView')){
				var backButton = this.constructor.backButton();
				
				steroids.view.navigationBar.update({
					title: 'Configuracion',
					backButton: backButton
				});
				steroids.view.navigationBar.show();
			}
		},
		showView: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var view = $(e.currentTarget).attr('data-view');
				if(view && this.views[view]){
					setTimeout(function(){
						steroids.layers.push({
							view: this.views[view]
						});
					}.bind(this), 1);
				}else{
					throw new Error('NO_VIEW_DEFINED');
				}
			}catch(e){
				console.log(e, e.stack);
			}
		},
		showModal: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var view = $(e.currentTarget).attr('data-view');
				if(view && this.views[view]){
					setTimeout(function(){
						steroids.modal.show(this.views[view]);
					}.bind(this), 1);
				}else{
					throw new Error('NO_VIEW_DEFINED');
				}
			}catch(e){
				console.log(e, e.stack);
			}
		},
		signout: function(){
			//Broadcast signout message
			window.postMessage({message: 'logout'});

			setTimeout(function(){
				//Back to the home page
				steroids.layers.popAll();
			}, 1);
		}
	});

	var EditWeight = Auth.signup.Weight.extend({
		id: 'settings-weight-page',
		template: require('http://localhost/javascripts/templates/settings_weight.js'),
		initialize: function(options){
			if(!options || !options.model || !options.model instanceof Parse.User){
				throw new Error('Settings.Weight require a User model');
			}

			Controller.prototype.initialize.apply(this, arguments);

			steroids.navigationBar.show('Cambiar Peso');

			this.render();
		},
		back: function(){
			setTimeout(function(){
				steroids.layers.pop();
			}, 1);
		},
		onSuccess: function(){
			window.hideLoading();
		}
	});

	var EditName = Controller.extend({
		id: 'settings-name-page',
		template: require('http://localhost/javascripts/templates/settings_name.js'),
		events: {
			'click .back-button': 'back'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			steroids.navigationBar.show('Cambiar Nombre');

			this.render();
		}
	});

	var EditEmail = Controller.extend({
		id: 'settings-email-page',
		template: require('http://localhost/javascripts/templates/settings_email.js'),
		events: {
			'click .back-button': 'back'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			steroids.navigationBar.show('Cambiar Correo');

			this.render();
		}
	});

	var EditPassword = Controller.extend({
		id: 'settings-password-page',
		template: require('http://localhost/javascripts/templates/settings_password.js'),
		events: {
			'click .back-button': 'back'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			steroids.navigationBar.show('Cambiar Contrasena');

			this.render();
		}
	});

	return {
		Index: Index,
		Name: EditName,
		Email: EditEmail,
		Password: EditPassword,
		Weight: EditWeight
	};
});