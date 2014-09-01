/* globals define, _, steroids, Zoe */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var config = require('config');

	return Controller.extend({
		id: 'gallery-image-page',
		template: require('http://localhost/javascripts/templates/gallery_image.js'),
		title: 'Foto',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #like.upvote': 'upvote',
				'click #like.downvote': 'downvote'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);
			//Add message listener
			this.messageListener();

			this._createImage();

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: '',
				onTap: this.back.bind(this)
			});

			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			return this.render();
		},
		onRender: function(){
			this.dom = {
				likeButton: this.$el.find('#like'),
				likeIcon: this.$el.find('#like i'),
				likes: this.$el.find('#likes'),
				image: this.$el.find('#image'),
				refresher: this.$el.find('.block-refresher')
			};

			this.dom.refresher.addClass('active');
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'galleryImageView')){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},

		onLayerChange: function(event){
			if(event && event.source && (event.source.webview.id === 'galleryImageView')){
				this.clear().render();
			}
		},
		onImageLoaded: function(){
			this.dom.refresher.removeClass('active');
			this.dom.image.append($(this.image).hide().fadeIn());
			this.dom.image.addClass('loaded');
		},
		onMessage: function(event){
			Controller.prototype.onMessage.call(this, event);

			var data = event.data;

			switch(data.message){
			case 'gallery:image:show':
				try{
					var user = Zoe.storage.getItem('Parse/' + config.PARSE.ID + '/currentUser');
					var isLiked = user.likedImages.some(function(val){return val === data.picture.id;});

					this.currentPicture = data.picture;
					this.image.src = data.picture.url;
					this.dom.likes.text(data.picture.likes);

					if(isLiked){
						this.dom.likeIcon.removeClass('ion-ios7-heart-outline').addClass('ion-ios7-heart');
						this.dom.likeButton.removeClass('upvote').addClass('downvote');
					}
				}catch(e){
					this.onError(null, e);
				}
				break;
			case 'gallery:image:upvote:success':
			case 'gallery:image:downvote:success':
			case 'gallery:image:vote:error':
				this.dom.likeButton.removeAttr('disabled');
				break;
			}
		},
		upvote: function(){
			if(this.dom.likeButton.attr('disabled')){
				return;
			}

			var currLikes = parseInt(this.currentPicture.likes, 10) + 1;
			this.currentPicture.likes = currLikes;

			this.dom.likeIcon.removeClass('ion-ios7-heart-outline').addClass('ion-ios7-heart');
			this.dom.likeButton.removeClass('upvote').addClass('downvote').attr('disabled', true);

			this.dom.likes.text(currLikes);
			window.postMessage({message: 'gallery:image:upvote', id: this.currentPicture.id});
		},
		downvote: function(){
			if(this.dom.likeButton.attr('disabled') || (parseInt(this.currentPicture.likes, 10) === 0)){
				return;
			}

			var currLikes = parseInt(this.currentPicture.likes, 10) - 1;
			this.currentPicture.likes = currLikes;

			this.dom.likeIcon.addClass('ion-ios7-heart-outline').removeClass('ion-ios7-heart');
			this.dom.likeButton.addClass('upvote').removeClass('downvote').attr('disabled', true);

			this.dom.likes.text(currLikes);
			window.postMessage({message: 'gallery:image:downvote', id: this.currentPicture.id});
		},
		clear: function(){
			// Controller.prototype.back.call(this);
			// GC image data
			this.dom.image.empty();
			this.image = null;
			this.$el.empty();
			this._createImage();

			return this;
		},
		_createImage: function(){
			this.image = new Image();
			this.image.onload = this.onImageLoaded.bind(this);
		}
	});
});