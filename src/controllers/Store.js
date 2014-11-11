/* globals define */
define(function(require){
	'use strict';

	var Controller = require('Root');

	return Controller.extend({
		id: 'store-page',
		template: require('templates/store'),
		title: 'Tienda',
		titleImage: 'images/titles/store.png',
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		}
	});
});