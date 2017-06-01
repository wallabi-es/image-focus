module.exports = function (grunt)
{

	require('time-grunt')(grunt);

	grunt.config.init({
		dir: {
			assets: 'assets',
			images: 'images',
			scss: 'scss',
			css: 'css',
			js: 'js',
			resources: 'resources'
		},

		url: {
			content: '/content'
		},

		js: {
			plugins: [
				'<%= dir.js %>/**/*.js',
				'!<%= dir.js %>/**/*.min.js'
			]
		},

		jshint: {
			plugins: '<%= js.plugins %>',
			gruntfile: 'Gruntfile.js'
		},

		uglify: {
			options: {
				preserveComments: false
			},
			plugins: {
				files: [
					{
						expand: true,
						cwd: '<%= dir.js %>',
						src: ['*.js', '!*.min.js'],
						dest: '<%= dir.js %>',
						ext: '.min.js'
					}
				]
			},
			dist: {
				files: {
					'<%= dir.js %>/growl.min.js': [
						'<%= dir.js %>/growl/*.js',
						'!<%= dir.js %>/growl/*.min.js'
					],
					'<%= dir.js %>/jquery-initialize.min.js': [
						'<%= dir.js %>/jquery-initialize/*.js',
						'!<%= dir.js %>/jquery-initialize/*.min.js'
					]
				}
			}
		},
		sass: {
			style: {
				files: [
					{
						expand: true,
						cwd: "<%= dir.scss %>",
						src: ["**/*.scss"],
						dest: "<%= dir.css %>",
						ext: '.min.css'
					}
				],
				options: {
					cleancss: true,
					outputStyle: 'compressed',
					//sourceComments: 'map',
					sourceMap: true
				}
			}
		},
		postcss: {
			css: {
				options: {
					map: true,
					processors: [
						require('autoprefixer')({browsers: ['last 5 versions', 'ie >= 9']}),
						require('csswring')
					]
				},
				src: "<%= dir.css %>/**/*.css"
			},
			sass: {
				options: {
					syntax: require('postcss-scss'),
					processors: [
						require('postcss-sorting')(
							require('./.postcss-sorting.json')
						)
					]
				},
				src: "<%= dir.scss %>/**/*.scss"
			}
		},
		csscomb: {
			options: {
				config: '.csscomb.json'
			},
			dynamic_mappings: {
				expand: true,
				cwd: '<%= dir.scss %>/',
				src: ['**/*.scss'],
				dest: '<%= dir.scss %>/',
				ext: '.scss'
			}
		},
		merge_media: {
			options: {
				compress: true
			},
			files: {
				src: "<%= dir.css %>/growl.min.css",
				dest: "<%= dir.css %>/growl.min.css"
			}
		},
		watch: {
			options: {
				livereload: true
			},

			sass: {
				files: [
					'<%= dir.scss %>/**/*.{scss,sass}',
				],
				tasks: ['sass', 'postcss:css']
			},

			// JS Watches
			jsGrunfile: {
				files: 'Grunfile.js',
				tasks: ['jshint:gruntfile']
			},
			jsPlugins: {
				files: '<%= js.plugins %>',
				tasks: ['jshint:plugins', 'uglify']
			}
		}
	});

	grunt.registerTask('default',
		['csscomb', 'postcss:sass', 'sass', 'postcss:css', 'uglify', 'merge_media', 'watch']);

	grunt.registerTask('optimize', ['postcss:sass', 'uglify']);

	grunt.registerTask('deploy', ['wp_deploy']);

	// Load all the npm tasks which starts with "grunt-"
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
