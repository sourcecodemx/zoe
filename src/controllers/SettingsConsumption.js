/* globals define, User, forge, _ */
define(function(require){
	'use strict';

	var Controller = require('Controller');

	return Controller.extend({
		id: 'settings-weight-page',
		template: require('templates/settings_weight'),
		title: 'Configurar Consumo',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'tap #settings-weight-items label': 'checkConsumptionType'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));

			//Get username
			this.data.weight = User.current().get('weight') || 0;

			var settings = User.current().get('settings');
			if(settings && settings.consumptionType === 'custom'){
				this.data.liters = this.data.weight * 0.036;
				this.data.weight = 0;
			}
			this.render();
		},
		checkConsumptionType: function(e){
			var consumptionType = $(e.currentTarget).find('input').val();

			switch(consumptionType){
			case 'custom':
				this.toggleConsumptionByCustom();
				break;
			default:
				this.toggleConsumptionByWeight();
				break;
			}
		},
		toggleConsumptionByWeight: function(){
			this.dom.customPanel.hide();
			this.dom.weightPanel.show();
			this.dom.weightSwitch.attr('checked', 'checked');
			this.dom.customSwitch.removeAttr('checked');
		},
		toggleConsumptionByCustom: function(){
			this.dom.weightPanel.hide();
			this.dom.customPanel.show();
			this.dom.customSwitch.attr('checked', 'checked');
			this.dom.weightSwitch.removeAttr('checked');
		},
		onRender: function(){
			this.dom = {
				weight: this.$el.find('#kgs'),
				lts: this.$el.find('#lts'),
				content: this.$el.find('.page-content'),
				customPanel: this.$el.find('#consumptionByCustom'),
				weightPanel: this.$el.find('#consumptionByWeight'),
				weightSwitch: this.$el.find('#settingsConsumptionByWeightToggle'),
				customSwitch: this.$el.find('#settingsCustomConsumptionToggle')
			};

			//Display panel by consumption type
			var settings = User.current().get('settings');
			switch(settings.consumptionType){
			case 'custom':
				this.toggleConsumptionByCustom();
				break;
			default:
				this.toggleConsumptionByWeight();
				break;
			}
		},
		onShow: function(){
			this.setupButtons();
			this.bounceInRight();
		},
		hide: function(){
			this.bounceOutRight();
			this.trigger('hide');
		},
		setupButtons: function(){
			forge.topbar.removeButtons();
			forge.topbar.setTitle(this.title);
			forge.topbar.addButton({
				position: 'left',
				icon: 'images/back@2x.png',
				prerendered: true
			}, this.hide.bind(this));
		},
		submit: function(e){
			try{
				if(e && e.preventDefault){
					e.preventDefault();
				}

				if(!this.online){
					this.offlineError();
					return;
				}

				var consumptionType = this.$el.find('input[checked]').val();
				var data = {};

				switch(consumptionType){
				case 'custom':
					var liters = parseInt(this.dom.lts.val(), 10);
					if(!liters){
						throw new Error('Por favor introduce una cantidad para poder actualizar tu consumo.');
					}else if(liters < 1){
						throw new Error('Por salud no podemos recomendarte consumir menos de 1 litro diario.');
					}else if(liters > 4){
						throw new Error('Por salud no podemos recomandarte consumir mas de 4 litros diarios, la sobre hidratación no es buena.');
					}else if(liters === this.data.liters){
						throw new Error('Ese es tu consumo personalizado actual, no hay necesidad de guardarlo de nuevo.');
					}
					//Set weight based on how many liters user wants to drink
					data = {weight: liters/0.036, settings: {consumptionType: 'custom'}};
					break;
				default:
					var weight = parseInt(this.dom.weight.val(), 10);
					if(!weight){
						throw new Error('Por favor introduce tu peso.');
					}else if(weight<=40){
						throw new Error('El peso no puede ser menor de 40.');
					}else if(weight === this.data.weight){
						throw new Error('Ese es tu peso actual, no hay necesidad de guardarlo de nuevo.');
					}
					//Set weight
					data = {weight: weight, settings: {consumptionType: 'weight'}};
					break;
				}
				
				forge.notification.showLoading('Guardando');

				User.current()
					.save(data)
					.then(this.onSuccess.bind(this))
					.fail(this.onError.bind(this));
			}catch(e){
				this.onError(null, e);
			}
		},
		onSuccess: function(){
			forge.notification.hideLoading();
			forge.notification.showLoading('Tu consumo ha sido actualizado.');
			setTimeout(forge.notification.hideLoading.bind(window), 2000);
		}
	});
});