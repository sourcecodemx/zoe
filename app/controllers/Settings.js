/* globals define, steroids, Parse, _ */
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
			Controller.prototype.initialize.apply(this, arguments);

			return this.render();
		},
		updateName: function(){},
		updateEmail: function(){},
		updatePassword: function(){},
		updateWeight: function(){},
		signout: function(){
			//Broadcast signout message
			window.postMessage({message: 'logout'});

			setTimeout(function(){
				//Back to the home page
				steroids.layers.popAll();
			}, 1);
		}
	});

	var EditWeight = Controller.extend({
		id: 'settings-weight-page',
		template: require('http://localhost/javascripts/templates/settings_weight.js'),
		events: {
			'click .back-button': 'back',
			'submit form': 'submit'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.render();
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#weight')
			};
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}
				var w = parseInt(this.dom.weight.val(), 10);
				var user = Parse.User.current();

				if(!_.isNaN(w) && _.isNumber(w)){
					user.save({weight: w}, {
						success: this.onSuccess.bind(this),
						error: this.onError.bind(this)
					});
				}else{
					throw new Error('INVALID_DATA');
				}
			}catch(e){
				console.log(e);
			}
		},
		onSuccess: function(){
			console.log('success', arguments);
			this.back();
		},
		onError: function(){
			console.log(arguments, 'error');
		},
		back: function(){
			setTimeout(function(){
				steroids.layers.popAll();
			}, 1);
		}
	});

	return {
		Index: Index,
		Weight: EditWeight
	};
});