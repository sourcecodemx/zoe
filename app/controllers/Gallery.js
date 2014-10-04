/* globals define, _, steroids, Camera, Backbone, window, ActivityIndicator  */
define(function(require){
	'use strict';

	//require('swipe');

	var RootController = require('http://localhost/controllers/core/Root.js');
	var Detachable     = require('http://localhost/controllers/core/Detachable.js');
	var HTMLModal      = require('http://localhost/ui/Modal.js');
	var Images         = require('http://localhost/collections/ImagesSimple.js');
	var config         = require('config');

	var Index = RootController.extend({
		id: 'gallery-page',
		template: require('http://localhost/javascripts/templates/gallery.js'),
		title: 'Galeria',
		events: (function () {
			var events = _.extend({}, RootController.prototype.events, {
				'click #take': 'takePicture',
				'click #grab': 'grabPicture',
				'touchmove #pics': 'checkPosition',
				'touchend #pics': 'onTouchEnd'
			});

			return events;
		})(),
		page: 0,
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
			leftButton.imagePath = '/images/menu@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			leftButton.imageAsOriginal = false;
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/reload@2x.png';
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
			
			//Pics container
			this.dom.content = this.$el.find('#pics');
			this.dom.indicator = this.$el.find('.ion-infinite-scroll');

			if(this.online){
				ActivityIndicator.show('Cargando');
				window.postMessage({message: 'gallery:fetch'});
			}else{
				this.onContentError({message: 'No hay conexion a internet.'});
			}
		},
		onRightButton: function(){
			if(this.online){
				ActivityIndicator.show('Cargando');
				this.removeAll();
				//Reset pagination
				this.page = 0;
				$('#end').remove();
				this.$el.removeClass('end-reached');
				window.postMessage({message: 'gallery:fetch', page: this.page});
			}else{
				this.offlineError();
			}
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
				ActivityIndicator.hide();
			}, 1);
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
			if(!this.online){
				this.onError(null, {message: 'Es necesaria una conexion a internet para poder guardar tus fotos.'});
				return;
			}

			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onPictureError.bind(this),
				config.CAMERA.DEFAULT
			);
		},
		grabPicture: function(){
			if(!this.online){
				this.onError(null, {message: 'Es necesaria una conexion a internet para poder guardar tus fotos.'});
				return;
			}

			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onPictureError.bind(this),
				_.extend(
					{},
					config.CAMERA.DEFAULT,
					{ sourceType : Camera.PictureSourceType.PHOTOLIBRARY }
				)
			);
		},
		onSuccess: function(imageData) {
			console.log('success', imageData);
			this.uploadModal.update(imageData).show();
		},
		onPictureError: function(message) {
			console.log(message, 'picture error');
			//this.onError(null, {message: message});
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'gallery:fetch:success':
				this.page++;
				this.collection.reset(data.images);
				//Remove scrolling class
				if(this.$el.hasClass('scrolling')){
					this.$el.removeClass('active scrolling');
					this.dom.indicator.removeClass('active');
				}
				//Once we get to the end of the gallery, display the no-more-photos legend
				if(data.images.length < config.GALLERY.LIMIT){
					this.$el.addClass('end-reached');
					this.dom.content.after('<div id="end" class="padding-large text-center">No hay mas fotografias.</div>');
				}
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
		},
		onTouchEnd: function(){
			if(this.$el.hasClass('scrolling')){
				this.$el.addClass('active');
				window.postMessage({message: 'gallery:fetch', page: this.page});
			}
		}
	});

	var PicItem = Detachable.extend({
		template: require('http://localhost/javascripts/templates/gallery_image_item.js'),
		className: 'padding pic',
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
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
				ActivityIndicator.show('Guardando');
				window.postMessage({message: 'gallery:image:save', image: this.base64Data});
			}
		},
		update: function(data){
			this.img = new Image();

			ActivityIndicator.show('Cargando imagen');

			this.img.onload = function(){
				ActivityIndicator.hide();
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

			ActivityIndicator.hide();
		},
		onSave: function(file){
			try{
				ActivityIndicator.hide();
				setTimeout(function(){
					ActivityIndicator.show('Imagen Guardada');
				}, 1);

				_.delay(ActivityIndicator.hide, 1000);

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
				this.onSave(data.image);
				break;
			case 'gallery:image:error':
				this.onError(null, data.error);
			}
		}
	});

	return Index;
});