/* globals define, forge, Backbone, topBarTint */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		events: {
			'click #leftButton': 'onLeftButton',
			'click #headerBrand': 'onLeftButton',
			'click #rightButton': 'onRightButton',
			'swipeup #menu': 'onLeftButton',
			'tap #menu button[root]': 'showRootView'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
		},
		onRender: function(){
			this.dom.menu = this.$el.find('#menu');
		},
		onShow: function(){
			Controller.prototype.onShow.call(this);

			forge.topbar.setTint(topBarTint);
			forge.topbar.setTitle(this.title);
			forge.topbar.removeButtons();
			forge.topbar.addButton({
				icon: 'images/menu@2x.png',
				position: 'left',
				prerendered: true
			}, this.toggleMenu.bind(this));
		},
		onHide: function(){
			this.hideMenu();
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
				
				Backbone.history.navigate(page, {trigger: true});
			}catch(e){
				console.log(e, e.stack);
			}
		},
		toggleMenu: function(){
			var $el = this.dom.menu;
	        var pos = $el.position().top;

	        if(pos < 0){
	          $el.animate({top: 0});
	        }else{
	          $el.animate({top: '-100%'});
	        }
		},
		hideMenu: function(){
			if(this.dom.menu.position().top >=0){
				this.toggleMenu();
			}
		}
	});
});