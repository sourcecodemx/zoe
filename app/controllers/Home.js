/* globals define, Timeline, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');
	var template = require('http://localhost/javascripts/templates/home.js');

	var Index = Controller.extend({
		id: 'home',
		template: template,
		events: {
			'click .toggle-menu': 'toggleMenu',
			'click #settingsButton': 'settings'
		},
		initialize: function(){
			Controller.prototype.initialize.call(this, arguments);

			this.settingsView = new steroids.views.WebView({
				location: 'http://localhost/views/Settings/index.html',
				id: 'settingsView'
			});
			//Preload view
			this.settingsView.preload();

			return this.render();
		},
		onRender: function(){
			this.dom = {
				menu: this.$el.find('#menu')
			};
		},
		toggleMenu: function(){

			console.log('menu');
			var pos = this.dom.menu.position().top;
			var el = this.dom.menu;
			console.log(pos, 'position');
			if(pos < 0){
				Timeline.fromTo(el, 0.5, {css: {top: '-100%', 'z-index': 9}}, {css: {top: 0, 'z-index': 11}});
			}else{
				Timeline.fromTo(el, 0.5, {css: {top: 0, 'z-index': 9}}, {css: {top: '-100%', 'z-index': 9}});
			}
		},
		settings: function(){
			setTimeout(function(){
				steroids.layers.push({
					view: this.settingsView,
					navigationBar: false
				});
			}.bind(this), 1);
		}
	});

	return {
		Index: Index
	};
});