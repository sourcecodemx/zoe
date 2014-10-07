/* global define, Backbone, _, aspect, forge, Zoe */
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
			'submit form': 'submit',
			'click [child]': 'showView'
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
		showView: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				var $target = $(e.currentTarget);
				var route = $target.attr('data-view');
				var page = route.length ? route.split('/') : [];
				var ismodal = $target[0].hasAttribute('modal');
				
				var push = function(){
					//var conf = {view: this.view, navigationBar: true};
					switch(ismodal){
					case true:
						//steroids.modal.show(conf);
						break;
					default:
						//steroids.layers.push(conf);
						break;
					}
				};
				var preloaded = false;
				var pageId;

				//Determine if it is a local or external page
				if(page && page.length){
					if(page[0] === 'http:' || page[0] === 'https:'){
						pageId = _.escape(route);

						// Check preloaded status
						preloaded = Zoe.storage.getItem(pageId + '-preloaded') ? true : false;
						// Create webview object if view has been previously loaded (in some other page)
						// or if it does not exists in the views object
						if(preloaded || !this.views[page]){
							//this.views[pageId] = new steroids.views.WebView({location: route, id: pageId + 'View'});
						}
					}else{
						//Convert to standard name
						pageId = (page.shift()).toLowerCase() + _.capitalize(page.shift());
						//If there is more than two arguments, append all others in the same fashion
						if(page.length){
							pageId += page.map(_.capitalize).join('');
						}

						// Check preloaded status
						preloaded = Zoe.storage.getItem(pageId + '-preloaded') ? true : false;
						// or if it does not exists in the views object
						if(preloaded || !this.views[page]){
							//this.views[pageId] = new steroids.views.WebView({location: 'http://localhost/views/' + route + '.html', id: pageId + 'View'});
						}
					}
				}

				//if pageid has been set
				if(pageId){
					// If object has not been previously loaded then preload it
					if(!preloaded){
						forge.notification.showLoading('Cargando');
						//Preload the view
						this.views[pageId].preload({}, {
							onSuccess: function(){
								forge.notification.hideLoading();
								//Save load status for other pages to check it
								Zoe.storage.setItem(this.id + '-preloaded', true);
								//Replace the thing
								_.delay(this.push.bind({view: this.views[this.id]}), 1000);
							}.bind({views: this.views, id: pageId, push: push}),
							onFailure: function(){
								forge.notification.hideLoading();
								//Remove preload status
								Zoe.storage.removeItem(this.id + '-preloaded');
								//Delete view if it exists
								if(this.views[this.id]){
									delete this.views[this.id];
								}
								//Alert user
								setTimeout(function(){
									forge.notification.alert(
										'Ups!',
                                        'Ha ocurrido un error al cargar la vista, por favor intente de nuevo'
                                    );
								}, 1);
							}.bind({views: this.views, id: pageId})
						});
					}else{
						// If object has been previously loaded we just need to replace the current
						// layer with the created WebView
						setTimeout(push.bind({view: this.views[pageId]}), 1);
					}
				}else{
					throw new Error('NO_DATA_VIEW_DEFINED');
				}
			}catch(e){
				this.onError(null, e);
			}
		},
		back: function(){
			//setTimeout(function(){steroids.layers.pop();}, 1);
		},
		checkPosition: function(e){
			console.log('check position', e);
			if(this.$el.hasClass('scrolling')){
				e.preventDefault();
				e.stopPropagation();
			}else if(!this.$el.hasClass('end-reached')){
				var offset = Math.abs($(e.currentTarget).offset().top);
				var wheight = $(window).height();
				var height = $(e.currentTarget).height();

				console.log(offset, wheight, height, offset+wheight-150);

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
			setTimeout(function(){console.log(model, error); forge.logging.info(model, JSON.stringify(error));}, 10000);
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
		},
		_setup: function(){}//Extend with yours
	});

	return Controller;
});