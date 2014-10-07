/* global define, Parse, Pusher, Zoe, forge, User */
define(function(require){
	'use strict';

	forge.logging.info('APIController loaded');
	//Collections
	var Images = require('collections/Images');
	var Blog   = require('collections/Blog');
	//Configuration
	var config = require('config');
	//Require Pusher library
	require('pusher');

	//API Controller
	var Controller = function(){
		window.addEventListener('message', this.onMessage.bind(this));

		this.images = new Images();
		this.blog   = new Blog();
		this.user   = User.current();

		Pusher.log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		};

		var pusher = new Pusher(config.PUSHER.KEY);
		var channel = pusher.subscribe('main');
		//Subscribe to main channel
		channel.bind('main', function(data) {
			var message = data;
			var lastReceived = Zoe.storage.getItem('last-received-message');

			if(!lastReceived){
				//Set last-received-message to expire in 60 minutes
				Zoe.storage.setItem('last-received-message', true, 1000*60*60);
				navigator.notification.vibrate();
				forge.notification.alert('Zoe Mensajes', message);
			}
		});

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
				User.current().save({username: data.name}, {
					success: function(){
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
				var forgotModel = Parse.Object.extend({className: '_User'});
				var forgotQuery = new Parse.Query(forgotModel);
				//Check if user is not a FB user
				forgotQuery.equalTo('email', data.email);
				forgotQuery.first({
					success: function(user){
						if(user && user.get('facebook')){
							window.postMessage({message: 'user:forgot:error', error: {message: 'Ese correo esta registrado como usuario de Facebook, puedes iniciar sesion automaticamente desde la pantalla de inicio usando el boton de Facebook.'}});
						}else{
							User.requestPasswordReset(data.email, {
								success: function() {
									window.postMessage({message: 'user:forgot:success'});
								},
								error: function(error) {
									switch(error.code){
									case 205:
										error.message = 'No existe usuario para el correo ' + data.email;
										break;
									}

									window.postMessage({message: 'user:forgot:error', error: error});
								}
							});
						}
					}.bind(this),
					error: function(e){
						window.postMessage({message: 'user:forgot:error', error: e});
					}.bind(this)
				});
				
				break;
			/**
			*
			*
			* Gallery Events
			*
			*/
			case 'gallery:fetch':
				
				break;
			case 'gallery:image:save':
				
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
				//Paginate
				if(data.page >= 0){
					this.blog.query.skip(data.page*config.BLOG.LIMIT);
				}

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
						window.postMessage({message: 'pos:fetch:error', error: error});
					});
				break;
			}
		}
	};

	return new Controller();
});