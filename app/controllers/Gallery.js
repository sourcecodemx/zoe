/* globals define, _, steroids, Camera, Parse */
define(function(require){
	'use strict';

	var RootController = require('http://localhost/controllers/core/Root.js');
	var Controller     = require('http://localhost/controllers/core/Controller.js');
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
				'click #pics a': 'pic',
				'click #take': 'takePicture',
				'click #grab': 'grabPicture'
			});

			return events;
		})(),
		initialize: function(){
			RootController.prototype.initialize.apply(this, arguments);
			//Initialize collection
			this.collection = new Images();

			//TODO: Improve preload for child views
			this.views.pic = new steroids.views.WebView({location: 'http://localhost/views/Gallery/picture.html', id: 'galleryImageView'});

			this.views.pic.preload();

			this.uploadModal = new UploadModal();

			//Listen for images
			this.listenTo(this.collection, 'reset', this.addAll, this);
			this.listenTo(this.collection, 'error', this.onError, this);

			return this.render();
		},
		onRender: function(){
			RootController.prototype.onRender.call(this);

			this.dom.pics = this.$el.find('#pics');

			window.showLoading('Cargando imagenes...');

			this.collection.fetch();
		},
		addAll: function(){
			var imgs = [];
			var template = require('http://localhost/javascripts/templates/gallery_image_item.js');
			var pics = this.collection.toJSON();

			_.each(pics, function(p){
				this.images.push(this.template({image: p.image}));
			}.bind({images: imgs, template: template}));
			
			//Create dom string
			this.dom.pics.append(imgs.join(''));

			setTimeout(function(){
				window.hideLoading();
			}, 1000);
		},
		//addOne: function(){},
		onError: function(model, error){
			window.hideLoading();
			console.log(error, error.code, 'fetch error');
		},
		pic: function(){
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

	var UploadModal = HTMLModal.extend({
		template: require('http://localhost/javascripts/templates/gallery_modal_upload.js'),
		events: (function () {
			var events = _.extend({}, HTMLModal.prototype.events, {
				'click #save': 'save'
			});

			return events;
		})(),
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
			this.img.src = null;
			this.img = null;
			this.file = null;
		},
		onShow: function(){
			window.hideLoading();
		},
		onSave: function(file){
			console.log('imagen guardada', file, file.toJSON());

			var user = Parse.User.current();
			var images = user.relation('images');
			//Add image to relation;
			images.add(file);
			//Save user relation
			user.save().then(function(){
				console.log('user saved too', arguments);
				window.showLoading('Imagen Guardada');
				setTimeout(function(){
					window.hideLoading();
					this.hide();
				}.bind(this), 2000);
			}.bind(this), function(model, error){
				console.log(error, error.code, 'error saving user');
			}.bind(this));
		},
		onError: function(){
			console.log('can not save', arguments);
		}
	});

	return {
		Index: Index,
		Picture: Pic
	};
});