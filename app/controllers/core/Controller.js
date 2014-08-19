/* global define, Backbone, _, aspect */
define(function(require){
	'use strict';

	var Detachable = require('http://localhost/controllers/core/Detachable.js');
	
	var Controller = Detachable.extend({
		id: 'Must set controller id',
		className: 'ionic-body',
		template: require('http://localhost/javascripts/templates/page.js'),
		compiledTemplate: '',
		loadingLabel: 'Loading',
		title: 'Default title',
		description: 'Default Description',
		events: {
			'click #leftButton': 'onLeftButton',
			'click #title': 'onTitle',
			'click #rightButton': 'onRightButton',
			'submit form': 'submit'
		},
		mobile: true,
		initialize: function(){
			//Call base initialize
			Detachable.prototype.initialize.apply(this, arguments);

            //Aspect
			aspect.add(this, 'show', this.onBeforeShow.bind(this));
			aspect.add(this, 'hide', this.onBeforeHide.bind(this));
		},

		onBeforeShow: function(){
			Backbone.trigger('domchange:title', this.title, this.description);
		},
		onBeforeHide: function(){},

		//Override whenever it makes sense
		render: function(){
			var model = this.model instanceof Backbone.Model ? this.model.attributes : ((_.isObject(this.model) || _.isArray(this.model)) ? this.model : {});
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

			//this.$el.hammer();
			
			return this;
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
		}

	});

	return Controller;
});