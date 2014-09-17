/* globals define, _, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		id: 'blog-entry-page',
		template: require('http://localhost/javascripts/templates/blog_entry.js'),
		title: 'Blog',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click a': 'openExternalURL'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
			//Add message listener
			this.messageListener();

			this.backButton = new steroids.buttons.NavigationBarButton({
				title: ''
			});

			steroids.view.navigationBar.update({
				title: this.title,
				backButton: this.backButton
			});

			return this.render();
		},
		clear: function(){
			this.$el.empty();
			this.render();
		},
		update: function(data){
			this.dom.title.html(_.escape(data.title));
			this.dom.img.attr('src', 'http://localhost/images/blog_placeholder.jpg');

			this.dom.content.html(data.contentEncoded);
			this.dom.source.attr('href', data.link);
			steroids.view.navigationBar.update({
				title: _.escape(data.title)
			});

			this.show();
		},
		openExternalURL: function(e){
			try{
				var href = $(e.currentTarget).attr('href');
				var decomposed = href.split('/');

				if(decomposed && (decomposed.length > 1) && (decomposed[0] === 'http:' || decomposed[0] === 'https:')){
					e.preventDefault();
					window.open(href, '_blank', 'location=yes');
				}
			}catch(e){
				this.onError(null, e);
			}
		},
		onRender: function(){
			this.dom.title = this.$el.find('#title');
			this.dom.img = this.$el.find('#hero');
			this.dom.content = this.$el.find('#body');
			this.dom.source = this.$el.find('#source');
		},
		onLayerWillChange: function(event){
			if(event && event.target && (event.target.webview.id === 'blogEntryView')){
				steroids.view.navigationBar.update({
					title: 'Articulo',
					backButton: this.backButton
				});
			}

			if((event.source.webview.id === 'blogEntryView') && (event.target.webview.id = 'blogView')){
				this.hide();
			}
		},
		onMessage: function(event){
			var data = event.data;

			switch(data.message){
			case 'blog:entry:show':
				try{
					this.update(data.entry);
				}catch(e){
					this.onError(null, e);
				}
				break;
			}
		}
	});
});