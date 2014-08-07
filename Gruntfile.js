/*
 * Default Gruntfile for AppGyver Steroids
 * http://www.appgyver.com
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-steroids');
	grunt.loadNpmTasks('grunt-jade');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('steroids-jshint', 'JSHINT:ALL', function(){
		grunt.extendConfig({
			jshint: {
				options: {
					jshintrc: '.jshintrc'
				},
				all: [
					'Gruntfile.js',
					'www/javascripts/{,*/}*.js',
					'app/{,*/}*.js',
					//Ignore the following
					'!www/javascripts/templates/*',
					'!www/javascripts/console.log.android.js',
					'!www/javascripts/console.log.js',
					'!www/javascripts/onerror.android.js',
					'!www/javascripts/onerror.js',
					'!www/javascripts/zoe.js'
				]
			}
		});

		return grunt.task.run('jshint:all');
	});

	grunt.registerTask('steroids-jade', 'Compile jade templates', function() {
		grunt.extendConfig({
			jade: {
				dist: {
					files: {
						'dist/javascripts/templates/': ['www/javascripts/templates/{,*/}*.jade']
					},
					options: {
						dependencies: 'jade',
						wrap: {
							wrap: true,
							amd: true,
							dependencies: 'jade'
						}
					}
				}
			}
		});
		return grunt.task.run('jade');
	});

	grunt.registerTask('default', ['steroids-jshint', 'steroids-make', 'steroids-compile-sass', 'steroids-jade']);

};
