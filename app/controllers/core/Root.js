/* globals define, Timeline, _, Zoe, aspect */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		events: {
			'click #leftButton': 'onLeftButton',
			'click #headerBrand': 'onLeftButton',
			'click #rightButton': 'onRightButton',
			'click #menu button[root]': 'showRootView',
			'click #home': 'home'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);
			
			//Hide menu after showing root views
			aspect.add(this, ['showRootView', 'home'], this.hideMenu.bind(this), 'after');

			//Create home WebView if we're not in it already
			if(!$('body #index-page').length){
				this.views['home'] = new steroids.views.WebView({location: 'http://localhost/index.html', id: 'index'});
			}
		},
		onRender: function(){
			this.dom = {
				menu: this.$el.find('#menu')
			};
		},
		onShow: function(){
			steroids.view.removeLoading();
		},
		onLeftButton: function(){
			this.toggleMenu();
		},
		onRightButton: function(){},
		showRootView: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var $target = $(e.currentTarget);
				var page = $target.attr('data-view');
				var replace = function(){
					steroids.layers.replace(
						{
							view: this.view,
							navigationBar: false,
							keepLoading: false
						},
						{
							onSuccess: function(){
								console.log('success replace', arguments);
							},
							onFailure: function(){
								console.log('failure on replace', arguments);
							}
						}
					);
				};
				var preloaded = false;

				if(page){
					// Check preloaded status
					preloaded = Zoe.storage.getItem(page + '-preloaded') ? true : false;
					// Create webview object if view has been previously loaded (in some other page)
					// or if it does not exists in the views object
					if(preloaded || !this.views[page]){
						this.views[page] = new steroids.views.WebView({location: 'http://localhost/views/' + _.capitalize(page) + '/index.html', id: page + 'View'});
					}
					// If object has not been previously loaded then preload it
					if(!preloaded){
						window.showLoading('Cargando...');
						//Preload the view
						this.views[page].preload({}, {
							onSuccess: function(){
								window.hideLoading();
								//Save load status for other pages to check it
								Zoe.storage.setItem(this.id + '-preloaded', true);
								//Replace the thing
								setTimeout(this.replace.bind({view: this.views[this.id]}), 1);
							}.bind({views: this.views, id: page, replace: replace}),
							onFailure: function(){
								window.hideLoading();
								//Remove preload status
								Zoe.storage.removeItem(this.id + '-preloaded');
								//Delete view if it exists
								if(this.views[this.id]){
									delete this.views[this.id];
								}
								//Alert user
								setTimeout(function(){
									navigator.notification.alert(
                                        'Ha ocurrido un error al cargar la vista, por favor intente de nuevo', 
                                        $.noop, 
                                        'Ups!'
                                    );
								}, 1);
							}.bind({views: this.views, id: page})
						});
					}else{
						// If object has been previously loaded we just need to replace the current
						// layer with the created WebView
						setTimeout(replace.bind({view: this.views[page]}), 1);
					}
				}else{
					throw new Error('NO_DATA_VIEW_DEFINED');
				}
			}catch(e){
				console.log(e, e.stack);
			}
		},
		home: function(){
			steroids.layers.replace({view: this.views.home});
		},
		toggleMenu: function(){
			var pos = this.dom.menu.position().top;
			var el = this.dom.menu;

			if(pos < 0){
				Timeline.fromTo(el, 0.5, {css: {top: '-100%', 'z-index': 9}}, {css: {top: 0, 'z-index': 11}});
			}else{
				Timeline.fromTo(el, 0.5, {css: {top: 0, 'z-index': 9}}, {css: {top: '-100%', 'z-index': 9}});
			}
		},
		hideMenu: function(){
			this.dom.menu.css({top: '-100%', 'z-index': 9});
		}
	});
});