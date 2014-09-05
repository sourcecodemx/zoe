/* global define, Backbone, _, aspect */
define(function(require){
	'use strict';

	var Detachable = require('http://localhost/controllers/core/Detachable.js');
	var $          = require('jquery');

	require('mixins');

	var Controller = Detachable.extend({
		id: 'Must set controller id',
		className: 'ionic-body',
		template: require('http://localhost/javascripts/templates/page.js'),
		errorTemplate: require('http://localhost/javascripts/templates/page_error.js'),
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
		initialize: function(){
			//Call base initialize
			Detachable.prototype.initialize.apply(this, arguments);

            //Aspect
			aspect.add(this, 'show', this.onBeforeShow.bind(this));
			aspect.add(this, 'hide', this.onBeforeHide.bind(this));
			aspect.add(this, 'submit', this.onBeforeSubmit.bind(this), 'before');
			aspect.add(this, 'back', this.reset.bind(this), 'after');

			steroids.layers.on('willchange', this.onLayerWillChange.bind(this));
			steroids.layers.on('didchange', this.onLayerChange.bind(this));

			return this;
		},

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

		onLayerChange: function(event){
			if(event && event.target){
				console.log('layer changed target', event.target.webview.id);
			}
			if(event && event.source){
				console.log('layer changed source', event.source.webview.id);
			}
		},
		onLayerWillChange: function(event){
			if(event && event.target){
				console.log('layer will change target', event.target.webview.id);
			}
			if(event && event.source){
				console.log('layer will change source', event.source.webview.id);
			}
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
					var conf = {view: this.view, navigationBar: true};
					switch(ismodal){
					case true:
						steroids.modal.show(conf);
						break;
					default:
						steroids.layers.push(conf);
						break;
					}
				};
				var preloaded = false;
				var pageId;

				if(page.length && page.length > 1){
					//Convert to standard name
					pageId = (page.shift()).toLowerCase() + _.capitalize(page.shift());
					//If there is more than two arguments, append all others in the same fashion
					if(page.length){
						pageId += page.map(_.capitalize).join('');
					}

					// Check preloaded status
					preloaded = Zoe.storage.getItem(pageId + '-preloaded') ? true : false;
					// Create webview object if view has been previously loaded (in some other page)
					// or if it does not exists in the views object
					if(preloaded || !this.views[page]){
						this.views[pageId] = new steroids.views.WebView({location: 'http://localhost/views/' + route + '.html', id: pageId + 'View'});
					}
					// If object has not been previously loaded then preload it
					if(!preloaded){
						ActivityIndicator.show('Cargando');
						//Preload the view
						this.views[pageId].preload({}, {
							onSuccess: function(){
								ActivityIndicator.hide();
								//Save load status for other pages to check it
								Zoe.storage.setItem(this.id + '-preloaded', true);
								//Replace the thing
								_.delay(this.push.bind({view: this.views[this.id]}), 1000);
							}.bind({views: this.views, id: pageId, push: push}),
							onFailure: function(){
								ActivityIndicator.hide();
								//Remove preload status
								Zoe.storage.removeItem(this.id + '-preloaded');
								//Delete view if it exists
								if(this.views[this.id]){
									delete this.views[this.id];
								}
								//Alert user
								setTimeout(function(){
									navigator.notification.alert(
                                        'Ha ocurrido un error al cargar la vista, por favor intente de nuevo', 
                                        $.noop, 
                                        'Ups!'
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

		onClose: function(){
			aspect.remove(this, 'show', this.onBeforeShow.bind(this));
			aspect.remove(this, 'show', this.onShow.bind(this), 'after');
			aspect.remove(this, 'hide', this.onBeforeHide.bind(this));
			aspect.remove(this, 'hide', this.onHide.bind(this), 'after');

			this.stopListening();
		},
		
		back: function(){
			setTimeout(function(){steroids.layers.pop();}, 1);
		},
		onLeftButton: function(){
			this.back();
		},
		onRightButton: function(){},
		onTitle: function(){},
		submit: function(){},
		reset: function(){
			if(this.dom.form){
				this.dom.form.trigger('reset');
			}
		},
		messageListener: function(){
			window.addEventListener('message', this.onMessage.bind(this));
		},
		onMessage: function(event){
			//Implement yours
		},
		onError: function(model, error){
			ActivityIndicator.hide();
			_.delay(function(){
				navigator.notification.alert(this.message, $.noop, 'Ups!');
			}.bind(error), 1);
		},
		onContentError: function(error){
			ActivityIndicator.hide();
			this.dom.content.html(this.errorTemplate({message: error.message}));
		}
	});

	return Controller;
});