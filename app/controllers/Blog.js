/* globals define, _, steroids, ActivityIndicator  */
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

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.content = this.$el.find('#entries');

			window.postMessage({message: 'blog:fetch'});
		},
		onRightButton: function(){
			ActivityIndicator.show('Cargando');

			this.removeAll();
			window.postMessage({message: 'blog:fetch'});
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'blogView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		addAll: function(){
			this.collection.each(this.addOne.bind(this));

			//Call show on all images
			_.invoke(this.entries, Entry.prototype.show);

			ActivityIndicator.hide();
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
		}
	});

	var Entry = Detachable.extend({
		showFx: 'slideDown',
		hideFx: 'fadeOut',
		className: 'card list',
		template: require('http://localhost/javascripts/templates/blog_entry_item.js'),
		initialize: function(){
			Detachable.prototype.initialize.apply(this, arguments);

			this.render();
		},
		render: function(){
			this.$el.html(this.template({data: this.model.toJSON()}));

			return this;
		}
	});

	return Index;
});