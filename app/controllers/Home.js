/* globals define, steroids, _, Parse, ActivityIndicator, Media, Backbone  */
define(function(require){
	'use strict';

	require('polyfill');
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
				'click #share': 'share',
				'click #stats': 'stats'
			});

			return events;
		})(),
		consumption: 0,
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.model = Parse.User.current();

			//Listen for model changes
			this.listenTo(this.model, 'change:weight', this.onWeightChange, this);
			this.listenTo(this.model, 'change:username', this.onUsernameChange, this);
			this.listenTo(this.model, 'change:lastConsumption', this.onConsumptionChange, this);

			//Create stats view
			this.views.stats = new steroids.views.WebView({location: 'http://localhost/views/Stats/index.html', id: 'statsIndexView'});
			this.views.stats.preload();

			//get goal
			this.data.goal =  this.model.getGoal() + ' litros';
			this.data.username = this.model.get('firstName') ? this.model.get('firstName') : this.model.get('username');

			//Nivigationbar
			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);
			leftButton.imageAsOriginal = false;
			
			var rightButton = new steroids.buttons.NavigationBarButton();
			rightButton.imagePath = '/images/settings@2x.png';
			rightButton.onTap = this.onRightButton.bind(this);
			rightButton.imageAsOriginal = false;

			steroids.view.navigationBar.update({
				titleImagePath: '/images/logo@2x.png',
				buttons: {
					left: [leftButton],
					right: [rightButton]
				}
			});
			steroids.view.navigationBar.show();

			//Listen for messages
			window.addEventListener('message', this.onMessage.bind(this));
			//Update current journal
			this.updateJournal();
			//Listen for deletion of last consumption
			Backbone.on('journal:deletelast', this.updateJournal, this);
			Backbone.on('home:reload', this.reload, this);

			//Setup drink and midnight watchers
			this._setupWatchers();

			return this.render();
		},
		reload: function(){
			this.$el.empty();
			//get goal
			this.data.goal =  this.model.getGoal() + ' litros';
			this.data.username = this.model.get('firstName') ? this.model.get('firstName') : this.model.get('username');
			//Reset consumption
			this.consumption = 0;
			//Clear watchers
			this._clearWatchers();
			//Setup drink and midnight watchers
			this._setupWatchers();
			//Re-render
			this.render().show();
			//Update current journal
			this.updateJournal();
		},
		updateJournal: function(){
			ActivityIndicator.show('Actualizando Consumo');
			//Get Journal data
			this.model.getJournal()
				.then(this.onJournal.bind(this))
				.fail(this.onJournalError.bind(this));
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
		onRightButton: function(){
			//Hide menu (if visible)
			if(this.dom.menu && this.dom.menu.position().top === 0){
				this.toggleMenu();
			}
			//Use DOM defined attributes

			this.dom.settings.trigger('click');
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
				//Callback hell!
				if(this.consumption && this.consumption >= 100){
					setTimeout(function(){
						navigator.notification.confirm(
							'Ya has logrado tu meta diaria, la sobrehidrtacion no es buena.',
							function(index){
								switch(index){
								case 1:
									if(!this.hyperhidratationView){
										this.hyperhidratationView = new steroids.views.WebView({
											location: 'http://es.wikipedia.org/wiki/Hiperhidrataci%C3%B3n',
											id: 'hyperhidratationView'
										});
										this.hyperhidratationView.preload({}, {
											onSuccess: function(){
												steroids.layers.push({
													view: this.hyperhidratationView,
													navigationBar: true
												});
											}.bind(this)
										});
									}else{
										steroids.layers.push({
											view: this.hyperhidratationView,
											navigationBar: true
										});
									}
									break;
								case 2:
									this.modal.show();
								}
							}.bind(this),
							'Hey',
							['Leer mas', 'Ok']);
					}.bind(this), 1);
				}else {
					this.modal.show();
				}
			}
		},
		share: function(){
			//Ask to share message
			window.plugins.socialsharing.share(
				'Mi meta del dia son ' + this.model.getGoal() + ' litros, hoy he completado el ' + this.consumption + '% de mi hidratacion diaria.',
				null,
				null,
				'http://zoewater.com.mx');
		},
		playAudio: function(url) {
			// Play the audio file at url
			var media = new Media(url,
				// success callback
				function () {
					console.log('playAudio():Audio Success');
				},
				// error callback
				function (err) {
					console.log('playAudio():Audio Error: ' + err);
				}
			);
			// Play audio
			media.play();
		},
		stats: function(){
			ActivityIndicator.show('Cargando Estadisticas');

			this.model.getStats()
				.then(function(computed){
					ActivityIndicator.hide();
					
					window.postMessage({message: 'stats:fetch:success', stats: computed, goal: this.model.getGoal()});
					
					steroids.modal.show({
						view: this.views.stats,
						navigationBar: true
					});
				}.bind(this))
				.fail(function(error){
					ActivityIndicator.hide();
					this.onError(null, error);
				}.bind(this));
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
		onConsumptionChange: function(model, lastConsumption){
			var consumption = lastConsumption.get('consumption')/1000;
			var goal = this.model.getGoal();
			var percentage = Math.floor((consumption/goal)*100);
			var current = parseInt(this.dom.percentage.text(), 10);
			var total = current + percentage;

			this.consumption = total;

			this.dom.circle.circleProgress({
				value: parseFloat(total/100, 10),
				startAngle: -Math.PI/2,
				thickness: 30,
				size: 220,
				animation: {
					duration: 3000
				},
				fill: {
					gradient: ['rgb(27,166,217)', 'rgb(95,189,49)']
				}
			});
			this.dom.percentage.text(total);

			if(this.consumption >= 100){
				setTimeout(function(){
					navigator.notification.alert('Lograste tu meta de hoy', $.noop, 'Felicidades');
				}, 1);
			}

			this.playAudio('http://localhost/audio/confirmation.wav');
			
		},
		onJournal: function(milltrs){
			try{
				ActivityIndicator.hide();

				var liters = parseFloat((milltrs/1000).toFixed(2), 10);
				var goal = this.model.getGoal();
				var total = Math.floor((liters/goal)*100) || 0;

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
						gradient: ['rgb(27,166,217)', 'rgb(95,189,49)']
					}
				});
				this.dom.percentage.text(total);
				this.consumption = total;
			}catch(e){
				this.onError(null, e);
			}
			
		},
		onJournalError: function(error){
			ActivityIndicator.hide();
			this.onError(null, error);
		},
		onDestroy: function(){
			this.stopListening(this.model);
			this._clearWatchers();
			this.consumption = null;
			this.data = null;
			this.views.stats.unload();
			this.views.stats = null;
			this.views = null;

			window.removeEventListener('message', this.onMessage.bind(this));
		},
		_clearWatchers: function(){
			clearTimeout(this.noonWatcher);
			clearTimeout(this.afternoonWatcher);
			clearTimeout(this.midnightWatcher);

			this.noonWatcher = null;
			this.afternoonWatcher = null;
			this.midnightWatcher = null;
		},
		_setupWatchers: function(){
			//Setup drink watchers
			var noonWatcher = new Date();
			noonWatcher.setHours(12,0,0,0);

			var afternoonWatcher = new Date();
			afternoonWatcher.setHours(18,0,0,0);

			var midnightWatcher = new Date();
			midnightWatcher.setHours(23,59,59,59);

			var now = new Date();
			var tillMidnight = midnightWatcher - now;

			if(now < noonWatcher){
				this.noonWatcher = setTimeout(function(){
					if(this.consumption < 50){
						navigator.notification.vibrate();
						navigator.notification.beep(1);
						navigator.notification.alert('Solo has consumido el ' + this.consumption + '% de tu hidratacion diaria :(', _.noop, 'Hey!');
					}
				}.bind(this), noonWatcher - now);
			}

			if(now < afternoonWatcher){
				this.afternoonWatcher = setTimeout(function(){
					if(this.consumption < 75){
						navigator.notification.vibrate();
						navigator.notification.beep(1);
						navigator.notification.alert('Solo has consumido el ' + this.consumption + '% de tu hidratacion diaria :(', _.noop, 'Hey!');
					}
				}.bind(this), afternoonWatcher - now);
			}
			//Reload home page layout after midnight
			if(tillMidnight > 1000*60){
				this.midnightWatcher = setTimeout(function(){
					this.playAudio('http://localhost/audio/confirmation.wav');
					navigator.notification.vibrate();
					navigator.notification.beep(1);
					navigator.notification.alert('El dia ha terminado y completaste el ' + this.consumption + '% de tu hidratacion.', _.noop, 'Hey!');
					Backbone.trigger('home:reload');
				}.bind(this), tillMidnight);
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

				ActivityIndicator.show('Guardando Consumo');
				window.postMessage({message: 'user:consumption:save', type: value});
			}catch(e){
				this.onError(null, e);
			}
		},
		deleteLast: function(){
			var user = Parse.User.current();
			var lastConsumption = user.get('lastConsumption');

			if(lastConsumption && lastConsumption.id){
				lastConsumption.destroy()
					.then(this.onDeleteLast.bind(this))
					.fail(this.onDeleteLastError.bind(this));
			}
		},
		onDeleteLast: function(){
			this.dom.deleteLast.prop('disabled', true);
			Backbone.trigger('journal:deletelast');
			this.hide();
		},
		onDeleteLastError: function(error){
			switch(error.code){
			case 101:
				error.message = 'Solo puedes borrar el ultimo consumo capturado.';
				break;
			}

			this.onError(null, error);
		},
		onRender: function(){
			this.dom.deleteLast = this.$el.find('#deleteLast');
		},
		onShow: function(){
			var user = Parse.User.current();
			var lastConsumption = user.get('lastConsumption');

			if(lastConsumption && lastConsumption.id){
				this.dom.deleteLast.removeAttr('disabled');
			}
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