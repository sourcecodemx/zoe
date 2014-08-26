/* globals define, Timeline, _, Zoe, aspect */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Controller.js');

	return Controller.extend({
		events: {
			'click #leftButton': 'onLeftButton',
			'click #rightButton': 'onRightButton',
			'submit': 'submit'
		},
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);
		},
		onShow: function(){
			steroids.view.removeLoading();
		},
		onLeftButton: function(){
			setTimeout(function(){
				steroids.modal.hide();
			}, 1);
		}
	});
});