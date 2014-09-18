/* globals define, _, steroids, ActivityIndicator, Backbone, Zoe */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var Detachable = require('http://localhost/controllers/core/Detachable.js');
	var Blog       = require('http://localhost/collections/BlogSimple.js');

	var Index = Controller.extend({
		id: 'blog-page',
		template: require('http://localhost/javascripts/templates/blog.js'),
		title: 'Blog',
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

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
			Controller.prototype.onRender.call(this);

			this.dom.content = this.$el.find('#entries');
			this.dom.entryButton = this.$el.find('#entry');

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
				window.postMessage({message: 'blog:fetch'});
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
				this.collection.reset(data.entries);
				break;
			case 'blog:fetch:error':
				if(this.dom.content.find('.card').length){
					this.onError(null, data.error);
				}else{
					this.onContentError(data.error);
				}
			}
		},
		onEntry: function(data){
			window.postMessage({message: 'blog:entry:show', entry: data});
			this.dom.entryButton.trigger('click');
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