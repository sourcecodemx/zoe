/* globals define, _ */
define(function(require){
	'use strict';

	var Modal = require('http://localhost/controllers/core/Modal.js');
	var template = require('http://localhost/javascripts/templates/stats.js');

	var Index = Modal.extend({
		id: 'stats-page',
		template: template,
		events: (function () {
			var events = _.extend({}, Modal.prototype.events, {

			});

			return events;
		})(),
		initialize: function(){
			Modal.prototype.initialize.apply(this, arguments);

			return this.render();
		}
	});

	return {
		Index: Index
	};
});