module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
	    concat: {
            css: {
                src: [
                    'css/bootstrap.min.css',
					'css/animate.css',
					'css/font-awesome.min.css',
					'css/font.css',
					'css/prettyPhoto.css',
					'css/main.css',
					'css/responsive.css'
                ],
                dest: 'css/combined.css'
            },
            
             js1: {
                src: [
                    'js/jquery.js',
                    'js/bootstrap.js',
                    'js/jquery.prettyPhoto.js',
                    'js/gmaps.js'
                ],
                dest: 'js/combined.js'
            },

            js2: {
                src: [
                    'js/jquery.parallax.js',
                    'js/jquery.isotope.js',
                    'js/jquery.appear.js',
                    'js/jquery.inview.js',
                    'js/wow.js',
                    'js/jquery.countTo.js',
                    'js/smooth-scroll.js',
                    'js/canvas.js',
                    'js/preloader.js',
                    'js/main.js'

                ],
                dest: 'js/combined_appendix.js'
            }
        },
        cssmin: {
            css: {
                src: 'css/combined.css',
                dest: 'css/combined.min.css'
            }
        },
        // uglify
        watch: {
			files: ['css/main.css','css/responsive.css', 'js/main.js'],
			tasks: ['concat', 'cssmin']
	   }
	});

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:js', 'uglify:js' ]);
    grunt.loadNpmTasks('grunt-dev-update');
};


