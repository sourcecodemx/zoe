/* globals define, _, steroids */
define(function(require){
	'use strict';

	var Controller = require('http://localhost/controllers/core/Root.js');

	return Controller.extend({
		id: 'premier-page',
		template: require('http://localhost/javascripts/templates/premier.js'),
		title: 'Zoé Water Premier',
		events: (function () {
			var events = _.extend({}, Controller.prototype.events, {
				'click #information': 'info'
			});

			return events;
		})(),
		initialize: function(){
			Controller.prototype.initialize.apply(this, arguments);

			this.views.information = new steroids.views.WebView({location: 'http://localhost/views/Premier/information.html', id: 'premierInformationView'});
			this.views.information.preload();

			var leftButton = new steroids.buttons.NavigationBarButton();
			leftButton.imagePath = '/images/menu@2x.png';
			leftButton.onTap = this.onLeftButton.bind(this);

			steroids.view.navigationBar.update({
				title: this.title,
				buttons: {
					left: [leftButton]
				}
			});
			steroids.view.navigationBar.show();

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'premierView'){
				steroids.view.navigationBar.update({
					title: this.title
				});
			}
		},
		info: function(){
			steroids.modal.show({
				view: this.views.information,
				navigationBar: true
			});
		}
	});
});