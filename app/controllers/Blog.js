/* globals define, _, forge, Backbone */
define(function(require){
	'use strict';

	var Controller  = require('Root');
	var Detachable  = require('Detachable');
	var Blog        = require('collections/Blog');
	var config      = require('config');

	var Index = Controller.extend({
		id: 'blog-page',
		template: require('templates/blog'),
		title: 'Blog',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'drag #entries': 'checkPosition',
				'release #entries': 'onTouchEnd'
			});

			return events;
		})(),
		page: 0,
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			this.collection = new Blog();
			this.entries = {};

			this.listenTo(this.collection, 'reset', this.addAll.bind(this));

			Backbone.on('blog:entry:show', this.onEntry, this);

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.content = this.$el.find('#entries');
			this.dom.entryButton = this.$el.find('#entry');
			this.dom.indicator = this.$el.find('.ion-infinite-scroll');

			if(this.online){
				this.getEntries();
			}else{
				this.onContentError({message: 'No hay conexion a internet.'});
			}
		},
		getEntries: function(){
			forge.notification.showLoading('Cargando');
			//Paginate
			if(this.page >= 0){
				this.collection.query.skip(this.page*config.BLOG.LIMIT);
			}

			this.collection.fetch({
				success: function(){
					this.page++;
					//Remove scrolling class
					if(this.$el.hasClass('scrolling')){
						this.$el.removeClass('active scrolling');
						this.dom.indicator.removeClass('active');
					}
					//Once we get to the end of the blog, display the no-more-entries legend
					if(this.collection.length < config.BLOG.LIMIT){
						this.$el.addClass('end-reached');
						this.dom.content.after('<div id="end" class="padding-large text-center">No hay mas entradas.</div>');
					}
				}.bind(this),
				error: function(collection, error){
					if(this.dom.content.find('.entry').length){
						this.onError(null, error);
					}else{
						this.onContentError(error);
					}
				}.bind(this)
			});
		},
		onRightButton: function(){
			if(this.online){
				this.removeAll();
				//Reset pagination
				this.page = 0;
				$('#end').remove();
				this.$el.removeClass('end-reached');
				this.getEntries();
			}else{
				this.offlineError();
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
				forge.notification.hideLoading();
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
		onEntry: function(/*data*/){
			//window.postMessage({message: 'blog:entry:show', entry: data});
			//this.dom.entryButton.trigger('click');
		},
		onTouchEnd: function(){
			if(this.$el.hasClass('scrolling')){
				this.$el.addClass('active');
				this.getEntries();
			}
		},
		onShow: function(){
			Controller.prototype.onShow.call(this);

			forge.topbar.addButton({
				icon: 'images/reload@2x.png',
				position: 'right',
				prerendered: true
			}, this.onRightButton.bind(this));
		}
	});

	var Entry = Detachable.extend({
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		className: 'card list entry',
		template: require('templates/blog_entry_item'),
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