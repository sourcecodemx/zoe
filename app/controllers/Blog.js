/* globals define, _, steroids, ActivityIndicator, Backbone, Zoe */
define(function(require){
	'use strict';

	var RootController = require('http://localhost/controllers/core/Root.js');
	var Detachable     = require('http://localhost/controllers/core/Detachable.js');
	var Blog           = require('http://localhost/collections/BlogSimple.js');
	var config         = require('config');

	var Index = RootController.extend({
		id: 'blog-page',
		template: require('http://localhost/javascripts/templates/blog.js'),
		title: 'Blog',
		events: (function () {
			var events = _.extend({}, RootController.prototype.events, {
				'touchmove #entries': 'checkPosition',
				'touchend #entries': 'onTouchEnd'
			});

			return events;
		})(),
		page: 0,
		initialize: function(){
			RootController.prototype.initialize.apply(this, arguments);

			//TODO: Improve preload for child views
			this.views.entry = new steroids.views.WebView({location: 'http://localhost/views/Blog/entry.html', id: 'blogEntryView'});
			this.views.entry.preload({}, {
				onSuccess: function(){
					Zoe.storage.setItem('blogEntry-preloaded', true);
				}
			});

			window.addEventListener('message', this.onMessage.bind(this));

			this.collection = new Blog();
			this.entries = {};

			this.listenTo(this.collection, 'reset', this.addAll.bind(this));

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/reload@2x.png';
			rightButton.onTap = this.onRightButton.bind(this);

			steroids.view.navigationBar.update({
				title: this.title,
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

			Backbone.on('blog:entry:show', this.onEntry, this);

			return this.render();
		},
		onRender: function(){
			RootController.prototype.onRender.call(this);

			this.dom.content = this.$el.find('#entries');
			this.dom.entryButton = this.$el.find('#entry');
			this.dom.indicator = this.$el.find('.ion-infinite-scroll');

			if(this.online){
				window.postMessage({message: 'blog:fetch'});
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
				window.postMessage({message: 'blog:fetch', page: this.page});
			}else{
				this.offlineError();
			}
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'blogView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		addAll: function(){
			if(!this.dom.content.find('.entry').length){
				this.dom.content.empty();
			}

			if(this.collection.length){
				this.collection.each(this.addOne.bind(this));

				//Call show on all images
				_.invoke(this.entries, Entry.prototype.show);
			}else{
				this.onContentError({message: 'No hay publicaciones en el blog.'});
			}

			setTimeout(function(){
				ActivityIndicator.hide();
			}, 1);
		},
		removeAll: function(){
			_.invoke(this.entries, Entry.prototype.destroy);
			_.each(this.entries, function(i){
				i = null;
			});
			this.entries = {};
		},
		addOne: function(model){
			var view = new Entry({
				model: model,
				appendTo: this.dom.content
			});

			this.entries[view.cid] = view;

			return this;
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'blog:fetch:success':
				this.page++;
				this.collection.reset(data.entries);
				//Remove scrolling class
				if(this.$el.hasClass('scrolling')){
					this.$el.removeClass('active scrolling');
					this.dom.indicator.removeClass('active');
				}
				//Once we get to the end of the blog, display the no-more-entries legend
				if(data.entries.length < config.BLOG.LIMIT){
					this.$el.addClass('end-reached');
					this.dom.content.after('<div id="end" class="padding-large text-center">No hay mas entradas.</div>');
				}
				break;
			case 'blog:fetch:error':
				console.log('blog:fetch:error', this.dom.content.find('.entry').length);
				if(this.dom.content.find('.entry').length){
					this.onError(null, data.error);
				}else{
					this.onContentError(data.error);
				}
				break;
			}
		},
		onEntry: function(data){
			window.postMessage({message: 'blog:entry:show', entry: data});
			this.dom.entryButton.trigger('click');
		},
		onTouchEnd: function(){
			if(this.$el.hasClass('scrolling')){
				this.$el.addClass('active');
				window.postMessage({message: 'blog:fetch', page: this.page});
			}
		}
	});

	var Entry = Detachable.extend({
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		className: 'card list entry',
		template: require('http://localhost/javascripts/templates/blog_entry_item.js'),
		events: {
			'click': 'entry'
		},
		initialize: function(){
			Detachable.prototype.initialize.apply(this, arguments);

			this.render();
		},
		render: function(){
			this.$el.html(this.template({data: this.model.toJSON()}));

			return this;
		},
		entry: function(){
			Backbone.trigger('blog:entry:show', this.model.toJSON());
		}
	});

	return Index;
});