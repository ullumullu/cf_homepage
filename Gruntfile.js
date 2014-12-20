module.exports = function(grunt) {


  // Use to dynamically adapt the folder structure
  var globalConfig = {
    src: 'src', // <%= globalConfig.src %>
    staticfiles: 'public', // <%= globalConfig.staticfiles %>
    dest: 'build', // <%= globalConfig.dest %>
    dbpath: './data/db'
  }

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    globalConfig: globalConfig,

    autoprefixer: {
      build: {
        expand: true,
        flatten: true,
        cwd: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>',
        src: 'css/**/*.css',
        dest: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/css/'
      }
    },

    clean: {
      build: {
        src: [ '<%= globalConfig.dest %>' ]
      },

      stylesheets: {
        expand: true, 
        cwd: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>',
        src: [ 'css/**/*.css', '!css/production.min.css' ]
      },

      scripts: {
        expand: true,
        cwd: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>',
        src: [ 'js/**/*.js', '!js/production.min.js', '!js/production.libs.min.js','!js/libs/ckeditor/**/*.js', '!js/libs/angular/*.min.js', '!js/libs/jquery/*.js', '!js/admin/*.js', '!js/services/*.js'  ]
      }
    },

    concat: {
      options: {
        separator: ';',
        soureMap: true
      },
      js: {
        src : ['<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/*.js'],
        dest: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/production.js'
      },
      libs: {
        src : ['<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/libs/*.js'],
        dest: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/production.libs.js'
      }
    },

    concurrent: {
      dev: {
        tasks: ['shell:devdb', 'nodemon:dev', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    copy: {
      build: {
        cwd: '<%= globalConfig.src %>',
        src: [ '**', '!**/*.styl', '!**/*.coffee', '!**/*.jade' ],
        dest: '<%= globalConfig.dest %>',
        expand: true
      }
    },

   cssmin: {
    options:{
        // banner to be put on the top of the minified file using package name and todays date
        // note that we are reading our project name using pkg.name i.e name of our project
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/css/production.min.css': [ '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/css/**/*.css' ]
        }
      }
    },

    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/img',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/img/'
        }]
      }
    },

    less: {
     dev: {
         options: {
         },
         files: {
          "<%= globalConfig.src %>/<%= globalConfig.staticfiles %>/css/forum_site_less.css": "<%= globalConfig.src %>/<%= globalConfig.staticfiles %>/less/forum_site.less",
          "<%= globalConfig.src %>/<%= globalConfig.staticfiles %>/css/forum_adminarea_less.css": "<%= globalConfig.src %>/<%= globalConfig.staticfiles %>/less/forum_adminarea.less"
        }
     },
     production: {
         options: {
             paths: ['<%= globalConfig.src %>/<%= globalConfig.staticfiles %>'],
             cleancss: true
         },
         files: {"css/forum_site_less.css": "less/forum_site.less"}
     }
    },

    nodemon: {
      dev: {
        script: '<%= globalConfig.src %>/bin/www',
        options: {
          args: ['dev'],
          nodeArgs: ['--debug'],
          env: {
            PORT: '3000'
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('open')('http://localhost:3000');
              }, 1000);
            });
          },
          cwd: __dirname,
          ignore: ['<%= globalConfig.src %>/public/**'],
          ext: 'js,coffee',
          watch: ['<%= globalConfig.src %>'],
          delay: 1000,
          legacyWatch: true
        }
      }
    },

    open: {
       dev : {
        path: 'http://127.0.0.1:3000/',
        app: 'Chrome'
      }
    },

    processhtml: {
      build: {
        options: {
          process: true,
        },
        files: [{
          expand: true,
          cwd: '<%= globalConfig.dest %>/views',
          src: ['**/*.html'],
          dest: '<%= globalConfig.dest %>/views'
        }]
      },
    },

	shell: {
	  devdb: {
	      command: 'mongod --dbpath <%= globalConfig.dbpath %>',
	      options: {
	          async: false,
	          stdout: false,
	          stderr: true,
	          failOnError: true,
	          execOptions: {
	              cwd: '.'
	          }
	       }
	    }
	},

    uglify: {
      options:{
        // banner to be put on the top of the minified file using package name and todays date
        // note that we are reading our project name using pkg.name i.e name of our project
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/production.min.js': ['<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/production.js'],
          '<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/production.libs.min.js': ['<%= globalConfig.dest %>/<%= globalConfig.staticfiles %>/js/production.libs.js']
        }
      }
    },

    watch: {

      less: {
        files: "<%= globalConfig.src %>/<%= globalConfig.staticfiles %>/less/*",
        tasks: ["less:dev"]
      },

      css: {
          files: ['<%= globalConfig.src %>/public/css/**/*.css'],
          options: {
            // Start a live reload server on the default port 35729
            livereload: true,
          },
      },

      js: {
          files: ['<%= globalConfig.src %>/public/js/**/*.js'],
          options: {
            // Start a live reload server on the default port 35729
            livereload: true,
          },
      },      

      img: {
          files: ['<%= globalConfig.src %>/public/img/**/*'],
          options: {
            // Start a live reload server on the default port 35729
            livereload: true,
          },
      }
      
    },

  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "less" task.
  grunt.loadNpmTasks('grunt-contrib-less');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "imagemin" task.
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  // Load the plugin that provides the "watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
 
  // Load the plugin that provides the "copy" task.
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Load the plugin that provides the "clean" task.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Load the plugin that provides the "cssmin" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Load the plugin that provides the "autoprefixer" task.
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Load the plugin that provides the "processhtml" task.
  grunt.loadNpmTasks('grunt-processhtml');

    // Load the plugin that provides the "nodemon" task.
  grunt.loadNpmTasks('grunt-nodemon');

  // Load the plugin that provides the "open" task.
  grunt.loadNpmTasks('grunt-open');

    // Load the plugin that provides the "concurrent" task.
  grunt.loadNpmTasks('grunt-concurrent');

  // Load the plugin that provides the "grunt-shell-spawn" task.
  grunt.loadNpmTasks('grunt-shell-spawn');

  // Stylesheets task(s)
  grunt.registerTask(
    'stylesheets', 
    'Compiles the stylesheets.', 
    [ 'autoprefixer', 'cssmin', 'clean:stylesheets' ]
  );

  // Script task(s) 
  grunt.registerTask(
    'scripts', 
    'Compiles the JavaScript files.', 
    [ 'concat:js','concat:libs', 'uglify', 'clean:scripts' ]
  );

  // Image task(s) 
  grunt.registerTask(
    'images', 
    'Compiles the JavaScript files.', 
    ['imagemin']
  );

  // Build task(s).
   grunt.registerTask(
    'build', 
    'Compiles all of the assets and copies the files to the build directory.', 
    [ 'clean:build', 'copy','stylesheets', 'scripts', 'images', 'processhtml:build']
  );

    // Build task(s).
   grunt.registerTask(
    'dev', 
    'Watches the project for changes, automatically builds them and runs a server.', 
    ['concurrent:dev']
  );

  // Default task(s).
  grunt.registerTask('default', ['dev']);

};