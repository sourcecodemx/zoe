/* globals define, _, Backbone, forge, Parse, File, User  */
define(function(require){
	'use strict';

	var Controller     = require('Root');
	var Detachable     = require('Detachable');
	var HTMLModal      = require('HTMLModal');
	var Images         = require('collections/Images');
	var config         = require('config');
	var File           = require('models/File');

	var Gallery = Controller.extend({
		id: 'gallery-page',
		template: require('templates/gallery'),
		title: 'Galeria',
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
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Initialize collection
			this.collection = new Images();
			this.images = {};

			//Create upload modal
			this.uploadModal = new UploadModal({collection: this.collection});

			//Listen for images collection
			this.listenTo(this.collection, 'reset', this.addAll.bind(this));
			this.listenTo(this.collection, 'error', this.onError.bind(this));
			this.listenTo(this.collection, 'prepend', this.prependOne.bind(this));

			//Open picture view
			Backbone.on('gallery:image:show', this.showPicture, this);

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);
			
			//Pics container
			this.dom.content = this.$el.find('#pics');
			this.dom.indicator = this.$el.find('.ion-infinite-scroll');

			if(this.online){
				this.getImages();
			}else{
				this.onContentError({message: 'No hay conexion a internet.'});
			}
		},
		onShow: function(){
			Controller.prototype.onShow.call(this);
			
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
				$('#end').remove();
				this.$el.removeClass('end-reached');
				this.getImages();
			}else{
				this.offlineError();
			}
		},
		getImages: function(){
			forge.notification.showLoading('Cargando');
			//Paginate
			if(this.page >= 0){
				this.collection.query.skip(this.page*config.GALLERY.LIMIT);
			}

			this.collection.fetch({
				success: function(){
					this.page++;
					//Remove scrolling class
					if(this.$el.hasClass('scrolling')){
						this.$el.removeClass('active scrolling');
						this.dom.indicator.removeClass('active');
					}
					//Once we get to the end of the gallery, display the no-more-photos legend
					if(this.images.length < config.GALLERY.LIMIT){
						this.$el.addClass('end-reached');
						this.dom.content.after('<div id="end" class="padding-large text-center">No hay mas fotografias.</div>');
					}
				}.bind(this),
				error: function(collection, error){
					if(this.dom.content.find('.pic').length){
						this.onError(null, error);
					}else{
						this.onContentError(error);
					}
				}.bind(this)
			});
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
				forge.notification.hideLoading();
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
		showPicture: function(/*data*/){
			/*
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
			*/
		},
		takePicture: function(){
			if(!this.online){
				this.onError(null, {message: 'Es necesaria una conexion a internet para poder guardar tus fotos.'});
				return;
			}

			/*
			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onPictureError.bind(this),
				config.CAMERA.DEFAULT
			);*/
		},
		grabPicture: function(){
			if(!this.online){
				this.onError(null, {message: 'Es necesaria una conexion a internet para poder guardar tus fotos.'});
				return;
			}

			/*
			navigator.camera.getPicture(
				this.onSuccess.bind(this),
				this.onPictureError.bind(this),
				_.extend(
					{},
					config.CAMERA.DEFAULT,
					{ sourceType : Camera.PictureSourceType.PHOTOLIBRARY }
				)
			);*/
		},
		onSuccess: function(imageData) {
			this.uploadModal.update(imageData).show();
		},
		onPictureError: function(message) {
			this.onError(null, {message: message});
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'gallery:image:upvote:success':
			case 'gallery:image:downvote:success':
				this.collection.get(data.id).set('likes', data.likes);
				break;
			}
		},
		onTouchEnd: function(){
			if(this.$el.hasClass('scrolling')){
				this.$el.addClass('active');
				this.getImages();
			}
		}
	});

	var PicItem = Detachable.extend({
		template: require('templates/gallery_image_item'),
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

			return this.render();
		},
		render: function(){
			var model = this.model.toJSON();
			//If no thumbnail then go with the original image
			var url = model.thumbnail ? model.thumbnail.url : model.image.url;

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
		template: require('templates/gallery_modal_upload'),
		events: {
			'click #save': 'save',
			'click button[data-dismiss]': 'hide'
		},
		onRender: function(){
			this.dom.image = this.$el.find('#image');
		},
		save: function(){
			if(this.base64Data.length > 0){
				forge.notification.showLoading('Guardando');

				var img = new Parse.File('foto.jpg', { base64: this.base64Data });
				var file = new File({image: img});

				file.save().then(
					function(){
						var user = User.current();
						var images = user.relation('images');
						//Add image to relation;
						images.add(file);
						this.images.add(file);
						//Save user relation
						user
							.save()
							.then(function(){
								return file.fetch();
							})
							.then(
								this.onSave.bind(this),
								this.onError.bind(this)
							);
					}.bind(this),
					this.onError.bind(this)
				);
			}
		},
		update: function(data){
			this.img = new Image();

			forge.notification.showLoading('Cargando imagen');

			this.img.onload = function(){
				forge.notification.hideLoading();
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

			forge.notification.hideLoading();
		},
		onSave: function(file){
			try{
				forge.notification.hideLoading();
				setTimeout(function(){
					forge.notification.showLoading('Imagen Guardada');
				}, 1);

				_.delay(forge.notification.hideLoading, 1000);

				this.collection.prepend(file);
				this.hide();
			}catch(e){
				this.onError(null, e);
			}
		}
	});

	return Gallery;
});