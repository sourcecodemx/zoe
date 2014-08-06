/* global define */
define(['backbone', 'aspect'], function(Backbone, aspect){
	'use strict';
	
	return Backbone.View.extend({
		appendTo: 'body',//Update to create subControllers
		initialize: function(options){

			if(options){
				if(options.appendTo){
					this.appendTo = options.appendTo;
				}
			}

			aspect.add(this, 'show', this.onShow.bind(this), 'after');
			aspect.add(this, 'hide', this.onHide.bind(this), 'after');
			aspect.add(this, 'render', this.onRender.bind(this), 'after');

			Backbone.View.prototype.initialize.apply(this, arguments);
		},
		render: function(){},//Implement yours
		hide: function(){
			try{
				this.$el.hide();
				this._detach();
			}catch(e){
				console.log('An error occurred while hiding the view', e, e.message, e.stack);
			}

			return this;
		},
		show: function(){
			try{
				if(!this.isAttached()){
					this._append();
				}
				this.$el.show();
			}catch(e){
				console.log('An error occurred while showing the view', e, e.message, e.stack);
			}

			return this;
		},
		isAttached: function(){
			return !!this.$el.parent().length;
		},

		_append: function(){
			try{
				this.$el.appendTo(this.appendTo);
				//TODO: don't remove the loading label here, do it in the controller(s)
				if(this.$el.parent().hasClass('loading')){
					this.$el.parent().removeClass('loading');
					this.$el.parent().find('#app-loading-label').remove();
				}

				this.delegateEvents();
			}catch(e){
				console.log('FATAL: Detachble view requires a defined appendTo attribute', e.name, e.stack);
			}
			
		},

		_detach: function(){
			this.$el.detach();
		},
		//Implement yours
		onShow: function(){},
		onHide: function(){},
		onRender: function(){}
	});
});