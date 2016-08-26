module.exports = function(grunt) {
	grunt.initConfig({
		srcFile: 'src/',
		build: 'build/',
		testFile: 'tests/',
		//serverFolder: 'C:/Developppment/Web/Servers/pizi-express-server/Apps/pizi-backbone-localStorage/',
		serverFolder: 'C:/Users/e_na/Documents/GitHub/pizi-express-server/Apps/pizi-backbone-localStorage/',
		jshint: {
			all: {
				options: {
					devel: true,
					esnext: true
				},
				src: ['src/pizi-backbone-localStorage.js']
			}
		},
		copy: {
			deployDev : {
				files : [
					{
						expand: true,
						cwd: '<%= srcFile %>',
						src: ["**/*.js",
							"!lib/**/*"],
						dest: '<%= serverFolder %>'
					}
				]
			},
			deployTest: {
				files : [
					{
						expand: true,
						cwd: '<%= testFile %>',
						src: ['**'],
						dest: '<%= serverFolder %>'
					},
					{
						expand: true,
						cwd: 'node_modules/',
						src: [
							'backbone/backbone.js',
							'backbone/node_modules/underscore/underscore.js',
							'jquery/dist/jquery.js',
							'pizi-localStorage/build/pizi-localStorage.js'
						],
						dest: '<%= serverFolder %>',
						flatten: true
					}
				]
			},
			deployBuild : {
				files : [
					{
						expand: true,
						cwd: '<%= build %>',
						src: ['**'],
						dest: '<%= serverFolder %>'
					}
				]
			}
		},
		clean: {
			options :{
				force : true
			},
			deploy: '<%= serverFolder %>',
			build: '<%= build %>'
		},
		babel: {
			options: {
				sourceMap: false,
				"experimental": true,
        		"modules": "umd"
			},
			dist: {
				files: [{
					"expand": true,
					"cwd": '<%= srcFile %>',
					"src": ["**/*.js",
							"!lib/**/*"],
					"dest": '<%= build %>',
					"ext": ".js"
				}]
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-babel');
	
	grunt.registerTask('build', ['jshint', 'clean:build', 'babel']);
	grunt.registerTask('deployDev', ['jshint', 'clean:deploy', 'copy:deployDev', 'copy:deployTest']);
	grunt.registerTask('deployBuild', ['build', 'clean:deploy', 'copy:deployBuild', 'copy:deployTest']);
};