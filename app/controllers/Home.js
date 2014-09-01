/* globals define, steroids, _ */
define(function(require){
	'use strict';

	require('polyfill');
	require('spinner');

	var Controller = require('http://localhost/controllers/core/Root.js');
	var HTMLModal  = require('http://localhost/ui/Modal.js');
	var template = require('http://localhost/javascripts/templates/home.js');
	
	var Index = Controller.extend({
		id: 'home-page',
		template: template,
		hideFx: 'fadeOut',
		showFb: 'fadeIn',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #track': 'track',
				'click #share': 'share',
				'click #stats': 'stats'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.views.stats = new steroids.views.WebView({location: 'http://localhost/views/Stats/index.html', id: 'statsView'});
			//Preload view
			this.views.stats.preload();

			var weight = this.model.get('weight');
			var goal = (weight * 0.03).toFixed(2);

			this.goal = goal;

			this.data.goal =  goal + ' litros';
			this.data.username = this.model.get('username');

			this.canvas = null;
			this.progressColors = ['#54BB2F', '#0093C2'];

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			leftButton.imageAsOriginal = false;
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/settings.png';
			rightButton.onTap = this.onRightButton.bind(this);
			rightButton.imageAsOriginal = false;

			steroids.view.navigationBar.update({
				titleImagePath: '/images/zoe.png',
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

			window.addEventListener('message', this.onMessage.bind(this));
			window.postMessage({message: 'user:journal:fetch'});

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.canvas = this.$el.find('#progress');
			this.dom.settings = this.$el.find('#settings');
			this.dom.percentage = this.$el.find('#percentage');
			this.canvas = this.dom.canvas[0].getContext('2d');

			this._drawMultiRadiantCircle(150, 150, 120, this.progressColors);
		},
		onRightButton: function(){
			//Hide menu (if visible)
			if(this.dom.menu && this.dom.menu.position().top === 0){
				this.toggleMenu();
			}
			//Use DOM defined attributes

			this.dom.settings.trigger('click');
		},
		onClose: function(){
			//this.views.settings.unload();
			//this.views.settings = null;
		},
		track: function(){
			if(!this.modal){
				this.modal = new CheckModal();
			}

			return this.modal.show();
		},
		share: function(){
			console.log('share');
		},
		stats: function(){
			console.log(this.views.stats, 'stats');
			steroids.modal.show({
				view: this.views.stats,
				navigationBar: true
			});
		},
		_drawMultiRadiantCircle: function(/*xc, yc, r, radientColors*/) {
			/*var ctx = this.canvas;
			var partLength = (2 * Math.PI) / radientColors.length;
			var start = 0;
			var gradient = null;
			var startColor = null;
			var endColor = null;

			for (var i = 0; i < radientColors.length; i++) {
				startColor = radientColors[i];
				endColor = radientColors[(i + 1) % radientColors.length];

				// x start / end of the next arc to draw
				var xStart = xc + Math.cos(start) * r;
				var xEnd = xc + Math.cos(start + partLength) * r;
				// y start / end of the next arc to draw
				var yStart = yc + Math.sin(start) * r;
				var yEnd = yc + Math.sin(start + partLength) * r;

				ctx.beginPath();

				gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
				gradient.addColorStop(0, startColor);
				gradient.addColorStop(1.0, endColor);

				ctx.strokeStyle = gradient;
				ctx.arc(xc, yc, r, start, start + partLength);
				ctx.lineWidth = 30;
				ctx.stroke();
				ctx.closePath();

				start += partLength;
			}*/
			var canvas = this.dom.canvas[0];
			var context = canvas.getContext('2d');
			var x = canvas.width/2;
			var y = canvas.height/2;
			var radius = 100;
			var startAngle = 1.5 * Math.PI;
			var endAngle = 2.9 * Math.PI;
			var counterClockwise = false;

			context.beginPath();
			context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
			context.lineWidth = 20;

			context.lineCap = 'round';

			// line color
			context.strokeStyle = '#0093C2';
			context.stroke();
		},
		onSuccess: function(milltrs){
			try{
				var liters = parseFloat((milltrs/1000).toFixed(2), 10);
				var goal = this.goal;
				var percentage = Math.round((liters/goal)*100);

				this.dom.percentage.text(percentage + '%');
			}catch(e){
				this.onError(null, e);
			}
			
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'user:journal:success':
				this.onSuccess(data.consumption);
				break;
			case 'user:journal:error':
				this.onError(null, data.error);
				break;
			}
		}
	});

	var CheckModal = HTMLModal.extend({
		events: (function () {
			var events = _.extend({}, HTMLModal.prototype.events, {
				'click .check': 'save',
				'click #deleteLast': 'deleteLast'
			});

			return events;
		})(),
		template: require('http://localhost/javascripts/templates/home_modal_check.js'),
		initialize: function(){
			HTMLModal.prototype.initialize.apply(this, arguments);

			window.addEventListener('message', this.onMessage.bind(this));

			return this;
		},
		save: function(e){
			try{
				var value = $(e.currentTarget).attr('data-value');

				window.showLoading('Guardando Consumo');
				window.postMessage({message: 'user:consumption:save', type: value});
			}catch(e){
				this.onError(null, e);
			}
		},
		deleteLast: function(){
			console.log('delete last');
		},
		onSuccess: function(){
			window.showLoading('Consumo Guardado');
			setTimeout(window.hideLoading.bind(window), 2000);
			this.hide();
		},
		onError: function(model, error){
			window.hideLoading();
			setTimeout(function(){
				navigator.notification.alert(this.message, $.noop, 'Ups!');
			}.bind(error), 1);
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'user:consumption:success':
				this.onSuccess();
				break;
			case 'user:consumption:error':
				console.log('consumption error', data);
				this.onError(null, data.error);
				break;
			}
		}
	});

	return Index;
});