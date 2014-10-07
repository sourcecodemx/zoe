/* globals define, steroids, Backbone, _ */
define(function(require){
	'use strict';

	var Detachable = require('Detachable');
	var Modal = require('Modal');
	var template = require('templates/stats');

	var Day = Backbone.Model.extend();
	var DayView = Detachable.extend({
		className: 'item item-icon-left item-dark',
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		template: require('templates/stats_item'),
		events: {
			'click': 'setLabel'
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

			switch(this.model.get('type')){
			case 'today':
				this.computedStatus = 'Hoy he ganado el ' + data.total + '% de mi hidratacion optima.';
				this.computedLabel = require('templates/stats_today')({data: data});
				break;
			case 'yesterday':
				this.computedStatus = 'Ayer gane el ' + data.total + '% de mi hidratacion optima.';
				this.computedLabel = require('templates/stats_yesterday')({data: data});
				break;
			case 'beforeyesterday':
				this.computedStatus = 'Antier gane el ' + data.total + '% de mi hidratacion optima.';
				this.computedLabel = require('templates/stats_beforeyesterday')({data: data});
				break;
			case 'week':
				data.total = data.total/7;
				this.computedStatus = 'La semana pasada gane el ' + data.total + '% de mi hidratacion optima.';
				this.computedLabel = require('templates/stats_week')({data: data});
				break;
			case 'month':
				data.total = data.total/30;
				this.computedStatus = 'El mes pasado gane el ' + data.total + '% de mi hidratacion optima.';
				this.computedLabel = require('templates/stats_month')({data: data});
				break;
			}

			Backbone.trigger('stats:setlabel', this.computedLabel, this.computedStatus);
			return;
		}
	});
	var Days = Backbone.Collection.extend({
		model: Day
	});

	return Modal.extend({
		id: 'stats-page',
		template: template,
		title: 'Estadisticas',
		currentLabel: '',
		initialize: function(){
			Modal.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/share@2x.png';
			rightButton.onTap = this.onRightButton.bind(this);

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/close@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);

			this.collection = new Days();

			steroids.view.navigationBar.update({
				title: this.title,
				closeButton: leftButton,
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});

			this.listenTo(this.collection, 'reset', this.addAll, this);
			Backbone.on('stats:setlabel', this.setLabel, this);

			return this.render();
		},
		onRender: function(){
			this.dom.items = this.$el.find('#history');
			this.dom.status = this.$el.find('#status');
		},
		addAll: function(){
			this.collection.each(this.addOne.bind(this));
			_.invoke(this.views, DayView.prototype.show);
			//Select first elements
			this.dom.items.find('.item:first-child').trigger('click');
		},
		removeAll: function(){
			_.each(this.views, function(v){
				v.destroy();
				v = null;
			});
			this.views = {};
			this.dom.status.empty();
			//this.dom.items.empty();

			return this;
		},
		addOne: function(model){
			var view = new DayView({
				model: model,
				appendTo: this.dom.items
			});
			this.views[view.cid] = view;
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'statsView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		onRightButton: function(){
			if(!this.currentStatus){
				return;
			}

			window.plugins.socialsharing.share(
				this.currentStatus,
				null,
				null,
				'http://zoewater.com.mx');
		},
		setLabel: function(label, status){
			this.currentStatus = status;
			this.dom.status.html(label);
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'stats:fetch:success':
				this
					.removeAll()
					.collection.reset(data.stats);
				break;
			}
		}
	});
});