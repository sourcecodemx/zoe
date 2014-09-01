/* global define, Parse */
define(function(require){
	'use strict';

	var File = require('http://localhost/models/File.js');
	var Images = require('http://localhost/collections/Images.js');
	
	var Controller = function(){
		window.addEventListener('message', this.onMessage.bind(this));

		this.images = new Images();

		return this;
	};

	Controller.prototype = {
		post: function(data){
			window.postMessage(data);
		},
		onSignin: function(){
			window.postMessage({message: 'user:saved:login'});
		},

		onSigninError: function(model, error){
			window.postMessage({message: 'user:saved:login:error', error: error});
		},

		onSignup: function(){
			window.postMessage({message: 'user:saved:signup'});
		},

		onSignupError: function(model, error){
			window.postMessage({message: 'user:saved:signup:error', error: error});
		},

		onWeight: function(){
			window.postMessage({message: 'user:saved:weight'});
		},

		onWeightError: function(model, error){
			window.postMessage({message: 'user:saved:weight:error', error: error});
		},
		
		onMessage: function(event){
			var data = event.data;

			switch(data.message){
			case 'signup_weight':
				if(this.weightView){
					this.weightView.unload();
				}
				break;
			case 'user:save:login':
				Parse.User.logIn(
					data.user.username,
					data.user.password,
					{
						success: this.onSignin.bind(this),
						error: this.onSigninError.bind(this)
					}
				);
				break;
			case 'user:save:signup':
				if(!this.user){
					this.user = new Parse.User();
				}

				this.user.set(data.user);
				//Atempt saving the user
				this.user.signUp(
					null,
					{
						success: this.onSignup.bind(this),
						error: this.onSignupError.bind(this)
					}
				);

				break;
			case 'user:save:weight':
				Parse.User.current().save({weight: data.weight}, {
					success: this.onWeight.bind(this),
					error: this.onWeightError.bind(this)
				});
				break;
			case 'user:save:fbsignup':
				var model = Parse.Object.extend({className: '_User'});
				var query = new Parse.Query(model);

				query.equalTo('username', data.user.username);
				query.count({
					success: function(count){
						if(count){
							window.postMessage({message:'user:save:login', user: data.user});
						}else{
							window.postMessage({message: 'user:save:signup', user: data.user});
						}
					}.bind(this),
					error: function(e){
						window.postMessage({message: 'user:saved:login:error', error: e});
					}.bind(this)
				});
				break;
			case 'gallery:fetch':
				this.images.fetch({
					success: function(collection){
						window.postMessage({message: 'gallery:fetch:success', images: collection.toJSON()});
					},
					error: function(collection, error){
						window.postMessage({message: 'gallery:fetch:error', error: error});
					}
				});
				break;
			case 'gallery:image:save':
				var img = new Parse.File('foto.jpg', { base64: data.image });
				var file = new File({image: img});

				file.save().then(function(){
					var user = Parse.User.current();
					var images = user.relation('images');
					//Add image to relation;
					images.add(file);
					//Save user relation a
					user
						.save()
						.then(
							function(){
								window.postMessage({message: 'gallery:image:success', image: file.toJSON()});
							},
							function(error){
								window.postMessage({message: 'gallery:image:error', error: error});
							}
						);
				}, function(error){
					window.postMessage({message: 'gallery:image:error', error: error});
				});
				break;
			case 'gallery:image:upvote':
				this.images.get(data.id)
					.increment('likes')
					.save()
					.then(
						function(img){
							window.postMessage({message: 'gallery:image:upvote:success', image: img.toJSON()});
						},
						function(error){
							window.postMessage({message: 'gallery:image:vote:error', error: error});
						}
					);
				break;
			case 'gallery:image.downvote':
				this.images.get(data.id)
					.increment('likes')
					.save()
					.then(
						function(img){
							window.postMessage({message: 'gallery:image:downvote:success', image: img.toJSON()});
						},
						function(error){
							window.postMessage({message: 'gallery:image:vote:error', error: error});
						}
					);
				break;
			}
		}
	};

	return new Controller();
});