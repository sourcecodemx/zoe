/* globals define, _, Backbone, forge, Parse, User  */
define(function(require){
	'use strict';

	var Controller     = require('Root');
	var Detachable     = require('Detachable');
	var HTMLModal      = require('HTMLModal');
	var Images         = require('collections/Images');
	var config         = require('config');
	var File           = require('models/File');
	var Photo          = require('GalleryPhoto');

	var Gallery = Controller.extend({
		id: 'gallery-page',
		template: require('templates/gallery'),
		title: 'Galeria',
		titleImage: 'images/titles/gallery.png',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #take': 'takePicture',
				'tap #grab': 'grabPicture',
				'drag #pics': 'checkPosition',
				'release #pics': 'onTouchEnd'
			});

			return events;
		})(),
		page: 0,
		totalPages: 0,
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Initialize collection
			this.collection = new Images();
			this.images = {};
			this.views.photo = new Photo();

			//Create upload modal
			this.uploadModal = new UploadModal({collection: this.collection});

			//Listen for images collection
			this.listenTo(this.collection, 'reset', this.addAll.bind(this));
			this.listenTo(this.collection, 'error', this.onError.bind(this));
			this.listenTo(this.collection, 'prepend', this.prependOne.bind(this));

			Backbone.on('gallery:image:show', this.onPicture, this);
			Backbone.on('gallery:image:prepend', this.onImageSaved, this);

			return this.render();
		},
		getImages: function(){
			//Paginate
			if(this.page >= 0){
				this.collection.query.skip(this.page*config.GALLERY.LIMIT);
			}

			this.collection.fetch();
		},
		countImages: function(){
			var model = Parse.Object.extend('File');
			var query = new Parse.Query(model);

			forge.notification.showLoading('Cargando');
			query.count().then(function(count){
				var totalPages = Math.ceil(count/config.GALLERY.LIMIT);
				if(totalPages){
					this.totalPages = totalPages;
					this.getImages();
				}
			}.bind(this)).fail(this.onError.bind(this));
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);
			
			//Pics container
			this.dom.pics = this.$el.find('#pics');
			this.dom.content = this.$el.find('.page-content');
			this.dom.indicator = this.$el.find('.ion-infinite-scroll');
			this.dom.tabs = this.$el.find('#tabs');

			if(this.online){
				this.countImages();
			}else{
				this.onContentError({message: 'No hay conexion a internet.'});
			}
		},
		onShow: function(){
			Controller.prototype.onShow.call(this);
			
			this.setupButtons();
		},
		setupButtons: function(){
			forge.topbar.addButton({
				icon: 'images/reload@2x.png',
				position: 'right',
				prerendered: true
			}, this.onRightButton.bind(this));
		},
		onRightButton: function(){
			if(this.online){
				this.removeAll();
				//Reset pagination
				this.page = 0;
				this.totalPages = 0;
				$('#galleryEnd').remove();
				this.$el.removeClass('end-reached');
				this.countImages();
			}else{
				this.offlineError();
			}
		},
		addAll: function(){
			this.page++;
			if(!this.dom.pics.find('.pic').length){
				this.dom.pics.empty();
			}

			if(this.$el.hasClass('scrolling')){
				this.$el.removeClass('active scrolling');
				this.dom.indicator.removeClass('active');
			}

			if(this.page === this.totalPages){
				this.$el.addClass('end-reached');
				this.dom.pics.after('<div id="galleryEnd" class="infinite-scroll-end">No hay mas imagenes en la galeria.</div>');
			}

			if(this.collection.length){
				this.collection.each(this.addOne.bind(this));

				//Call show on all images
				_.invoke(this.images, PicItem.prototype.show);
			}else{
				this.onContentError({message: 'No hay imagenes en la galeria.'});
			}

			forge.notification.hideLoading();
		},
		addOne: function(model){
			//Create image view
			var view = new PicItem({
				model: model,
				appendTo: this.dom.pics
			});
			//Cache image reference
			this.images[view.cid] = view;
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
		bounceIn: function(){
			Controller.prototype.onShow.call(this);
			this.dom.content.removeClass('bounceOutLeft').addClass('bounceInLeft');

			_.delay(function(){
				this.dom.content.removeClass('bounceInLeft animated');
			}.bind(this), 1000);

			this.dom.tabs.show();
			this.setupButtons();

			return this;
		},
		onImageSaved: function(file){
			this.collection.prepend(file);
		},
		onPicture: function(model){
			this.dom.content.addClass('bounceOutLeft animated');
			Backbone.trigger('header:hide');
			this.views.photo.update(model).show();
			this.listenToOnce(this.views.photo, 'hide', this.bounceIn.bind(this));
			this.dom.tabs.hide();
		},
		takePicture: function(){
			if(!this.online){
				this.onError(null, {message: 'Es necesaria una conexion a internet para poder guardar tus fotos.'});
				return;
			}

			forge.file.getImage(config.CAMERA.DEFAULT, function(file){
				forge.file.base64(file, this.onSuccess.bind(this), this.onPictureError.bind(this));
			}.bind(this));

		},
		grabPicture: function(){
			if(!this.online){
				this.onError(null, {message: 'Es necesaria una conexion a internet para poder guardar tus fotos.'});
				return;
			}

			forge.file.getImage(config.CAMERA.GALLERY, function(file){
				forge.file.base64(file, this.onSuccess.bind(this), this.onPictureError.bind(this));
			}.bind(this));
		},
		onSuccess: function(imageData) {
			this.uploadModal.update(imageData).show();
		},
		onPictureError: function(message) {
			this.onError(null, {message: message});
		},
		onTouchEnd: function(){
			if(this.$el.hasClass('scrolling')){
				this.$el.addClass('active');
				this.getImages();
			}
		},
		checkPosition: function(e){
			if((this.totalPages <= 1) || (this.page === this.totalPages) || this.$el.hasClass('end-reached')) {
				return false;
			}else{
				Controller.prototype.checkPosition.call(this, e);
			}
		}
	});

	var PicItem = Detachable.extend({
		template: require('templates/gallery_image_item'),
		className: 'padding pic',
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		events: {
			'tap': 'pic'
		},
		initialize: function(options){
			Detachable.prototype.initialize.apply(this, arguments);

			if(!options || !options.model){
				throw new Error('Gallery.PickItem requires a Backbone Model');
			}

			return this.render();
		},
		render: function(){
			var model = this.model.toJSON();
			//If no thumbnail then go with the original image
			var url = model.thumbnail ? model.thumbnail.url : model.image.url;

			//Render & show
			this.$el.append(this.template({image: {url: url}}));
			this.$el.hide();

			this.$el.hammer();

			return this.$el;
		},
		pic: function(){
			Backbone.trigger('gallery:image:show', this.model);
		},
		onClose: function(){
			this.model = null;
		}
	});

	

	var UploadModal = HTMLModal.extend({
		template: require('templates/gallery_modal_upload'),
		events: {
			'tap #save': 'save',
			'tap button[data-dismiss]': 'hide'
		},
		onRender: function(){
			this.dom.image = this.$el.find('#image');
		},
		save: function(){
			if(this.base64Data.length > 0){
				forge.notification.showLoading('Guardando');

				var img = new Parse.File('foto.jpg', { base64: this.base64Data });
				var file = new File({image: img});
				var onSave = function(){
					var user = User.current();
					var images = user.relation('images');
					//Add image to relation;
					images.add(file);
					//Save image to user relation
					user
						.save()
						.then(function(){
							return file.fetch();
						})
						.then(function(f){
							this.onSave(f);
						}.bind(this),function(error){
							this.onError(null, error);
						}.bind(this));
				}.bind(this);

				//Save file
				file.save().then(onSave).fail(this.onError.bind(this));
			}
		},
		update: function(data){
			this.img = new Image();

			forge.notification.showLoading('Cargando imagen');

			this.img.onload = function(){
				forge.notification.hideLoading();

				var $img = $(this.img);
				//Append image 
				this.dom.image.append($img);

				var w = $img.width();
				var h = $img.height();
				
				if(w > h){
					this.dom.image.addClass('horizontal');
				}else if(h > w){
					this.dom.image.addClass('vertical');
				}

				
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

			forge.notification.hideLoading();
		},
		onSave: function(file){
			try{
				forge.notification.hideLoading();
				forge.notification.showLoading('Imagen Guardada');

				_.delay(forge.notification.hideLoading, 2000);

				Backbone.trigger('gallery:image:prepend', file);
				this.hide();
			}catch(e){
				this.onError(null, e);
			}
		}
	});

	return Gallery;
});