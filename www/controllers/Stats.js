/* globals define, Backbone, _, User */
define(function(require){
	'use strict';

	var Detachable = require('Detachable');
	var Controller = require('Controller');
	var Chartist = require('chartist');
	var config = require('config');

	var Day = Backbone.Model.extend();
	var DayView = Detachable.extend({
		className: 'item item-icon-left item-dark',
		showFx: 'fadeIn',
		hideFx: 'fadeOut',
		template: require('templates/stats_item'),
		initialize: function(){
			Detachable.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			return this.render();
		},
		render: function(){
			var m = this.model.toJSON();
			var data = {date: m.date, total: m.total/1000, percentage: m.percentage};
			
			this.$el.append(this.template({data: data}));

			return this;
		}
	});

	var template = require('templates/stats');
	var Days = Backbone.Collection.extend({
		model: Day,
		getFirstWeekStatus: function(){
			var week = [this.at(0), this.at(1), this.at(2), this.at(3), this.at(4), this.at(5), this.at(6)];

			week = week.map(function(d){return d.toJSON();});

			var total = week.reduce(function(c, n){return c + n.total;}, 0);
			var percentage = total/7;
			var goal = User.current().getGoal();

			if(goal){
				percentage = parseInt(((percentage/1000)*100)/goal, 10);
			}else {
				percentage = 'N/A';
			}

			return {total: total, percentage: percentage};
		},
		getMonthlyStatus: function(){
			var month = this.toArray();

			var total = month.reduce(function(c, n){return c + n.total;}, 0);
			var percentage = total/7;
			var goal = User.current().getGoal();

			if(goal){
				percentage = parseInt(((percentage/1000)*100)/goal, 10);
			}else {
				percentage = 'N/A';
			}

			return {total: total, percentage: percentage};
		},
		getChartData: function(){
			return {
				labels: this.map(function(c){return c.get('date');}),
				serie: this.map(function(c){return c.get('total')/1000;})
			};
		}
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
		},
		onRender: function(){
			this.dom.items = this.$el.find('#history');
			this.dom.status = this.$el.find('#status');
			this.addAll();

			this.status('week', this.collection.getFirstWeekStatus().percentage);
		},
		onShow: function(){
			var data = this.collection.getChartData();

			this.bounceInUp();

			this.chart = new Chartist.Bar('.ct-chart', {
			  labels: data.labels,
			  series: [data.serie]
			}, {
			  seriesBarDistance: 10,
			  reverseData: true,
			  horizontalBars: true,
			  height: data.labels.length * 40,
			  axisY: {
			    offset: 70,
			    showGrid: false
			  },
			  axisX: {
			  	showGrid: false,
			  	scaleMinSpace: 50
			  }
			});

			console.log('chartist', Chartist);
		},
		addAll: function(){
			this.removeAll();

			this.collection.each(this.addOne.bind(this));
			_.invoke(this.views, DayView.prototype.show);
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

			var m = this.currentStatus + ' #Alcalinízate';

			window.plugins.actionsheet.show(config.SHARE.DEFAULT, function(option){
				switch(option){
				case 1: window.plugins.socialsharing.shareViaFacebook(m, null, config.FB.URL); break;
				case 2: window.plugins.socialsharing.shareViaTwitter(m, null, config.TWITTER); break;
				}
			});
		},
		status: function(type, percentage){
			var s = '';
			var html = '';
			switch(type){
			case 'week':
				s = 'La ultima semana logre el ' + (percentage || 0) + '% de mi hidratación alcalina.';
				html = '<h2 class="dark">La</h2><h2 class="dark">ultima semana</h2><h2 class="dark">ganaste</h2><h2 class="dark">el <strong>' + percentage + '%</strong> de tu</h2><h2 class="dark">hidratación</h2>';
				break;
			default:
				s = 'El último mes logre ' + (percentage || 0) + '% de mi hidratación alcalina.';
				html = '<h2 class="dark">El</h2><h2 class="dark">último mes</h2><h2 class="dark">ganaste</h2><h2 class="dark">el <strong>' + percentage + '%</strong> de tu</h2><h2 class="dark">hidratación</h2>';
				break;
			}

			this.currentStatus = s;
			this.dom.status.html(html);
		},
		drawChart: function(){
			console.log('drawChart', this);
		}
	});
});