/* globals define, _, Backbone, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');
	var template = require('http://localhost/javascripts/templates/blog.js');
	var Collection = require('http://localhost/collections/Blog.js');

	var Index = Controller.extend({
		id: 'blog-page',
		template: template,
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {

			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.collection = new Collection();
			this.entries = {};

			this.listenTo(this.collection, 'request', this.showLoading.bind(this));
			this.listenTo(this.collection, 'reset', this.addAll.bind(this));
			this.listenTo(this.collection, 'error', this.onContentError.bind(this));

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/refresh.png';
			rightButton.onTap = this.onRightButton.bind(this);

			steroids.view.navigationBar.update({
				title: 'Blog',
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

			this.collection.fetch();

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.content = this.$el.find('#entries');
		},
		showLoading: function(){
			window.showLoading('Cargando');
		},
		addAll: function(){
			this.collection.each(this.addOne.bind(this));

			window.hideLoading();
		},
		addOne: function(model){
			var view = new Entry({
				model: model
			});

			this.entries[view.cid] = view;
			this.dom.content.append(view.$el);

			return this;
		},
		onRightButton: function(){
			this.collection.fetch();
		}
	});

	var Entry = Backbone.View.extend({
		className: 'card.list',
		template: require('http://localhost/javascripts/templates/blog_entry_item.js'),
		initialize: function(){
			this.render();
		}
	});

	return {
		Index: Index
	};
});