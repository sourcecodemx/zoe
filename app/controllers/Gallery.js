/* globals define, _, steroids, Camera, Backbone, window */
define(function(require){
	'use strict';

	var RootController = require('http://localhost/controllers/core/Root.js');
	var Detachable     = require('http://localhost/controllers/core/Detachable.js');
	var HTMLModal      = require('http://localhost/ui/Modal.js');
	var Images         = require('http://localhost/collections/ImagesSimple.js');
	var config         = require('config');

	window.config = config;
	
	var Index = RootController.extend({
		id: 'gallery-page',
		template: require('http://localhost/javascripts/templates/gallery.js'),
		title: 'Galeria',
		events: (function () {
			var events = _.extend({}, RootController.prototype.events, {
				'click #take': 'takePicture',
				'click #grab': 'grabPicture'
			});

			return events;
		})(),
		initialize: function(){
			RootController.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

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
			this.listenTo(this.collection, 'prepend', this.prependOne, this);

			//Open picture view
			Backbone.on('gallery:image:show', this.showPicture, this);

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			leftButton.imageAsOriginal = false;
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/refresh.png';
			rightButton.onTap = this.onRightButton.bind(this);
			rightButton.imageAsOriginal = false;

			steroids.view.navigationBar.update({
				title: this.title,
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

			return this.render();
		},
		onRender: function(){
			RootController.prototype.onRender.call(this);

			window.showLoading('Cargando');

			//Pics container
			this.dom.content = this.$el.find('#pics');
			//Load pictures from server
			window.postMessage({message: 'gallery:fetch'});
		},
		onRightButton: function(){
			window.showLoading('Cargando');

			this.removeAll();
			window.postMessage({message: 'gallery:fetch'});
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'galleryView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		addAll: function(){
			if(!this.dom.content.find('.pic').length){
				this.dom.content.empty();
			}

			if(this.collection.length){
				this.collection.each(this.addOne.bind(this));

				//Call show on all images
				_.invoke(this.images, PicItem.prototype.show);
			}else{
				this.onContentError({message: 'No hay imagenes en la galeria.'});
			}

			setTimeout(function(){
				window.hideLoading();
			}, 1000);
		},
		addOne: function(model){
			//Create image view
			var view = new PicItem({
				model: model,
				appendTo: this.dom.content
			});
			//Cache image reference
			this.images[view.cid] = view;

			return this;
		},
		prependOne: function(model){
			var view = new PicItem({
				model: model,
				appendTo: this.dom.content,
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
		showPicture: function(data){
			//Let the view know it can load the image
			window.postMessage({
				message: 'gallery:image:show',
				picture: {
					id: data.objectId,
					url: data.image.url,
					thumbnail: data.thumbnail ? data.thumbnail.url : '',
					likes: data.likes || 0
				}
			});
			//Push view
			setTimeout(function(){
				steroids.layers.push({
					view: this.views.pic
				});
			}.bind(this), 1);
		},
		takePicture: function(){
			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onPictureError.bind(this),
				config.CAMERA.DEFAULT
			);
			window.showLoading('Trabajando');
		},
		grabPicture: function(){
			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onPictureError.bind(this),
				_.extend(
					{},
					config.CAMERA.DEFAULT,
					{ sourceType : Camera.PictureSourceType.PHOTOLIBRARY }
				)
			);
			window.showLoading('Trabajando');
		},
		onSuccess: function(imageData) {
			this.uploadModal.update(imageData).show();
		},
		onPictureError: function() {
			//this.onError(null, {message: message});
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'gallery:fetch:success':
				this.collection.reset(data.images);
				break;
			case 'gallery:fetch:error':
				if(this.dom.content.find('.pic').length){
					this.onError(null, data.error);
				}else{
					this.onContentError(data.error);
				}
				break;
			case 'gallery:image:upvote:success':
			case 'gallery:image:downvote:success':
				this.collection.get(data.id).set('likes', data.likes);
				break;
			}
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
				throw new Error('Gallery.PickItem requires a Backbone Model');
			}

			this.render();
		},
		render: function(){
			//If no thumbnail then go with the original image
			var url = this.model.get('thumbnail') ? this.model.get('thumbnail').url : this.model.get('image').url;
			//Render & show
			this.$el.append(this.template({image: {url: url}}));
			this.$el.hide();

			return this.$el;
		},
		pic: function(){
			Backbone.trigger('gallery:image:show', this.model.toJSON());
		},
		onClose: function(){
			this.model = null;
		}
	});

	

	var UploadModal = HTMLModal.extend({
		template: require('http://localhost/javascripts/templates/gallery_modal_upload.js'),
		events: {
			'click #save': 'save',
			'click button[data-dismiss]': 'hide'
		},
		initialize: function(){
			HTMLModal.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));
		},
		onRender: function(){
			this.dom.image = this.$el.find('#image');
		},
		save: function(){
			if(this.base64Data.length > 0){
				window.showLoading('Guardando');
				window.postMessage({message: 'gallery:image:save', image: this.base64Data});
			}
		},
		update: function(data){
			this.img = new Image();

			window.showLoading('Cargando imagen');

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
			try{
				window.showLoading('Imagen Guardada');

				_.delay(window.hideLoading.bind(window), 1000);

				this.collection.prepend(file);
				this.hide();
			}catch(e){
				this.onError(null, e);
			}
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'gallery:image:success':
				console.log(data, 'passed image');
				this.onSave(data.image);
				break;
			case 'gallery:image:error':
				this.onError(null, data.error);
			}
		}
	});

	return Index;
});