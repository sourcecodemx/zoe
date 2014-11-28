/* globals define, _, forge, User */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var Photo = require('models/File');

	return Controller.extend({
		id: 'gallery-image-page',
		template: require('templates/gallery_image'),
		title: 'Foto',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #like.upvote': 'upvote',
				'tap #like.downvote': 'downvote'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			this.model = new Photo();
			
			this._createImage();

			return this.render();
		},
		onRender: function(){
			this.dom = {
				likeButton: this.$el.find('#like'),
				likeIcon: this.$el.find('#like i'),
				likes: this.$el.find('#likes'),
				image: this.$el.find('#image'),
				refresher: this.$el.find('.block-refresher'),
				content: this.$el.find('.page-content')
			};

			this.dom.refresher.addClass('active');
		},
		onImageLoaded: function(){
			this.dom.refresher.removeClass('active');
			this.dom.image.append(this.image);
			this.dom.image.addClass('loaded animated flipInX');
		},
		hide: function(){
			this.dom.content.addClass('bounceOutRight animated');
			this.trigger('hide');
			_.delay(this._detach.bind(this), 1000);

			this.model.stopListening(this.model);
		},
		onShow: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));

			this.dom.content.removeClass('bounceOutRight').addClass('bounceInRight');

			_.delay(function(){
				this.dom.content.removeClass('bounceInRight animated');
			}.bind(this), 1000);
		},
		update: function(model){
			try{
				var user = User.current().toJSON();
				var isLiked = user.likedImages ? user.likedImages.some(function(val){return val === model.id;}) : false;
				var data = model.toJSON();

				this.model = model;
				this.image.src = data.cropped ? data.cropped.url : data.image.url;
				this.dom.likes.text(data.likes || 0);

				if(isLiked){
					this.dom.likeIcon.removeClass('ion-ios7-heart-outline').addClass('ion-ios7-heart');
					this.dom.likeButton.removeClass('upvote').addClass('downvote');
				}else{
					this.dom.likeIcon.addClass('ion-ios7-heart-outline').removeClass('ion-ios7-heart');
					this.dom.likeButton.addClass('upvote').removeClass('downvote');
				}

				this.listenTo(this.model, 'change:likes', this.updateLikes, this);
			}catch(e){
				console.log(e, e.stack, e.message);
			}

			return this;
		},
		updateLikes: function(model){
			this.dom.likes.text(model.get('likes'));
		},
		upvote: function(){
			if(this.dom.likeButton.attr('disabled')){
				return;
			}

			this.dom.likeIcon.removeClass('ion-ios7-heart-outline').addClass('ion-ios7-heart');
			this.dom.likeButton.removeClass('upvote').addClass('downvote').prop('disabled', true);
			this.model
				.increment('likes')
				.save()
					.then(function(){
						this.dom.likeButton.removeAttr('disabled');
						return User.current().addUnique('likedImages', this.model.id).save();
					}.bind(this));
		},
		downvote: function(){
			var currentLikes = this.model.get('likes');
			
			if(this.dom.likeButton.attr('disabled') || (parseInt(currentLikes, 10) === 0)){
				return;
			}

			this.dom.likeIcon.addClass('ion-ios7-heart-outline').removeClass('ion-ios7-heart');
			this.dom.likeButton.addClass('upvote').removeClass('downvote').prop('disabled', true);
			this.model
				.increment('likes', -1)
				.save()
					.then(function(){
						this.dom.likeButton.removeAttr('disabled');
						return User.current().remove('likedImages', this.model.id).save();
					}.bind(this));
			
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