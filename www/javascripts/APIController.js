/* global define, Parse, steroids */
define(function(require){
	'use strict';

	steroids.logger.log('APIController loaded');

	var File   = require('http://localhost/models/File.js');
	var Journal = require('http://localhost/models/Journal.js');

	var Images = require('http://localhost/collections/Images.js');
	var Blog   = require('http://localhost/collections/Blog.js');

	var User   = require('user');

	var Controller = function(){
		window.addEventListener('message', this.onMessage.bind(this));

		this.images = new Images();
		this.blog   = new Blog();
		this.user   = User.current();

		return this;
	};

	Controller.prototype = {
		onMessage: function(event){
			var data = event.data;

			switch(data.message){
			/**
			*
			*
			* User Login/Signup Events
			*
			*/
			case 'user:login':
				User.logIn(
					data.user.username,
					data.user.password,
					{
						success: function(){
							this.user = User.current();
							window.postMessage({message: 'user:login:success'});
						}.bind(this),
						error: function(model, error){
							window.postMessage({message: 'user:login:error', error: error});
						}
					}
				);
				break;
			case 'user:signup':
				var user = new User();

				user
					.set(data.user)
					.signUp(
						null,
						{success: function(){
							this.user = User.current();
							window.postMessage({message: 'user:signup:success'});
						}.bind(this), error: function(model, error){
							window.postMessage({message: 'user:signup:error', error: error});
						}
					});

				break;
			case 'user:fbsignup':
				var model = Parse.Object.extend({className: '_User'});
				var query = new Parse.Query(model);

				query.equalTo('username', data.user.username);
				query.count({
					success: function(count){
						if(count){
							User.logIn(
								data.user.username,
								data.user.password,
								{
									success: function(){
										this.user = User.current();
										window.postMessage({message: 'user:fbsignup:success'});
									}.bind(this),
									error: function(model, error){
										window.postMessage({message: 'user:fbsignup:error', error: error});
									}
								}
							);
						}else{
							var user = new User();
							user.set(data.user)
								.signUp(null, {
									success: function(){
										window.postMessage({message:'user:fbsignup:success'});
									},
									error: function(error){
										window.postMessage({message:'user:fbsignup:error', error: error});
									}
								});
						}
					}.bind(this),
					error: function(e){
						window.postMessage({message: 'user:fbsignup:error', error: e});
					}.bind(this)
				});
				break;
			case 'user:logout':
				User.logOut();
				window.postMessage({message: 'user:logout:success'});
				break;
			case 'user:weight:save':
				User.current().save({weight: data.weight}, {
					success: function(){
						window.postMessage({message: 'user:weight:success'});
					},
					error: function(error){
						window.postMessage({message: 'user:weight:error', error: error});
					}
				});
				break;
			case 'user:name:save':
				console.log('user name save', data);
				User.current().save({username: data.name}, {
					success: function(){
						console.log('user saved');
						window.postMessage({message: 'user:name:success'});
					},
					error: function(error){
						window.postMessage({message: 'user:name:error', error: error});
					}
				});
				break;
			case 'user:email:save':
				User.current().save({email: data.email}, {
					success: function(){
						window.postMessage({message: 'user:email:success'});
					},
					error: function(error){
						window.postMessage({message: 'user:email:error', error: error});
					}
				});
				break;
			case 'user:password:save':
				User.current()
					.save({password: data.password})
					.then({
						success: function(){
							window.postMessage({message: 'user:password:success'});
						},
						error: function(error){
							window.postMessage({message: 'user:password:error', error: error});
						}
					});
				break;
			case 'user:consumption:save':
				var type = parseInt(data.type, 10);
				var consumption = new Journal({consumption: type});

				consumption.save()
					.then(function(){
						var user = User.current();
						var journals = user.relation('journal');

						journals.add(consumption);
						console.log('about to set consumption', consumption);
						user.set('lastConsumption', consumption);

						user
							.save()
							.then(function(){
								window.postMessage({message: 'user:consumption:success', type: type});
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
			case 'user:forgot:request':
				User.requestPasswordReset(data.email, {
					success: function() {
						window.postMessage({message: 'user:forgot:success'});
					},
					error: function(error) {
						window.postMessage({message: 'user:forgot:error', error: error});
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
					var user = User.current();
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
				break;
			/**
			*
			*
			* Zoe POS Events
			*
			*/
			case 'pos:fetch':
				console.log(data, 'pos:fetch');
				var location = new Parse.GeoPoint({latitude: data.position.latitude, longitude: data.position.longitude});
				var pos = Parse.Object.extend('POS');
				var posquery = new Parse.Query(pos);

				posquery
					.near('location', location)
					.withinKilometers('location', location, 10)
					.find()
					.then(function(places){
						window.postMessage({message: 'pos:fetch:success', places: places});
					})
					.fail(function(error){
						console.log(error.code);
						window.postMessage({message: 'pos:fetch:error', error: error});
					});
				break;
			}
		}
	};

	return new Controller();
});