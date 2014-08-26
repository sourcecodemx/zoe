/* globals define, steroids, _, Parse */
define(function(require){
	'use strict';

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

			this.views = {
				settings: new steroids.views.WebView({location: 'http://localhost/views/Settings/index.html',id: 'settingsView'}),
				stats: new steroids.views.WebView({location: 'http://localhost/views/Stats/index.html', id: 'statsView'})
			};
			//Preload view
			this.views.settings.preload();
			this.views.stats.preload();

			var fakeGoal = _.random(1, 3);

			this.data = Parse.User.current().toJSON();
			this.data.goal =  fakeGoal > 1 ? fakeGoal + ' litros' : fakeGoal + ' litro';

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

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			window.view = this;

			this.dom.canvas = this.$el.find('#progress');
			this.canvas = this.dom.canvas[0].getContext('2d');

			this._drawMultiRadiantCircle(150, 150, 120, this.progressColors);
		},
		onRightButton: function(){
			//Hide menu (if visible)
			if(this.dom.menu && this.dom.menu.position().top === 0){
				this.toggleMenu();
			}

			setTimeout(function(){
				steroids.layers.push({
					view: this.views.settings
				});
			}.bind(this), 1);
		},
		onClose: function(){
			this.views.settings.unload();
			this.views.settings = null;
		},
		track: function(){
			console.log('track');
			if(!this.modal){
				this.modal = new CheckModal();
			}

			return this.modal.show();
		},
		share: function(){
			console.log('share');
		},
		stats: function(){
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
		}
	});

	var CheckModal = HTMLModal.extend({
		template: require('http://localhost/javascripts/templates/home_modal_check.js')
	});

	return {
		Index: Index
	};
});