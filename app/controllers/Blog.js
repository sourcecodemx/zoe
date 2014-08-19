/* globals define, _, Backbone */
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
			this.listenTo(this.collection, 'error', this.onError.bind(this));

			this.collection.fetch();

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.entries = this.$el.find('#entries');
		},
		showLoading: function(){
			window.showLoading('Cargando...');
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
			this.dom.entries.append(view.$el);

			return this;
		},
		onError: function(){
			window.hideLoading();
			setTimeout(function(){
				navigator.notification.alert('No se han podido cargar entradas para el blog.', $.noop, 'Ups!');
			}, 1);
		},
		onRightButton: function(){
			this.collection.fetch();
		}
	});

	var Entry = Backbone.View.extend({
		className: 'card.list',
		template: require('http://localhost/javascripts/templates/blog_entry_item.js'),
		initialize: function(){
			console.log('initialize blog entry view');
			this.render();
		}
	});

	return {
		Index: Index
	};
});