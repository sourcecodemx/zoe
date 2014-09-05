/* global define */
define('user', ['parse'], function(Parse){
	'use strict';

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
				.greaterThan('createdAt', today)
				.lessThan('createdAt', todayEnd)
				.find(function(results){
					return results;
				})
				.then(function(results){
					return results.reduce(function(current, next){return current+next.get('consumption');}, 0);
				});
		}
	});
});