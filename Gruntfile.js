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
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-uglify');

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
					'!www/javascripts/zoe.js',
					'!www/javascripts/progressCircle.js',
					'!www/javascripts/infobox.js'
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

	grunt.registerTask('steroids-uglify', 'Compress Javascript files', function(){
		grunt.extendConfig({
			uglify: {
				dist: {
					options: {
						compress: {
							drop_console: true
						}
					},
					files: [{
						expand: true,
						cwd: 'dist/',
						src: [
							'components/*/**/*.js',
							'!components/steroids-js/steroids.js'
						],
						dest: 'dist/'
					}]
				}
			}
		});

		return grunt.task.run('uglify');
	});

	grunt.registerTask('steroids-imagemin', 'Optimize images', function(){
		grunt.extendConfig({
			imagemin: {
				dist: {
					files: [{
						expand: true,
						cwd: 'www/images',
						src: '{,*/}*.{png,jpg,jpeg}',
						dest: 'dist/images'
					}]
				}
			}
		});

		return grunt.task.run('imagemin');
	});

	grunt.registerTask('steroids-copy-www', 'Copy files from www/ to dist/ (except for .scss and .coffee)', function() {
		grunt.extendConfig({
			copy: {
				www: {
					expand: true,
					cwd: 'www/',
					src: [
						'*.*',
						'images/**/*.*',
						'javascripts/**/*.js',
						'stylesheets/**/*.*',
						'audio/*',
						'!stylesheets/**/*.scss',
						//Define components to copy
						'components/aspect.js/src/*.js',
						'components/backbone/backbone.js',
						'components/cryptojslib/rollups/sha3.js',
						'components/jquery/dist/jquery.min.js',
						'components/lodash/dist/lodash.min.js',
						'components/parse-1.2.19.min/index.js',
						'components/requirejs/require.js',
						'components/steroids-js/steroids.js'
					],
					dest: 'dist/'
				}
			}
		});
		return grunt.task.run('copy:www');
	});

	grunt.registerTask('default', [
		'steroids-jshint',
		'steroids-make',
		'steroids-compile-sass',
		'steroids-jade'/*,
		'steroids-imagemin',
		'steroids-uglify'
		*/
	]);

};
