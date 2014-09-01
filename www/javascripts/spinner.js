/* global define, _, $ */
define(
	'spinner',
	function(){
		'use strict';
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

				$('body').addClass('loading spinner-open');

				if (this.spinner) {
					show();
				} else {
					this.overlay = $('<div id="spinner-overlay" style="height: ' + height + 'px;display:none;"></div>');
					this.spinner = $('<div id="spinner" style="top: ' + (height/2) + 'px;display:none;"><i class="icon ion-ios7-reloading"></i><div class="label"></div></div>');
					$body.append(this.overlay);
					$body.append(this.spinner);
					show();
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
				$('body').removeClass('loading spinner-open');

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
	}
);