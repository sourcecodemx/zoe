/* globals define, _, steroids */
define(function(require){
	'use strict';

	var RootController = require('http://localhost/controllers/core/Root.js');
	var Controller = require('http://localhost/controllers/core/Controller.js');
	var template = require('http://localhost/javascripts/templates/gallery.js');

	var Index = RootController.extend({
		id: 'gallery-page',
		template: template,
		events: (function () {
			var events = _.extend({}, RootController.prototype.events, {
				'click #pics a': 'pic'
			});

			return events;
		})(),
		initialize: function(){
			RootController.prototype.initialize.apply(this, arguments);

			//TODO: Improve preload for child views
			this.views.pic = new steroids.views.WebView({location: 'http://localhost/views/Gallery/picture.html', id: 'galleryImageView'});

			this.views.pic.preload();

			return this.render();
		},
		pic: function(){
			console.log('try pushing');
			setTimeout(function(){
				steroids.layers.push({
					view: this.views.pic,
					navigationBar: false
				}, {
					onSuccess: function(){
						console.log('success', arguments);
					},
					onFailure: function(){
						console.log('failure', arguments);
					}
				});
			}.bind(this), 1);
		}
	});

	var Pic = Controller.extend({
		id: 'gallery-image-page',
		template: require('http://localhost/javascripts/templates/gallery_image.js'),
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #like': 'like',
				'click .back-button': 'back',
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			return this.render();
		},
		onRender: function(){
			this.dom = {
				likeButton: this.$el.find('#like'),
				likeIcon: this.$el.find('#like i')
			};
		},
		like: function(){
			this.dom.likeIcon.toggleClass('ion-ios7-heart-outline ion-ios7-heart');
		}
	});

	return {
		Index: Index,
		Picture: Pic
	};
});