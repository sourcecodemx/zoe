/* globals define, CryptoJS, _, Parse, alert, forge, User */
define(function(require) {
    'use strict';

    var Controller = require('Controller');
    var config = require('config');

    //Require crypto library
    require('sha3');

    /**
     * Index Controller
     *
     * Provides authentication options:
     * - Facebook
     * - Login (Parse)
     * - Signup
     */
    return Controller.extend({
        id: 'index-page',
        template: require('http://localhost/javascripts/templates/index.js'),
        hideFx: 'fadeOut',
        showFb: 'fadeIn',
        events: (function() {
            var events = _.extend({}, Controller.prototype.events, {
                'tap #facebook': 'facebook'
            });

            return events;
        })(),
        onRender: function() {
            this.dom.weight = this.$el.find('#weight');
        },
        onMe: function(response) {
            var data = {
                email: response.email,
                username: response.email.toLowerCase(),
                password: CryptoJS.SHA3(response.email.toLowerCase()).toString(),
                firstName: response.first_name || '',
                lastName: response.last_name || '',
                fullName: response.name || '',
                gender: response.gender || '',
                facebook: true
            };

            //Atempt saving the user
            var model = Parse.Object.extend({className: '_User'});
			var query = new Parse.Query(model);

			query.equalTo('username', data.username);
			query.count({
				success: function(count){
					if(count){
						User.logIn(
							data.username,
							data.password,
							{
								success: this.onFBSignupSuccess.bind(this),
								error: this.onError.bind(this)
							}
						);
					}else{
						var user = new User();
						user.set(data.user)
							.signUp(null, {
								success: this.onFBSignupSuccess.bind(this),
								error: this.onError.bind(this)
							});
					}
				}.bind(this),
				error: this.onError.bind(this)
			});
        },
        onFBSignupSuccess: function() {
            forge.notification.hideLoading();

            var user = User.current();
            if (!user.get('weight')) {
                this.dom.weight.trigger('click');
            }
        },
        onFBError: function(response) {
            forge.notification.hideLoading();

            setTimeout(function() {
                navigator.notification.alert('No hemos podido iniciar sesion con Facebook, por favor intenta de nuevo.', $.noop, 'Ups!');
            }, 1);
        },
        onError: function() {
            forge.notification.hideLoading();
            Controller.prototype.onError.apply(this, Array.prototype.slice.call(arguments));
        },
        facebook: function() {
            if (!this.online) {
                this.offlineError();
                return;
            }

            var me = function() {
                forge.notification.showLoading('Autenticando');
                forge.facebook.api(
                    '/me',
                    config.FB.DEFAULT_PERMISSION,
                    this.onMe.bind(this),
                    this.onFBError.bind(this)
                );
            }.bind(this);

            var authorize = function(){
            	forge.facebook.authorize(config.FB.DEFAULT_PERMISSION, 'all', me, this.onFBError.bind(this));
            }.bind(this);

            if(forge.facebook.hasAuthorized(config.FB.DEFAULT_PERMISSION, 'all', me, authorize))
        }
    });
});