/* global define, Parse, steroids */
define(function(require){
	'use strict';

	steroids.logger.log('APIController loaded');

	var File   = require('http://localhost/models/File.js');
	var Journal = require('http://localhost/models/Journal.js');

	var Images = require('http://localhost/collections/Images.js');
	var Blog   = require('http://localhost/collections/Blog.js');

	var Controller = function(){
		window.addEventListener('message', this.onMessage.bind(this));

		this.images = new Images();
		this.blog   = new Blog();
		this.user   = Parse.User.current();

		return this;
	};

	Controller.prototype = {
		onMessage: function(event){
			var data = event.data;

			switch(data.message){
			case 'signup_weight':
				if(this.weightView){
					this.weightView.unload();
				}
				break;
			/**
			*
			*
			* User Login/Signup Events
			*
			*/
			case 'user:save:login':
				Parse.User.logIn(
					data.user.username,
					data.user.password,
					{
						success: function(){
							this.user = Parse.User.current();
							window.postMessage({message: 'user:saved:login'});
						}.bind(this),
						error: function(model, error){
							window.postMessage({message: 'user:saved:login:error', error: error});
						}
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
						success: function(){
							this.user = Parse.User.current();
							window.postMessage({message: 'user:saved:signup'});
						}.bind(this),
						error: function(model, error){
							window.postMessage({message: 'user:saved:signup:error', error: error});
						}
					}
				);

				break;
			case 'user:weight:save':
				Parse.User.current().save({weight: data.weight}, {
					success: function(){
						window.postMessage({message: 'user:weight:success'});
					},
					error: function(error){
						window.postMessage({message: 'user:weight:error', error: error});
					}
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
			case 'user:consumption:save':
				var type = parseInt(data.type, 10);
				var consumption = new Journal({consumption: type});

				consumption.save()
					.then(function(){
						var user = Parse.User.current();
						var journals = user.relation('journal');

						journals.add(consumption);
						user.set('lastConsumption', consumption);

						user
							.save()
							.then(function(){
								window.postMessage({message: 'user:consumption:success'});
							}, function(error){
								window.postMessage({message: 'user:consumption:error', error: error});
							});
					}, function(error){
						window.postMessage({message: 'user:consumption:error', error: error});
					});
				break;
			case 'user:journal:fetch':
				var journal = this.user.relation('journal');
				var today = new Date();
				var todayEnd = new Date();

				today.setHours(0,0,0,0);
				todayEnd.setHours(23,59,59,999);

				journal.query()
					.greaterThan('createdAt', today)
					.lessThan('createdAt', todayEnd)
					.find({
						success: function(results){
							var todayConsumption = results.reduce(function(current, next){return current+next.get('consumption');}, 0);
							window.postMessage({message: 'user:journal:success', consumption: todayConsumption});
						},
						error: function(error){
							window.postMessage({message: 'user:journal:error', error: error});
						}
					});
				break;
			/**
			*
			*
			* Gallery Events
			*
			*/
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
					this.images.add(file);
					//Save user relation a
					user
						.save()
						.then(function(){
							return file.fetch();
						})
						.then(function(f){
							window.postMessage({message: 'gallery:image:success', image: f.toJSON()});
						},function(error){
							window.postMessage({message: 'gallery:image:error', error: error});
						});
				}.bind(this), function(error){
					window.postMessage({message: 'gallery:image:error', error: error});
				});
				break;
			case 'gallery:image:upvote':
				this.images.get(data.id)
					.increment('likes')
					.save()
					.then(function(img){
						data.likes = img.get('likes');
						return this.user.addUnique('likedImages', data.id).save();
					}.bind(this))
					.then(function(){
						window.postMessage({message: 'gallery:image:upvote:success', id:data.id, likes: data.likes});
					}.bind(this),function(error){
						window.postMessage({message: 'gallery:image:vote:error', error: error});
					});
				break;
			case 'gallery:image:downvote':
				console.log('downvote', data);
				this.images.get(data.id)
					.increment('likes', -1)
					.save()
					.then(function(img){
						data.likes = img.get('likes');
						return this.user.remove('likedImages', data.id).save();
					}.bind(this))
					.then(function(){
						window.postMessage({message: 'gallery:image:downvote:success', id:data.id, likes: data.likes});
					}.bind(this),function(error){
						window.postMessage({message: 'gallery:image:vote:error', error: error});
					});
				break;
			/**
			*
			*
			* Blog Events
			*
			*/
			case 'blog:fetch':
				this.blog.fetch({
					success: function(collection){
						window.postMessage({message: 'blog:fetch:success', entries: collection.toJSON()});
					},
					error: function(collection, error){
						window.postMessage({message: 'blog:fetch:error', error: error});
					}
				});
				break;
			/**
			*
			*
			* Zoe Premier Events
			*
			*/
			case 'premier:contact':
				Parse.Cloud
					.run('contact', data.details)
					.done(function(){
						window.postMessage({message: 'premier:contact:success'});
					}.bind(this))
					.fail(function(error){
						window.postMessage({message: 'premier:contact:error', error: error});
					});
			}
		}
	};

	return new Controller();
});