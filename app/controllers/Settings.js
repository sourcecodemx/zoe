/* globals define, Parse, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var template = require('http://localhost/javascripts/templates/settings_home.js');

	var Index = Controller.extend({
		id: 'settings-page',
		template: template,
		events: {
			'click .back-button': 'back',
			'click #updateName': 'updateName',
			'click #updateEmail': 'updateName',
			'click #updatePassword': 'updateName',
			'click #updateWeight': 'updateName',
			'click #signout': 'signout'
		},
		initialize: function(){
			Controller.prototype.initialize.call(this, arguments);

			return this.render();
		},
		updateName: function(){},
		updateEmail: function(){},
		updatePassword: function(){},
		updateWeight: function(){},
		signout: function(){
			window.showLoading('Cerrando...');
			//Get out!
			Parse.User.logOut();
			//Broadcast signout message
			window.postMessage({message: 'logout'});

			setTimeout(function(){
				//Back to the home page
				steroids.layers.popAll();
				//Hide loading indicator
				window.hideLoading();
			}, 1000);
		}
	});

	return {
		Index: Index
	};
});