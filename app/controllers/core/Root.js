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
			'click #rightButton': 'onRightButton'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
		},
		toggleMenu: function(){
			Backbone.trigger('header:toggle');
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
			Backbone.trigger('header:hide');
		},
		onLeftButton: function(){
			Backbone.trigger('header:toggle');
		},
		onRightButton: function(){}
	});
});