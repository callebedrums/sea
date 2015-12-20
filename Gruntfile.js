module.exports = function (grunt) {

	var config = {
		pkg: grunt.file.readJSON('package.json'),
		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			unit: { },
			continuous: {
				singleRun: true
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				screwIE8: true
			},
			sea: {
				files: {
					'dist/sea.min.js': ['src/sea.js'],
				}
			}
		}
	};

	grunt.initConfig(config);
	
	grunt.registerTask('default', function() {
		grunt.log.write('Logging some stuff...').ok();
	});

	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
};