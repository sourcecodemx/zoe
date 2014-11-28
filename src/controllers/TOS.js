/* globals define, _, forge */
define(function(require){
	'use strict';

	var Controller = require('Controller');
	var template = require('templates/tos');
	return Controller.extend({
		id: 'tos-page',
		template: template,
		title: 'Terminos de uso',
		currentLabel: '',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		},
		hide: function(){
			this.bounceOutDown();
			this.trigger('hide');
			_.delay(this._detach.bind(this), 1000);
		},
		onRender: function(){
			this.dom.content = this.$el.find('.page-content');
		},
		onShow: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				icon: 'images/close@2x.png',
				position: 'left',
				prerendered: true
			}, this.hide.bind(this));

			this.bounceInUp();
		}
	});
});