/* global define, Backbone, _, aspect, forge */
define(function(require){
	'use strict';

	var Detachable = require('Detachable');
	var $          = require('jquery');

	require('hammerjs');
	require('jqueryhammer');
	require('mixins');

	var Controller = Detachable.extend({
		id: 'Must set controller id',
		className: 'ionic-body',
		template: require('templates/page'),
		errorTemplate: require('templates/page_error'),
		compiledTemplate: '',
		loadingLabel: 'Loading',
		title: 'Default title',
		description: 'Default Description',
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		events: {
			'click #leftButton': 'onLeftButton',
			'click #title': 'onTitle',
			'click #rightButton': 'onRightButton',
			'submit form': 'submit'
		},
		mobile: true,
		online: true,
		initialize: function(){
			//Call base initialize
			Detachable.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
			
			//Check for connection status
			forge.event.connectionStateChange.addListener(this._checkConnection.bind(this), false);

			//Listen for app propagated networks status events
			Backbone.on('app:online', this.onOnline, this);
        	Backbone.on('app:offline', this.onOffline, this);

            //Aspect
			aspect.add(this, 'show', this.onBeforeShow.bind(this));
			aspect.add(this, 'hide', this.onBeforeHide.bind(this));
			aspect.add(this, 'submit', this.onBeforeSubmit.bind(this), 'before');
			aspect.add(this, 'back', this.reset.bind(this), 'after');
			aspect.add(this, 'show', this._checkConnection.bind(this), 'before');
			
			return this;
		},
		submit: function(){},
		reset: function(){
			if(this.dom.form){
				this.dom.form.trigger('reset');
			}
		},
		messageListener: function(){
			window.addEventListener('message', this.onMessage.bind(this));
		},
		//Override whenever it makes sense
		render: function(){
			var model = this.model && this.model.attributes ? this.model.attributes : ((_.isObject(this.model) || _.isArray(this.model)) ? this.model : {});
			var collection = this.collection instanceof Backbone.Collection ? this.collection.toJSON() : ((_.isObject(this.collection) || _.isArray(this.collection)) ? this.collection : []);
			//Extend data
			var data = _.extend({
				item      : model,
				items     : collection,
				id        : this.id,
				className : this.className
			}, this.data || {});

			//Pass to the template, we must enforce the usage of this instead of custom names
			this.compiledTemplate = this.template({data: data});

			this.$el.append(this.compiledTemplate);

			this.$el.hammer();

			return this;
		},
		back: function(){
			//setTimeout(function(){steroids.layers.pop();}, 1);
		},
		checkPosition: function(e){
			if(this.$el.hasClass('scrolling')){
				e.preventDefault();
				e.stopPropagation();
			}else if(!this.$el.hasClass('end-reached')){
				var offset = Math.abs($(e.currentTarget).offset().top);
				var wheight = $(window).height();
				var height = $(e.currentTarget).height();

				if(offset + wheight - 100 > height){
					this.$el.addClass('scrolling');
					this.dom.indicator.addClass('active');
				}
			}
		},
		onTouchEnd: function(){},
		onBeforeShow: function(){
			Backbone.trigger('domchange:title', this.title, this.description);
		},
		onBeforeHide: function(){},
		onBeforeSubmit: function(){
			var $focus = this.$el.find(':focus');

			if($focus.length){
				$focus.trigger('blur');
			}
		},
		onLayerChange: function(){},
		onLayerWillChange: function(){},
		onClose: function(){
			aspect.remove(this, 'show', this.onBeforeShow.bind(this));
			aspect.remove(this, 'show', this.onShow.bind(this), 'after');
			aspect.remove(this, 'hide', this.onBeforeHide.bind(this));
			aspect.remove(this, 'hide', this.onHide.bind(this), 'after');

			this.stopListening();
		},
		onLeftButton: function(){
			this.back();
		},
		onRightButton: function(){},
		onTitle: function(){},
		onMessage: function(){},
		onError: function(model, error){
			forge.notification.hideLoading();
			_.delay(function(){
				forge.notification.alert('Ups!', this.message);
			}.bind(error), 1);
		},
		onContentError: function(error){
			forge.notification.hideLoading();
			this.dom.content.html(this.errorTemplate({message: error.message}));
		},
		onShow: function(){
			//forge.ui.enhanceAllInputs();
			this._checkConnection();
		},
		bounceOutLeft: function(){
			this.dom.content.addClass('bounceOutLeft animated');
			_.delay(function(){
				this.dom.content.removeClass('bounceOutLeft animated').addClass('hide');
				this.$el.hide();
			}.bind(this), 1000);
		},
		bounceInLeft: function(){
			this.$el.show();
			this.dom.content.removeClass('hide').addClass('bounceInLeft animated');
			_.delay(function(){
				this.dom.content.removeClass('bounceInLeft animated');
			}.bind(this), 1000);
		},
		bounceInRight: function(){
			this.$el.show();
			this.dom.content.removeClass('hide').addClass('bounceInRight animated');
			_.delay(function(){
				this.dom.content.removeClass('bounceInRight animated');
			}.bind(this), 1000);
		},
		bounceOutRight: function(){
			this.dom.content.addClass('bounceOutRight animated');
			_.delay(function(){
				this.dom.content.removeClass('bounceOutRight animated').addClass('hide');
				this.$el.hide();
			}.bind(this), 1000);
		},
		bounceInUp: function(){
			this.$el.show();
			this.dom.content.removeClass('hide').addClass('bounceInUp animated');
			_.delay(function(){
				this.dom.content.removeClass('bounceInUp animated');
			}.bind(this), 1000);
		},
		bounceOutDown: function(){
			this.dom.content.addClass('bounceOutDown animated');
			_.delay(function(){
				this.dom.content.removeClass('bounceOutDown animated').addClass('hide');
				this.$el.hide();
			}.bind(this), 1000);
		},
		onOnline: function(){
			this.online = true;
			this.$el.find('#offline').removeClass('offline-ui-down');
		},
		onOffline: function(){
			this.online = false;
			this.$el.find('#offline').addClass('offline-ui-down');
		},
		offlineError: function(){
			this.onError(null, {message: '¡No hay conexión a internet! :('});
		},
		_checkConnection: function(){
        	if(forge.is.connection.connected() || forge.is.connection.wifi()){
				Backbone.trigger('app:online');
			}else{
				Backbone.trigger('app:offline');
			}
		}
	});

	return Controller;
});