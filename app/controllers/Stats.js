/* globals define, steroids */
define(function(require){
	'use strict';

	var Modal = require('http://localhost/controllers/core/Modal.js');
	var template = require('http://localhost/javascripts/templates/stats.js');

	var Index = Modal.extend({
		id: 'stats-page',
		template: template,
		initialize: function(){
			Modal.prototype.initialize.apply(this, arguments);

			return this.render();
		},
		onLayerWillChange: function(event){
			if(event && event.target && event.target.webview.id === 'statsView'){
				var rightButton = new steroids.buttons.NavigationBarButton();
				rightButton.imagePath = '/images/share.png';

				var leftButton = new steroids.buttons.NavigationBarButton();
				leftButton.imagePath = '/images/close.png';
				leftButton.onTap = this.onLeftButton.bind(this);

				steroids.view.navigationBar.update({
					title: 'Estadisticas',
					closeButton: leftButton,
					buttons: {
						left: [leftButton],
						right: [rightButton]
					}
				});
				steroids.view.navigationBar.show();
			}
		}
	});

	return {
		Index: Index
	};
});