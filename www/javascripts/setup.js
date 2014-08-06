/* global define, steroids */
define(
	'setup',
	[
		'underscore',
		'backbone',
		'parse',
		'config',
		'hammerjs',
		'jqueryhammer'
	],
	function(_, Backbone, Parse, config){
		'use strict';

		// Set the views' default backround
		steroids.view.setBackgroundColor('#33465d');

		//Initialize Parse
		Parse.initialize(config.PARSE.ID, config.PARSE.JSKEY);

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

		//ShowLoading global function
		/**
		 * @method
		 * @scope window
		 * @name showLoading
		 * @description Adds loading CSS classes to body, appends spinner
		 *              and overlay to body, sets passed label to be displayed
		 *              whitin the spinner component, needs CSS styling for proper
		 *              working
		 * @param String label label to be displayed whitin the spinner
		 * @param Object onSuccess callback to be executed after successfully executing the method
		 * @param Object onError callback to be executed when an error is thrown
		 * window.showLoading('Loading...', function(){}, function(){});
		 *
		 */
		window.showLoading = function (label, onSuccess, onError) {
			try {
				var $body = $('body');
				var show = function () {
					this.spinner.show();
					this.overlay.show();
				}.bind(this);

				$('body').addClass('loading');

				if (this.spinner) {
					show();
				} else {
					this.overlay = $('<div id="spinner-overlay"></div>');
					this.spinner = $('<div id="spinner"></div>');
					$body.append(this.overlay);
					$body.append(this.spinner);
				}

				if ((_.isString(label) && this.spinner) && (this.spinner.html() !== label)) {
					this.spinner.html(label);
				}

				if (_.isFunction(onSuccess)) {
					onSuccess();
				}
			} catch (e) {
				console.log('An error occurred while trying to display the spinner', e.stack);
				if (_.isFunction(onError)) {
					onError();
				}
			}
		};

		/**
		* @method
		* @scope window
		* @name hideLoading
		* @description returns body to its pre-loading state
		*/
		window.hideLoading = function () {
			try{
				$('body').removeClass('loading');

				if (this.spinner) {
					this.spinner.hide();
				}
				if (this.overlay) {
					this.overlay.hide();
				}
			}catch(e){
				console.log('An error occurred while trying to hide the spinner', e, e.stack, e.message);
			}
		};

		//setup ajax error handling
		$.ajaxSetup({
			statusCode: {
				403: function() {
					Backbone.trigger('deauthorized');
				}
			}
		});
	}
);