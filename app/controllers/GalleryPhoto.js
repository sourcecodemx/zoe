/* globals define, _, forge, User, Backbone */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var Photo = require('models/File');

	return Controller.extend({
		id: 'gallery-image-page',
		template: require('templates/gallery_image'),
		title: 'Foto',
		editing: false,
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #like.upvote': 'upvote',
				'tap #like.downvote': 'downvote',
				'tap #edit': 'edit',
				'tap #delete': 'remove',
				'tap #save': 'save',
				'tap #cancel': 'cancel',
				'change #caption-wrapper-text': 'onCaptionChange',
				'keyup #caption-wrapper-text': 'onCaptionChange'
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
				likeArea: this.$el.find('#like-area'),
				likeButton: this.$el.find('#like'),
				likeIcon: this.$el.find('#like i'),
				likes: this.$el.find('#likes'),
				image: this.$el.find('#image'),
				refresher: this.$el.find('.block-refresher'),
				content: this.$el.find('.scroll-content'),
				caption: this.$el.find('#caption-wrapper'),
				user: this.$el.find('#owner'),
				tabs: this.$el.find('#tabs-gallery-photo'),
				editTabs: this.$el.find('#tabs-gallery-photo-edit'),
				captionArea: this.$el.find('#caption-wrapper-text'),
				saveButton: this.$el.find('#save')
			};

			this.dom.refresher.addClass('active');
		},
		onImageLoaded: function(){
			this.dom.refresher.removeClass('active');
			this.dom.image.append(this.image);
			this.dom.image.addClass('loaded animated flipInX');
		},
		hide: function(){
			var hide = function(){
				this.dom.content.addClass('bounceOutRight animated').removeClass('has-tabs');
				this.dom.tabs.addClass('hide');
				this.dom.caption.hide();
				this.dom.user.hide();
				this.trigger('hide');

				this.stopListening(this.model);

				_.delay(this._detach.bind(this), 1000);
			}.bind(this);

			if(this.editing){
				forge.notification.confirm('Hey', 'Estas editando una foto ¿Seguro que deseas cancelar?', 'Si, seguro', 'No', function(ok){
					if(ok){
						this.editing = false;
						this.dom.editTabs.addClass('hide');
						this.dom.likeArea.show();
						this.dom.caption.show();
						this.dom.captionArea.hide().val('');
						hide();
					}
				}.bind(this));
			}else{
				hide();
			}
		},
		onShow: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));
			forge.topbar.addButton({
				icon: 'images/share@2x.png',
				position: 'right',
				prerendered: true
			}, this.onRightButton.bind(this));

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
				var owner = model.get('owner');

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

				if(this.model.get('caption')){
					this.dom.caption.text(this.model.escape('caption')).removeClass('hide').show();
				}

				if(owner){
					this.dom.user.text(owner.get('username')).removeClass('hide').show();
				}

				if(owner && owner.id === User.current().id){
					this.dom.tabs.removeClass('hide');
					this.dom.content.addClass('has-tabs');
				}

				this.listenTo(this.model, 'change:likes', this.updateLikes, this);
				this.listenTo(this.model, 'change:caption', this.updateCaption, this);
			}catch(e){
				console.log(e, e.stack, e.message);
			}

			return this;
		},
		updateLikes: function(model){
			this.dom.likes.text(model.get('likes'));
		},
		updateCaption: function(model){
			this.dom.caption.text(model.get('caption'));
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
			// GC image data
			this.dom.image.empty();
			this.image = null;
			this.$el.empty();
			this._createImage();

			return this;
		},
		onRightButton: function(){
			//console.log('Share image');
		},
		edit: function(){
			var owner = this.model.get('owner');
			var current = User.current().id;

			if(owner && owner.id === current){
				this.editing = true;
				this.dom.tabs.addClass('hide');
				this.dom.editTabs.removeClass('hide');
				this.dom.likeArea.hide();

				var caption = this.dom.caption.text();
				this.dom.caption.hide();
				this.dom.captionArea.show().val(caption);
			}
		},
		remove: function(){
			var owner = this.model.get('owner');
			var current = User.current().id;

			if(owner && owner.id === current){
				var onRemove = function(remove){
					if(remove){
						Backbone.trigger('gallery:image:destroy', this.model.id);
						this.hide();
					}
				}.bind(this);
				forge.notification.confirm('Hey', '¿Seguro que deseas eliminar tu foto?', 'Si, eliminar', 'No', onRemove);
			}
		},
		save: function(){
			var owner = this.model.get('owner');
			var current = User.current().id;

			if(owner && owner.id === current){
				forge.notification.showLoading('Guardando...');
				this.model
					.set('caption', this.dom.captionArea.val())
					.save(null)
					.then(function(){
						forge.notification.showLoading('¡Listo!.');
						_.delay(forge.notification.hideLoading, 2000);
						this.cancel();
					}.bind(this))
					.fail(function(){
						forge.notification.hideLoading();
						forge.notification.alert('¡Ups!', 'Ha ocurrido un error al guardar los datos de tu foto, por favor intenta de nuevo.');
					});
			}
		},
		cancel: function(){
			this.editing = false;
			this.blur();
			this.dom.tabs.removeClass('hide');
			this.dom.editTabs.addClass('hide');
			this.dom.likeArea.show();
			this.dom.caption.show();
			this.dom.captionArea.hide().val('');
		},
		onCaptionChange: function(){
			var hasChanged = this.dom.captionArea.val() === this.model.get('caption');

			if(hasChanged){
				this.dom.saveButton.addClass('disabled').prop('disabled', true);
			}else{
				this.dom.saveButton.removeClass('disabled').removeAttr('disabled');
			}
		},
		_createImage: function(){
			this.image = new Image();
			this.image.onload = this.onImageLoaded.bind(this);
		}
	});
});