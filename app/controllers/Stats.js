/* globals define, Backbone, _, forge */
define(function(require){
	'use strict';

	var Detachable = require('Detachable');
	var Controller = require('Controller');

	var Day = Backbone.Model.extend();
	var DayView = Detachable.extend({
		className: 'item item-icon-left item-dark',
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		template: require('templates/stats_item'),
		events: {
			'tap': 'setLabel'
		},
		computedLabel: '',
		computedStatus: '',
		initialize: function(){
			Detachable.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		},
		render: function(){
			this.$el.append(this.template({data: this.model.toJSON()}));
			return this;
		},
		setLabel: function(){
			if(this.computedLabel){
				Backbone.trigger('stats:setlabel', this.computedLabel, this.computedStatus);
				return;
			}

			var data = this.model.toJSON();
			var total = parseFloat(data.total/data.goal, 10)*100;

			data.total = parseInt(Math.floor(total), 10);

			if(_.isNaN(data.total)){
				data.total = 0;
			}

			switch(this.model.get('type')){
			case 'today':
				this.computedStatus = 'Hoy he logrado el ' + data.total + '% de mi hidratación alcalina. #Alcalinízate';
				this.computedLabel = require('templates/stats_today')({data: data});
				break;
			case 'yesterday':
				this.computedStatus = 'Ayer logre el ' + data.total + '% de mi hidratación alcalina. #Alcalinízate';
				this.computedLabel = require('templates/stats_yesterday')({data: data});
				break;
			case 'beforeyesterday':
				this.computedStatus = 'Antier logre el ' + data.total + '% de mi hidratación alcalina. #Alcalinízate';
				this.computedLabel = require('templates/stats_beforeyesterday')({data: data});
				break;
			case 'week':
				data.total = parseInt(Math.floor(data.total/7), 10);
				this.computedStatus = 'La ultima semana logre el ' + data.total + '% de mi hidratación alcalina. #Alcalinízate';
				this.computedLabel = require('templates/stats_week')({data: data});
				break;
			case 'month':
				data.total = parseInt(Math.floor(data.total/30), 10);
				this.computedStatus = 'El último mes logre ' + data.total + '% de mi hidratación alcalina. #Alcalinízate';
				this.computedLabel = require('templates/stats_month')({data: data});
				break;
			}

			Backbone.trigger('stats:setlabel', this.computedLabel, this.computedStatus);
			return;
		}
	});

	var template = require('templates/stats');
	var Days = Backbone.Collection.extend({
		model: Day
	});

	return Controller.extend({
		id: 'stats-page',
		template: template,
		title: 'Estadísticas',
		currentLabel: '',
		initialize: function(options){
			Controller.prototype.initialize.apply(this, arguments);

			this.collection = new Days();

			if(options.days){
				this.collection.reset(options.days);
			}

			Backbone.on('stats:setlabel', this.setLabel, this);

			this.listenTo(this.collection, 'reset', this.addAll, this);

			return this.render();
		},
		update: function(days){
			this.collection.reset(days);

			return this;
		},
		hide: function(){
			this.bounceOutDown();
			this.trigger('hide');
			_.delay(this._detach.bind(this), 1000);
		},
		onRender: function(){
			this.dom.items = this.$el.find('#history');
			this.dom.status = this.$el.find('#status');
			this.dom.content = this.$el.find('.page-content');
		},
		onShow: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				icon: 'images/close@2x.png',
				position: 'left',
				prerendered: true
			}, this.hide.bind(this));
			forge.topbar.addButton({
				icon: 'images/share@2x.png',
				position: 'right',
				prerendered: true
			}, this.onRightButton.bind(this));

			this.bounceInUp();
			this.addAll();
		},
		addAll: function(){
			this.removeAll();

			this.collection.each(this.addOne.bind(this));
			_.invoke(this.views, DayView.prototype.show);
			//Select first elements
			this.dom.items.find('.item:first-child').trigger('tap');
		},
		removeAll: function(){
			_.each(this.views, function(v){
				v.destroy();
				v = null;
			});
			this.views = {};
			this.dom.status.empty();

			return this;
		},
		addOne: function(model){
			var view = new DayView({
				model: model,
				appendTo: this.dom.items
			});
			this.views[view.cid] = view;
		},
		onRightButton: function(){
			if(!this.currentStatus){
				return;
			}

			Backbone.trigger('share', this.currentStatus);
		},
		setLabel: function(label, status){
			this.currentStatus = status;
			this.dom.status.html(label);
		}
	});
});