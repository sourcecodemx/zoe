/* globals define, _, forge, Backbone, topBarTint, buttonTint, User, aspect  */
define(function(require){
	'use strict';

	require('polyfill');
	require('jquery');
	require('progressCircle');

	var Controller = require('Root');
	var HTMLModal  = require('HTMLModal');
	var template = require('templates/home');
	var Journal = require('models/Journal');
	var Stats = require('Stats');
	var Settings = require('Settings');
	var SettingsWeight = require('SettingsWeight');
	
	var Index = Controller.extend({
		id: 'home-page',
		template: template,
		hideFx: 'fadeOut',
		showFb: 'fadeIn',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #track': 'track',
				'tap #share': 'share',
				'tap #stats': 'stats'
			});

			return events;
		})(),
		consumption: 0,
		wasOffline: false,
		title: '',
		initialize: function(){
			//Initialize main class
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
			//Add model listeners
			this.addListeners();
			//get goal
			this.data.goal =  this.model.getGoal() + ' litros';
			this.data.username = this.model.get('firstName') ? this.model.get('firstName') : this.model.get('username');

			//Listen for deletion of last consumption
			Backbone.on('journal:deletelast', this.updateJournal, this);
			Backbone.on('journal:update', this.updateJournal, this);
			Backbone.on('home:reload', this.reload, this);
			Backbone.on('user:consumption:successs', this.checkStatus, this);

			//Setup drink and midnight watchers
			this._setupWatchers();

			aspect.add(this, ['bounceInLeft', 'bounceInRight'], this.onShow.bind(this), 'after');

			return this.render();
		},
		addListeners: function(){
			this.model = User.current();
			
			//Listen for model changes
			if(this.model){
				this.listenTo(this.model, 'change:weight', this.onWeightChange, this);
				this.listenTo(this.model, 'change:username', this.onUsernameChange, this);
				this.listenTo(this.model, 'change:lastConsumption', this.onConsumptionChange, this);
			}
		},
		empty: function(){
			this.$el.empty();
			this.stopListening(this.model);
			this.model = null;
			this._clearWatchers();
			this.data = {};
			this.consumption = null;
		},
		reload: function(){
			this.empty();
			this.addListeners();
			//get goal
			this.data.goal =  this.model.getGoal() + ' litros';
			this.data.username = this.model.get('firstName') ? this.model.get('firstName') : this.model.get('username');
			this.consumption = 0;
			//Setup drink and midnight watchers
			this._setupWatchers();
			//Re-render
			this.render().show();
		},
		updateJournal: function(){
			forge.notification.showLoading('Actualizando tu Consumo');
			//Get Journal data
			this.model.getJournal()
				.then(this.onJournal.bind(this))
				.fail(this.onJournalError.bind(this));
		},
		onRender: function(){
			Controller.prototype.onRender.call(this);

			this.dom.content = this.$el.find('.page-content');
			this.dom.username = this.$el.find('#username');
			this.dom.percentage = this.$el.find('#percentage');
			this.dom.goal = this.$el.find('#goal');
			this.dom.circle = this.$el.find('#circle');
			//Fake buttons
			this.dom.settings = this.$el.find('#settings');
			this.dom.weight = this.$el.find('#weight');
			this.dom.autio = this.$el.find('#audio');

			if(this.online){
				//Update current journal
				this.updateJournal();
			}else{
				this._updateConsumptionUI(0);
			}

			forge.launchimage.hide();
		},
		onShow: function(){
			//Configure home buttons and title
			this.setupButtons();

			if(this.shareModal){
				this.shareModal.hide();
			}
		},
		onHide: function(){
			Controller.prototype.onHide.call(this);
			
			if(this.shareModal){
				this.shareModal.hide();
			}
		},
		onRightButton: function(){
			if(!this.online){
				this.onError(null, {message: 'Necesitas de con una conexion a internet para poder usar el panel de configuracion.'});
				return;
			}

			Backbone.trigger('header:hide');
			this.bounceOutLeft();

			if(this.views.settings){
				this.views.settings.show();
			}else{
				this.views.settings = new Settings().show();
			}

			this.listenToOnce(this.views.settings, 'hide', this.bounceInLeft.bind(this));
		},
		setupButtons: function(){
			forge.topbar.setTint(topBarTint);
			forge.topbar.setTitle(this.title);
			forge.topbar.removeButtons();
			forge.topbar.addButton({
				icon: 'images/menu@2x.png',
				position: 'left',
				prerendered: true
			}, this.toggleMenu.bind(this));
			
			forge.topbar.setTitleImage('images/logo@2x.png');
			forge.topbar.addButton({
				icon: 'images/settings@2x.png',
				position: 'right',
				prerendered: true
			}, this.onRightButton.bind(this));
			forge.topbar.show();
		},
		track: function(){
			if(!this.online){
				this.offlineError();
				return;
			}

			if(!this.model.get('weight')){
				forge.notification.confirm(
					'¡Hey!',	
					'Necesitas escribir tu peso para poder generar consumo',
					'Hacerlo',
					'Despues',
					this.onWeightConfirmation.bind(this)
				);
			}else{
				if(!this.modal){
					this.modal = new CheckModal();
				}
				//Callback hell!
				if(this.consumption && this.consumption >= 100){
					setTimeout(function(){
						forge.notification.confirm(
							'¡Hey!',
							'Ya has logrado tu meta diaria, la sobrehidrtacion no es buena.',
							'Leer mas',
							'OK',
							function(readMore){
								switch(readMore){
								case true:
									forge.tabs.openWithOptions({
										url: 'http://es.wikipedia.org/wiki/Hiperhidrataci%C3%B3n',
										tint: topBarTint,
										buttonIcon: 'images/close@2x.png',
										buttonTint: buttonTint
									});
									break;
								case false:
									this.modal.show();
								}
							}.bind(this));
					}.bind(this), 1);
				}else {
					this.modal.show();
				}

				this.listenToOnce(this.modal, 'hide', this.onShow.bind(this));
			}
		},
		share: function(message){
			if(!this.online){
				this.offlineError();
				return;
			}

			var goal = this.model.getGoal();
			var consumption = this.consumption;
			var user = User.current();
			var username = user.get('firstName') ? user.get('firstName') : encodeURIComponent(user.get('username'));
			var m = 'Mi meta del día son ' + this.model.getGoal() + ' litros, hoy he completado el ' + this.consumption + '% de mi hidratación alcalina. #alcalinizate';
			
			if(_.isString(message)){
				m = message;
			}

			Backbone.trigger('share', m, 'today', username, consumption, goal);
		},
		playAudio: function(url) {
			if(!this.player){
				forge.file.getLocal(url, function(file){
					forge.media.createAudioPlayer(file, function(player){
						this.player = player;
						player.play();
					}.bind(this));
				}.bind(this));
			}else{
				this.player.play();
			}
		},
		stats: function(){
			if(!this.online){
				this.offlineError();
				return;
			}

			forge.notification.showLoading('Cargando Estadisticas');

			this.model.getStats()
				.then(function(computed){
					forge.notification.hideLoading();
					//Create and show stats modal
					if(this.views.stats){
						this.views.stats.update(computed).show();
					}else{
						this.views.stats = new Stats({
							days: computed
						}).show();
					}
					//Reconfigure navigation bar
					this.listenToOnce(this.views.stats, 'hide', this.onShow.bind(this));
				}.bind(this))
				.fail(function(error){
					forge.notification.hideLoading();
					this.onError(null, error);
				}.bind(this));
		},
		checkStatus: function(){
			if(this.wasOffline){
				this.updateJournal();
				this.wasOffline = false;
			}
		},
		onUsernameChange: function(){
			this.dom.username.text(this.model.get('username'));
		},
		onWeightConfirmation: function(y){
			if(y){
				this.bounceOutLeft();

				if(this.views.weightView){
					this.views.weightView.show();
				}else{
					this.views.weightView = new SettingsWeight().show();
				}

				this.listenToOnce(this.views.weightView, 'hide', this.bounceInLeft.bind(this));
			}
		},
		onWeightChange: function(){
			this.dom.goal.text(this.model.getGoal());
			this.updateJournal();
		},
		onConsumptionChange: function(model, lastConsumption){
			var consumption = lastConsumption.get('consumption')/1000;
			var goal = this.model.getGoal();
			var percentage = Math.floor((consumption/goal)*100);
			var currentText = this.dom.percentage.text();
			var current = (currentText === '~') || _.isEmpty(currentText) ? 0 : parseInt(currentText, 10);
			var total = current + percentage;

			this._updateConsumptionUI(total);

			if(this.consumption >= 100){
				setTimeout(function(){
					forge.notification.alert('¡Felicidades!', 'Lograste tu meta de hoy');
				}, 1);
			}

			this.playAudio('audio/confirmation.mp3');
			
		},
		onJournal: function(milltrs){
			try{
				forge.notification.hideLoading();

				var liters = parseFloat((milltrs/1000).toFixed(2), 10);
				var goal = this.model.getGoal();
				var total = Math.floor((liters/goal)*100) || 0;

				this._updateConsumptionUI(total);
			}catch(e){
				this.onError(null, e);
			}
			
		},
		onJournalError: function(error){
			forge.notification.hideLoading();
			this.onError(null, error);
		},
		onDestroy: function(){
			this.stopListening(this.model);
			this._clearWatchers();
			this.consumption = null;
			this.data = null;

			_.invoke(this.views, Backbone.View.prototype.destroy);
			this.views = null;

			aspect.remove(this, ['bounceInLeft', 'bounceInRight'], this.onShow.bind(this), 'after');
		},
		onOffline: function(){
			Controller.prototype.onOffline.call(this);

			this.wasOffline = true;
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
			//afternoonWatcher.setHours(18,0,0,0);
			afternoonWatcher.setHours(18,0,0,0);

			var midnightWatcher = new Date();
			midnightWatcher.setHours(23,59,59,59);

			var now = new Date();
			var tillMidnight = midnightWatcher - now;
			//var pushData = {badge: 1, sound: 'audio/confirmation/wav'};

			if(now < noonWatcher){
				this.noonWatcher = setTimeout(function(){
					if(this.consumption < 50){
						forge.notification.alert('¡Hey!', 'Solo has consumido el ' + this.consumption + '% de tu hidratacion diaria :(');
					}
				}.bind(this), noonWatcher - now);
			}

			if(now < afternoonWatcher){
				this.afternoonWatcher = setTimeout(function(){
					if(this.consumption < 75){
						forge.notification.alert('¡Hey!', 'Solo has consumido el ' + this.consumption + '% de tu hidratacion diaria :(');
					}
				}.bind(this), afternoonWatcher - now);
			}
			//Reload home page layout after midnight
			if(tillMidnight > 1000*60){
				this.midnightWatcher = setTimeout(function(){
					this.playAudio('audio/confirmation.mp3');
					forge.notification.alert('¡Hey!', 'El dia ha terminado y completaste el ' + this.consumption + '% de tu hidratacion.');
					Backbone.history.navigate('#home', {trigger: true});
				}.bind(this), tillMidnight);
			}
		},
		_updateConsumptionUI: function(total){
			total = total || 0;
			var totalLabel = total ? total : '~';

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
			this.dom.percentage.text(totalLabel);
		}
	});
	
	var CheckModal = HTMLModal.extend({
		events: (function () {
			var events = _.extend({}, HTMLModal.prototype.events, {
				'tap .check': 'save',
				'tap #deleteLast': 'deleteLast'
			});

			return events;
		})(),
		template: require('templates/home_modal_check'),
		title: 'Capturar Consumo',
		titleImage: 'images/titles/track.png',
		initialize: function(){
			HTMLModal.prototype.initialize.apply(this, arguments);

			return this;
		},
		save: function(e){
			try{
				var value = $(e.currentTarget).attr('data-value');
				var type = parseInt(value, 10);
				var consumption = new Journal({consumption: type});

				forge.notification.showLoading('Guardando tu Consumo');

				//Save selected consumption
				consumption.save()
					.then(function(){
						var user = User.current();
						var journals = user.relation('journal');

						journals.add(consumption);
						user.set('lastConsumption', consumption);

						user
							.save()
							.then(function(){
								this.onSuccess();
							}.bind(this), function(error){
								this.onError(null, error);
							}.bind(this));
					}.bind(this), function(error){
						this.onError(null, error);
					}.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		deleteLast: function(){
			var user = User.current();
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
			HTMLModal.prototype.onShow.call(this);

			var user = User.current();
			var lastConsumption = user.get('lastConsumption');

			if(lastConsumption && lastConsumption.id){
				this.dom.deleteLast.removeAttr('disabled');
			}

			forge.topbar.removeButtons();

			if(this.titleImage){
				forge.topbar.setTitleImage(this.titleImage, _.noop, _.noop);
			}else{
				forge.topbar.setTitle(this.title);
			}

			forge.topbar.addButton({
				icon: 'images/close@2x.png',
				position: 'left',
				prerendered: true
			}, this.hide.bind(this));
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Consumo Guardado');
			setTimeout(function(){
				forge.notification.hideLoading();
				Backbone.trigger('user:consumption:successs');
			}, 2000);
			this.hide();
		},
		onError: function(model, error){
			forge.notification.hideLoading();
			Controller.prototype.onError.call(this, null, error);
		}
	});

	return Index;
});