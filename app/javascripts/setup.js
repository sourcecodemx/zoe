/* global define */
define(
	'setup',
	[
		'underscore',
		'backbone',
		'parse',
		'config',
		'user',
		'Redirect'
	],
	function(_, Backbone, Parse, config, User, Redirect){
		'use strict';

		// Set the views' default backround
		//steroids.view.setBackgroundColor('#33465d');
		//Get user instance
		window.User = User;
		//Initialize parse
		Parse.initialize(config.PARSE.ID, config.PARSE.JSKEY);

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
	}
);