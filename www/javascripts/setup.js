/* global define, steroids, TimelineLite, openFB */
define(
	'setup',
	[
		'underscore',
		'jquery',
		'backbone',
		'parse',
		'config',
		'fb',
		'mixins',
		'gsap',
		'timeline',
		'timelineCSS',
		'jquerygsap',
		'hammerjs',
		'jqueryhammer'
	],
	function(_, $, Backbone, Parse, config){
		'use strict';

		// Set the views' default backround
		steroids.view.setBackgroundColor('#33465d');
		//steroids.view.setBackgroundImage('http://localhost/images/background-1.png');

		//Initialize Parse
		Parse.initialize(config.PARSE.ID, config.PARSE.JSKEY);

		openFB.init({appId: config.FB.APP_ID});

		//Create main timeline
		window.Timeline = new TimelineLite();

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
				var height = $(window).height();
				var show = function () {
					this.spinner.fadeIn();
					this.overlay.fadeIn();
				}.bind(this);

				$('body').addClass('loading modal-open');

				if (this.spinner) {
					show();
				} else {
					this.overlay = $('<div id="spinner-overlay" style="height: ' + height + 'px;"></div>');
					this.spinner = $('<div id="spinner" style="top: ' + (height/2) + 'px;"><i class="icon ion-ios7-reloading"></i><div class="label"></div></div>');
					$body.append(this.overlay);
					$body.append(this.spinner);
				}

				var $label = this.spinner.find('.label');

				if ((_.isString(label) && $label.length) && ($label.html() !== label)) {
					$label.html(label);
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
				$('body').removeClass('loading modal-open');

				if (this.spinner) {
					this.spinner.fadeOut();
				}
				if (this.overlay) {
					this.overlay.fadeOut();
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

		var onMessage = function(event){
			var data = event.data || {};

			switch(data.message){
			case 'logout':
				Parse.User.logOut();
				break;
			}
		};
		window.addEventListener('message', onMessage);
	}
);