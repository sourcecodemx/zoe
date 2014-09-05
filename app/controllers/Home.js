/* globals define, steroids, _, Parse, ActivityIndicator  */
define(function(require){
	'use strict';

	require('polyfill');
	require('spinner');
	require('jquery');
	require('progressCircle');

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
				'click #share': 'share'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.model = Parse.User.current();

			//Listen for model changes
			this.listenTo(this.model, 'change:weight', this.onWeightChange, this);
			this.listenTo(this.model, 'change:username', this.onUsernameChange, this);
			this.listenTo(this.model, 'change:lastConsumption', this.onConsumptionChange, this);

			//Create stats view
			this.views.stats = new steroids.views.WebView({location: 'http://localhost/views/Stats/index.html', id: 'statsView'});
			this.views.stats.preload();

			//get goal
			this.data.goal =  this.model.getGoal() + ' litros';
			this.data.username = this.model.get('username');

			//Nivigationbar
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

			//Listen for messages
			window.addEventListener('message', this.onMessage.bind(this));

			//Get Journal data
			this.model.getJournal()
				.then(this.onJournal.bind(this))
				.fail(this.onJournalError.bind(this));

			return this.render();
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.username = this.$el.find('#username');
			this.dom.percentage = this.$el.find('#percentage');
			this.dom.goal = this.$el.find('#goal');
			this.dom.circle = this.$el.find('#circle');
			//Fake buttons
			this.dom.settings = this.$el.find('#settings');
			this.dom.weight = this.$el.find('#weight');
		},
		onShow: function(){
			this.dom.circle.circleProgress({
				//value: 0.01,
				startAngle: -Math.PI/2,
				thickness: 30,
				size: 220,
				//reversed: true,
				animation: {
					duration: 3000
				},
				fill: {
					gradient: ['rgb(86, 139, 180)', 'rgb(105,160,180)', 'rgb(132,177,77)']
				}
			});
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
			if(!this.model.get('weight')){
				navigator.notification.confirm(
					'Necesitas definir tu peso para poder capturar consumo',
					this.onWeightConfirmation.bind(this),
					'Hey!',
					['Hacerlo', 'Despues']
				);
			}else{
				if(!this.modal){
					this.modal = new CheckModal();
				}

				return this.modal.show();
			}
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
		onUsernameChange: function(){
			this.dom.username.text(this.model.get('username'));
		},
		onWeightConfirmation: function(index){
			switch(index){
			case 1:
				this.dom.weight.trigger('click');
				break;
			}
		},
		onWeightChange: function(){
			this.dom.goal.text(this.model.getGoal());
		},
		onConsumptionChange: function(){
			var goal = this.model.getGoal();
			var consumption = this.model.get('lastConsumption').get('consumption')/1000;
			var percentage = Math.round((consumption/goal)*100);
			var current = parseInt(this.dom.percentage.text(), 10);
			var total = current + percentage;

			console.log(parseFloat(total/100, 10), 'new value');

			this.dom.circle.circleProgress({
				value: parseFloat(total/100, 10),
				startAngle: -Math.PI/2,
				thickness: 30,
				size: 220,
				//reversed: true,
				animation: {
					duration: 3000
				},
				fill: {
					gradient: ['rgb(86, 139, 180)', 'rgb(105,160,180)', 'rgb(132,177,77)']
				}
			});
			this.dom.percentage.text(total);
		},
		onJournal: function(milltrs){
			try{
				var liters = parseFloat((milltrs/1000).toFixed(2), 10);
				var goal = this.model.getGoal();
				var total = Math.round((liters/goal)*100) || 0;

				console.log(parseFloat(total/100, 10), 'current value');
				this.dom.circle.circleProgress({
					value: parseFloat(total/100, 10),
					startAngle: -Math.PI/2,
					thickness: 30,
					size: 220,
					//reversed: true,
					animation: {
						duration: 3000
					},
					fill: {
						gradient: ['rgb(86, 139, 180)', 'rgb(105,160,180)', 'rgb(132,177,77)']
					}
				});
				this.dom.percentage.text(total);
			}catch(e){
				this.onError(null, e);
			}
			
		},
		onJournalError: function(error){
			this.onError(null, error);
		},
		onMessage: function(event){
			var data = event.data;
			switch(data.message){
			case 'user:journal:success':
				//this.onSuccess(data.consumption);
				break;
			case 'user:journal:error':
				//this.onError(null, data.error);
				break;
			}
		},
		onDestroy: function(){
			this.stopListening(this.model);
			window.removeEventListener('message', this.onMessage.bind(this));
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

				ActivityIndicator.show('Guardando Consumo');
				window.postMessage({message: 'user:consumption:save', type: value});
			}catch(e){
				this.onError(null, e);
			}
		},
		deleteLast: function(){
			console.log('delete last');
		},
		onSuccess: function(){
			ActivityIndicator.hide();
			ActivityIndicator.show('Consumo Guardado');
			setTimeout(ActivityIndicator.hide, 2000);
			this.hide();
		},
		onError: function(model, error){
			ActivityIndicator.hide();
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
				this.onError(null, data.error);
				break;
			}
		}
	});

	return Index;
});