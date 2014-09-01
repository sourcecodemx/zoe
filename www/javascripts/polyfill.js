/* global define */
define(
	'polyfill',
	[
		'backbone'
	],
	function(Backbone){
		'use strict';

		/** 
		* Add close method to Backbone.View's prototype
		* 
		* Unbinds events, executes onClose method if defines
		* triggers 'close' event, if desired we will remove
		* the DOM elements
		*
		* TODO: Improve removing DOM elements
		*/
		Backbone.View.prototype.close = function (remove) {
			this.unbind();

			if (this.onClose) {
				this.onClose();
			}

			this.trigger('close');

			if (remove) {
				this.remove();
				this.trigger('remove');
			}
		};

		/** 
		* Add destroy method to Backbone.View's prototype
		* 
		* Closes and removes DOM
		*/
		Backbone.View.prototype.destroy = function () {
			this.close(true);
		};

		/**
		* @override
		*
		* Add Backbone.View events replacement for mobile
		*/
		var _initialize = Backbone.View.prototype.initialize;
		Backbone.View.prototype.initialize = function(){
			//TODO: Remove this.mobile references
			this.mobile = true;//Support old code
			//Initialize default objects
			this.views = {};
			this.dom = {};
			this.data = {};
			this.mc = null;//mcHammerjs

			return _initialize.apply(this, arguments);
		};
	}
);