/* globals define, _, steroids, Camera, Parse, Backbone */
define(function(require){
	'use strict';

	var RootController = require('http://localhost/controllers/core/Root.js');
	var Controller     = require('http://localhost/controllers/core/Controller.js');
	var Detachable     = require('http://localhost/controllers/core/Detachable.js');
	var template       = require('http://localhost/javascripts/templates/gallery.js');
	var HTMLModal      = require('http://localhost/ui/Modal.js');
	var File           = require('http://localhost/models/File.js');
	var Images         = require('http://localhost/collections/Images.js');
	var config         = require('config');

	var Index = RootController.extend({
		id: 'gallery-page',
		template: template,
		events: (function () {
			var events = _.extend({}, RootController.prototype.events, {
				'click #take': 'takePicture',
				'click #grab': 'grabPicture'
			});

			return events;
		})(),
		initialize: function(){
			RootController.prototype.initialize.apply(this, arguments);
			//Initialize collection
			this.collection = new Images();
			this.images = {};

			//TODO: Improve preload for child views
			this.views.pic = new steroids.views.WebView({location: 'http://localhost/views/Gallery/picture.html', id: 'galleryImageView'});
			this.views.pic.preload();

			//Create upload modal
			this.uploadModal = new UploadModal({collection: this.collection});

			//Listen for images collection
			this.listenTo(this.collection, 'reset', this.addAll, this);
			this.listenTo(this.collection, 'error', this.onError, this);
			this.listenTo(this.collection, 'prepend', this.prependOne, this);

			//Open picture view
			Backbone.on('gallery:show:image', this.showPicture, this);

			return this.render();
		},
		onRender: function(){
			RootController.prototype.onRender.call(this);

			window.showLoading('Cargando imagenes...');

			//Pics container
			this.dom.pics = this.$el.find('#pics');
			//Load pictures from server
			this.collection.fetch();
		},
		addAll: function(){
			this.collection.each(this.addOne.bind(this));

			//Call show on all images
			_.invoke(this.images, PicItem.prototype.show);

			setTimeout(function(){
				window.hideLoading();
			}, 1000);
		},
		addOne: function(model){
			//Create image view
			var view = new PicItem({
				model: model,
				appendTo: this.dom.pics
			});
			//Cache image reference
			this.images[view.cid] = view;

			return this;
		},
		prependOne: function(model){
			var view = new PicItem({
				model: model,
				appendTo: this.dom.pics,
				prepend: true
			}).show();

			this.images[view.cid] = view;
		},
		removeAll: function(){
			_.invoke(this.images, PicItem.prototype.destroy);
			_.each(this.images, function(i){
				i = null;
			});
			this.images = {};
		},
		//addOne: function(){},
		onError: function(model, error){
			window.hideLoading();
			console.log(error, error.code, 'fetch error');
		},
		showPicture: function(data){
			console.log(data, {id: data.id, image: data.image.url, likes: data.likes || 0}, 'about to post message');
			//Let the view know it can load the image
			window.postMessage({
				message: 'gallery:show:image',
				picture: {
					id: data.id,
					url: data.image.url,
					thumbnail: data.thumbnail ? data.thumbnail.url : '',
					likes: data.likes || 0
				}
			});
			//Push view
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
		},
		takePicture: function(){
			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onFail.bind(this),
				config.CAMERA.DEFAULT
			);
			window.showLoading('Trabajando...');
		},
		grabPicture: function(){
			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onFail.bind(this),
				_.extend(
					{},
					config.CAMERA.DEFAULT,
					{ sourceType : Camera.PictureSourceType.PHOTOLIBRARY }
				)
			);
			window.showLoading('Trabajando...');
		},
		onSuccess: function(imageData) {
			this.uploadModal.update(imageData).show();
		},
		onFail: function(message) {
			window.hideLoading();
			setTimeout(function(){
				navigator.notification.alert('Error', $.noop, 'Ups!');
			}, 1);
			console.log('Failed because: ' + message);
		}
	});

	var PicItem = Detachable.extend({
		template: require('http://localhost/javascripts/templates/gallery_image_item.js'),
		className: 'padding pic',
		events: {
			'click': 'pic'
		},
		initialize: function(options){
			Detachable.prototype.initialize.apply(this, arguments);

			if(!options || !options.model){
				throw new Error('Error: Gallery.PickItem requires a Backbone Model');
			}

			this.render();
		},
		render: function(){
			//If no thumbnail then go with the original image
			var url = this.model.get('thumbnail') ? this.model.get('thumbnail').url() : this.model.get('image').url();
			//Render & show
			this.$el.append(this.template({image: {url: url}}));
			this.$el.hide();

			return this.$el;
		},
		pic: function(){
			Backbone.trigger('gallery:show:image', _.extend({}, this.model.toJSON(), {id: this.model.id}));
		},
		onClose: function(){
			this.model = null;
		}
	});

	var PicView = Controller.extend({
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
			//Add message listener
			this.messageListener();

			this._createImage();

			return this.render();
		},
		onRender: function(){
			this.dom = {
				likeButton: this.$el.find('#like'),
				likeIcon: this.$el.find('#like i'),
				likes: this.$el.find('#likes'),
				image: this.$el.find('#image')
			};
		},
		like: function(){
			this.dom.likeIcon.toggleClass('ion-ios7-heart-outline ion-ios7-heart');
		},
		onImageLoaded: function(){
			this.dom.image.removeAttr('style');
			this.dom.image.append($(this.image).hide().fadeIn());
			this.dom.image.addClass('loaded');
		},
		onMessage: function(event){
			Controller.prototype.onMessage.call(this, event);

			var data = event.data;

			switch(data.message){
			case 'gallery:show:image':
				try{
					this.image.src = data.picture.url;
					this.dom.likes.text(data.picture.likes);
					this.dom.image.css({
						backgroundImage: 'url(' + data.picture.thumbnail + ')'
					});
				}catch(e){
					console.log(e, e.stack);
				}
				break;
			}
		},
		back: function(){
			Controller.prototype.back.call(this);
			// GC image data
			this.dom.image.empty();
			this.dom.image.removeClass('loaded');
			this.image = null;
			this._createImage();
		},
		_createImage: function(){
			this.image = new Image();
			this.image.onload = this.onImageLoaded.bind(this);
		}
	});

	var UploadModal = HTMLModal.extend({
		template: require('http://localhost/javascripts/templates/gallery_modal_upload.js'),
		events: {
			'click #save': 'save',
			'click button[data-dismiss]': 'hide'
		},
		onRender: function(){
			this.dom.image = this.$el.find('#image');
		},
		save: function(){
			if(this.base64Data.length > 0){
				window.showLoading('Guardando...');

				var img = new Parse.File('foto.jpg', { base64: this.base64Data });
				var file = new File({image: img});

				file.save().then(this.onSave.bind(this), this.onError.bind(this));
			}
		},
		update: function(data){
			this.img = new Image();

			window.showLoading('Cargando imagen...');

			this.img.onload = function(){
				window.hideLoading();
				this.dom.image.append($(this.img).addClass('full-image rounded'));
			}.bind(this);

			this.base64Data = data;

			data = 'data:image/jpeg;base64,' + data;

			this.img.src = data;

			return this;
		},
		onHide: function(){
			HTMLModal.prototype.onHide.call(this);

			this.dom.image.empty();
			this.base64Data = null;
			this.img = null;
			this.file = null;
		},
		onShow: function(){
			HTMLModal.prototype.onShow.call(this);

			window.hideLoading();
		},
		onSave: function(file){
			var user = Parse.User.current();
			var images = user.relation('images');
			//Add image to relation;
			images.add(file);
			//Save user relation a
			user
				.save()
				.then(function(){
					return file.fetch();
				}.bind({file: file}))
				.then(function(file){
					window.showLoading('Imagen Guardada');

					_.delay(window.hideLoading.bind(window), 1000);

					return this.collection.prepend(file);
				}.bind({collection: this.collection, hide: this.hide}))
				.then(
					this.hide.bind(this),
					function(error){
						console.log(error, 'errrrrror');
					}
				);
		},
		onError: function(){
			console.log('can not save', arguments);
		}
	});

	return {
		Index: Index,
		Picture: PicView
	};
});