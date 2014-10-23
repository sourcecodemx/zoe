/* global define */
define('user', ['parse'], function(Parse){
	'use strict';

	var config = require('config');

	return Parse.User.extend({
		getGoal: function(){
			var weight = this.get('weight') || 0;
			return (weight * 0.03).toFixed(2);
		},
		getJournal: function(){
			var journal = this.relation('journal');
			var today = new Date();
			var todayEnd = new Date();

			today.setHours(0,0,0,0);
			todayEnd.setHours(23,59,59,999);

			return journal.query()
				.greaterThanOrEqualTo('createdAt', today)
				.lessThanOrEqualTo('createdAt', todayEnd)
				.find(function(results){
					return results;
				})
				.then(function(results){
					var consumption = this.consumption = results.reduce(function(current, next){return current+next.get('consumption');}, 0);
					return consumption;
				}.bind(this));
		},
		getStats: function(){
			var day = 24 * 60 * 60 * 1000;
			var journal = this.relation('journal');
			var today = new Date();
			var todayEnd = new Date();

			today.setHours(0, 0, 0, 0);
			todayEnd.setHours(23, 59, 59, 999);

			var yesterday = new Date((today*1)-day);
			var beforeYesterday = new Date((yesterday*1)-day);
			var aWeekAgo = new Date((today*1)-(day*6));
			var aMonthAgo = new Date((today*1)-(day*30));
			var userAge = (today - this.createdAt)/day;
			var goal = this.getGoal()*1000;
			
			return journal.query()
				.greaterThanOrEqualTo('createdAt', aMonthAgo)
				.lessThanOrEqualTo('createdAt', todayEnd)
				.find()
				.then(function(results){
					var computed = [];
					var sum = function(current, next){return current+next.get('consumption');};
					
					computed.push({
						total: results.filter(function(r){return (r.createdAt > today && r.createdAt <= todayEnd);}).reduce(sum, 0),
						label: 'Hoy ' + config.DATE.DAY[today.getDay()] + ' ' + today.getDate(),
						type: 'today',
						goal: goal
					});

					if(userAge > 0){
						computed.push({
							total: results.filter(function(r){return (r.createdAt > yesterday && r.createdAt < today);}).reduce(sum, 0),
							label: 'Ayer ' + config.DATE.DAY[yesterday.getDay()] + ' ' + yesterday.getDate(),
							type: 'yesterday',
							goal: goal
						});
					}
					if(userAge > 1){
						computed.push({
							total: results.filter(function(r){return (r.createdAt > beforeYesterday && r.createdAt < yesterday);}).reduce(sum, 0),
							label: 'Antier ' + config.DATE.DAY[beforeYesterday.getDay()] + ' ' + beforeYesterday.getDate(),
							type: 'beforeyesterday',
							goal: goal
						});
					}
					if(userAge > 6){
						computed.push({
							total: results.filter(function(r){return (r.createdAt > aWeekAgo && r.createdAt <= todayEnd);}).reduce(sum, 0),
							label: 'Ultima semana',
							type: 'week',
							goal: goal
						});
					}
					if(userAge > 29){
						computed.push({
							total: results.filter(function(r){return (r.createdAt > aMonthAgo && r.createdAt <= todayEnd);}).reduce(sum, 0),
							label: 'Ultimo mes',
							type: 'month',
							goal: goal
						});
					}
					return computed;
				});
		}
	});
});