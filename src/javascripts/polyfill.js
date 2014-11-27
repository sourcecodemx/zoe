/* global define */
define(
	'polyfill',
	[
		'underscore',
		'backbone',
		'Redirect'
	],
	function(_, Backbone, Redirect){
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

		if(!window.ActivityIndicator){
			window.ActivityIndicator = {show: function(){}, hide: function(){}};
		}

		/**
		* Override loadUrl method
		* 
		* Kepp track of history changes, try loading the passed url
		* if any error is catched then we can easily redirect users
		* to the default error page or the defined page with a redirect
		* exception
		*/
		var originalLoadUrl = Backbone.History.prototype.loadUrl;

		Backbone.History.prototype.loadUrl = function (hash) {
			hash = hash || window.location.hash;
			//Save history referers for future usage
			window.referrer = window.referrer || {};
			window.referrer.previous = window.referrer.current;
			window.referrer.current  = hash;

			try {
				return originalLoadUrl.apply(this, arguments);
			} catch (e) {
				if (e instanceof Redirect) {
					Backbone.history.navigate(e.url, {trigger: true});
				}
				else {
					Backbone.history.navigate('#!404', {trigger: true});
					console.error(e, e.message, e.stack);
				}
			}
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
					this.spinner.fadeIn('fast');
					this.overlay.fadeIn('fast');
				}.bind(this);

				$('body').addClass('loading');

				if (this.spinner) {
					show();
				} else {
					this.overlay = $('<div id="spinner-overlay" style="display:none"></div>');
					this.spinner = $('<div id="spinner" style="display:none"><i class="icon ion-looping"></i><span></span></div>');
					$body.append(this.overlay);
					$body.append(this.spinner);
					show();
				}

				if ((_.isString(label) && this.spinner) && (this.spinner.find('span').html() !== label)) {
					this.spinner.find('span').html(label);
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

		window.showMessage = function (label, delay, onSuccess, onError) {
			try {
				var $body = $('body');
				var show = function () {
					this.spinner.fadeIn('fast');
					_.delay(window.hideLoading.bind(window), delay);
				}.bind(this);

				$('body').addClass('loading');

				if (this.spinner) {
					show();
				} else {
					this.spinner = $('<div id="spinner" style="display:none"></div>');
					$body.append(this.spinner);
					show();
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
				if (this.spinner) {
					this.spinner.fadeOut(function(){$('body').removeClass('loading');});
				}
				if (this.overlay) {
					this.overlay.fadeOut();
				}
			}catch(e){
				console.log('An error occurred while trying to hide the spinner', e, e.stack, e.message);
			}
		};
	}
);