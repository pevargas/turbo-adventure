// Generated on 2015-09-10 using
// generator-webapp 0.5.0-2
// modified for
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    src: {
      web: 'src/web',
      lambda: 'src/lambda',
      api: 'src/api',
      cfn: 'src/cfn',
      demo: 'src/demo'
    },
    dist: {
      web: 'dist/web',
      lambda: 'dist/lambda'
    },
    aws: grunt.file.readJSON("aws.json"),
    bootcamp: grunt.file.readJSON("bootcamp.json"),
    es: grunt.file.readJSON("es.json")
  };

  // Load Grunt Exec for AWS CLI commands
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-auto-install');
  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-run');

  var AWS = require("aws-sdk");
  var fs = require("fs");

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= config.src.web %>/scripts/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      json: {
        files: ['<%= config.src.web %>/scripts/{,*/}*.json'],
        options: {
          livereload: true
        }
      },
      jstest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['test:watch']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      styles: {
        files: ['<%= config.src.web %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.src.web %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= config.src.web %>/images/{,*/}*'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 7000,
        open: true,
        livereload: 35729,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(config.src.web)
            ];
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 7001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(config.src.web)
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%= config.dist.web %>',
          livereload: false
        }
      }
    },

    auto_install: {
      lambda: {
        options: {
          cwd: '<%=config.src.lambda%>',
          bower: false,
          recursive: true,
          exclude: ['node_modules']
        }
      }
    },

    execute: {
      bootstrap_config: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.ConfigLambdaArn%>', '<%=JSON.stringify({esEndPoint: config.es.ESEndPoint, region: config.aws.region})%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {

          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[3]
          });
          AWS.config.credentials = creds;
          var params = {
            FunctionName: options.args[1],
            Payload: options.args[2]
          };
          grunt.log.writeln(JSON.stringify(params));

          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.invoke(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      bootstrap_mappings: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.UpdateMappingLambdaArn%>', '<%=JSON.stringify({esEndPoint: config.es.ESEndPoint, region: config.aws.region})%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {
          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[3]
          });
          AWS.config.credentials = creds;

          var params = {
            FunctionName: options.args[1],
            Payload: options.args[2]
          };
          grunt.log.writeln(JSON.stringify(params));

          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.invoke(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      bootstrap_streams: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.EnableStreamLambdaArn%>', '<%=JSON.stringify({stackName: config.aws.cloudformation.stackName})%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {
          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[3]
          });
          AWS.config.credentials = creds;

          var params = {
            FunctionName: options.args[1],
            Payload: options.args[2]
          };
          grunt.log.writeln(JSON.stringify(params));

          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.invoke(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      import_swagger: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.SwaggerImportLambdaArn%>', '<%=JSON.stringify({stackName: config.aws.cloudformation.stackName, bucket: config.aws.lambda.bucket, jarKey: config.aws.api.jarKey, swaggerKey: config.aws.api.swaggerKey, region: config.aws.region})%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {
          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[3]
          });
          AWS.config.credentials = creds;

          var params = {
            FunctionName: options.args[1],
            Payload: options.args[2]
          };
          grunt.log.writeln(JSON.stringify(params));

          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.invoke(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      update_mappings_function: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.UpdateMappingLambdaArn%>', '<%=config.aws.lambda.bucket%>', 'lambda/bootstrap.zip']
        },
        call: function(grunt, options, async) {
          var params = {
            FunctionName: options.args[1],
            S3Bucket: options.args[2],
            S3Key: options.args[3]
          };
          grunt.log.writeln(params);
          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      update_enable_stream_function: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.EnableStreamLambdaArn%>', '<%=config.aws.lambda.bucket%>', 'lambda/bootstrap.zip']
        },
        call: function(grunt, options, async) {
          var params = {
            FunctionName: options.args[1],
            S3Bucket: options.args[2],
            S3Key: options.args[3]
          };
          grunt.log.writeln(params);
          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      update_config_function: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.bootcamp.ConfigLambdaArn%>', '<%=config.aws.lambda.bucket%>', 'lambda/bootstrap.zip']
        },
        call: function(grunt, options, async) {
          var params = {
            FunctionName: options.args[1],
            S3Bucket: options.args[2],
            S3Key: options.args[3]
          };
          grunt.log.writeln(JSON.stringify(params));
          var done = async();
          var lambda = new AWS.Lambda({
            region: options.args[0]
          });
          lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      write_cfn_outputs: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.aws.cloudformation.stackName%>', '<%=JSON.stringify(config.aws)%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {
          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[3]
          });
          AWS.config.credentials = creds;

          var params = {
            StackName: options.args[1]
          };
          grunt.log.writeln(options.args[2]);
          var config = JSON.parse(options.args[2]);
          grunt.log.writeln(config);
          var done = async();
          var cfn = new AWS.CloudFormation({
            region: options.args[0]
          });
          cfn.describeStacks(params, function(err, data) {
            if (err) {
              done();
            } else {
              var config = {}
              data.Stacks[0].Outputs.forEach(function(record) {
                config[record.OutputKey] = record.OutputValue;
              });
              fs.writeFileSync("./bootcamp.json", JSON.stringify(config));
              done();
            }
          });
        }
      },
      create_es_domain: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.aws.accountId%>', '<%=config.aws.es.domainName%>', '<%=config.bootcamp.ApplicationExecutionRoleArn%>', '<%=JSON.stringify(config.es)%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {
          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[5]
          });
          AWS.config.credentials = creds;
          var esConfig = JSON.parse(options.args[4]);
          var policy = esConfig.Policy;
          policy.Statement[0].Resource = "arn:aws:es:" + options.args[0] + ":" + options.args[1] + ":domain/" + options.args[2] + "/*";
          policy.Statement[0].Principal = {
            "AWS": options.args[3]
          };
          esConfig.Policy = policy;
          var params = {
            DomainName: options.args[2],
            AccessPolicies: JSON.stringify(policy)
          };
          fs.writeFileSync("es.json", JSON.stringify(esConfig));
          var done = async();
          var es = new AWS.ES({
            region: options.args[0]
          });
          es.createElasticsearchDomain(params, function(err, data) {
            if (err) {
              done();
            } else {
              done();
            }
          });
        }
      },
      write_es_config: {
        options: {
          args: ['<%=config.aws.region%>', '<%=config.aws.es.domainName%>', '<%=JSON.stringify(config.es)%>', '<%=config.aws.cliProfile%>']
        },
        call: function(grunt, options, async) {
          var creds = new AWS.SharedIniFileCredentials({
            profile: options.args[3]
          });
          AWS.config.credentials = creds;
          var esConfig = JSON.parse(options.args[2]);
          var params = {
            DomainName: options.args[1]
          };
          var done = async();
          var es = new AWS.ES({
            region: options.args[0]
          });
          es.describeElasticsearchDomain(params, function(err, data) {
            if (err) {
              done();
            } else {
              esConfig.ESEndPoint = data.DomainStatus.Endpoint;
              fs.writeFileSync("es.json", JSON.stringify(esConfig));
              done();
            }
          });
        }
      },
      load_drivers: {
        options: {
          args: ['<%=config.aws.cliProfile%>', '<%=config.aws.region%>', '<%=config.src.demo%>/drivers/drivers.json']
        },
        src: ['<%=config.src.demo%>/drivers/drivers.js']
      },
      load_restaurants: {
        options: {
          args: ['<%=config.aws.cliProfile%>', '<%=config.aws.region%>', '<%=config.src.demo%>/restaurants/restaurants.cuisine.map.final.json']
        },
        src: ['<%=config.src.demo%>/restaurants/restaurants.js']
      }
    },
    compress: {
      users: {
        options: {
          archive: '<%=config.dist.lambda%>/users.zip'
        },
        files: [{
          src: ['**'],
          cwd: '<%= config.src.lambda %>/users/',
          dest: '.',
          expand: true
        }, ]
      },
      bootstrap: {
        options: {
          archive: '<%=config.dist.lambda%>/bootstrap.zip'
        },
        files: [{
          src: ['**'],
          cwd: '<%= config.src.lambda %>/bootstrap/',
          dest: '.',
          expand: true
        }, ]
      },
      swaggerImport: {
        options: {
          archive: '<%=config.dist.lambda%>/swaggerImport.zip'
        },
        files: [{
          src: ['**'],
          cwd: '<%= config.src.lambda %>/swaggerImport/',
          dest: '.',
          expand: true
        }, ]
      },
      restaurants: {
        options: {
          archive: '<%=config.dist.lambda%>/restaurants.zip'
        },
        files: [{
          src: ['**'],
          cwd: '<%= config.src.lambda %>/restaurants/',
          dest: '.',
          expand: true
        }, ]
      },
      drivers: {
        options: {
          archive: '<%=config.dist.lambda%>/drivers.zip'
        },
        files: [{
          src: ['**'],
          cwd: '<%= config.src.lambda %>/drivers/',
          dest: '.',
          expand: true
        }, ]
      },
      predictions: {
        options: {
          archive: '<%=config.dist.lambda%>/predictions.zip'
        },
        files: [{
          src: ['**'],
          cwd: '<%= config.src.lambda %>/predictions/',
          dest: '.',
          expand: true
        }, ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist.web %>/*',
            '!<%= config.dist.web %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.src.web %>/scripts/{,*/}*.js',
        '<%= config.src.web %>/scripts/{,*/}*.json',
        '!<%= config.src.web %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },

    // Mocha testing framework configuration options
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
        }
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        ignorePath: /^\/|\.\.\//,
        src: ['<%= config.src.web %>/index.html'],
        exclude: ['bower_components/bootstrap/dist/js/bootstrap.js']
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= config.dist.web %>/scripts/{,*/}*.js',
            '<%= config.dist.web %>/styles/{,*/}*.css',
            '<%= config.dist.web %>/images/{,*/}*.*',
            '<%= config.dist.web %>/styles/fonts/{,*/}*.*',
            '<%= config.dist.web %>/*.{ico,png}'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist.web %>'
      },
      html: '<%= config.src.web %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%= config.dist.web %>', '<%= config.dist.web %>/images']
      },
      html: ['<%= config.dist.web %>/{,*/}*.html'],
      css: ['<%= config.dist.web %>/styles/{,*/}*.css']
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist.web %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist.web %>'
        }]
      }
    },

    exec: {
      s3push: {
        cmd: function(path, bucket, prefix, profile, region) {
          return 'aws s3 cp ' + path + ' s3://' + bucket + '/' + prefix + ' --recursive --profile ' + profile + ' --region ' + region;
        }
      },
      lambda: {
        cmd: function(profile, region) {
          return 'lambda/lambda.sh ' + profile + ' ' + region;
        }
      },
      s3create: {
        cmd: function(bucket, profile, region) {
          return 'aws s3api create-bucket --bucket ' + bucket + " --region " + region + " --create-bucket-configuration " + " LocationConstraint=" + region + " --profile " + profile
        }
      },
      cfnBootcampStack: {
        cmd: function(stackName, template, profile, region) {
          return 'aws cloudformation create-stack --stack-name ' + stackName + ' --template-body file://./' + template + ' --profile ' + profile + ' --region ' + region + ' --parameters=' + 'ParameterKey=BucketName,ParameterValue=' + config.aws.lambda.bucket + ' --capabilities CAPABILITY_IAM'
        }
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.src.web %>',
          dest: '<%= config.dist.web %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.webp',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*'
          ]
        }, {
          src: 'bower_components/addressfield.json/src/addressfield.json',
          dest: '<%= config.dist.web %>/scripts/addressfield.json'
        }, {
          src: 'bower_components/jquery-addressfield/src/jquery.addressfield.js',
          dest: '<%= config.dist.web %>/scripts/jquery.addressfield.js'
        }, {
          src: 'node_modules/apache-server-configs/dist/.htaccess',
          dest: '<%= config.dist.web %>/.htaccess'
        }, {
          expand: true,
          dot: true,
          cwd: 'bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= config.dist.web %>'
        }, {
          expand: true,
          dot: true,
          cwd: 'bower_components/components-font-awesome',
          src: ['fonts/*.*'],
          dest: '<%= config.dist.web %>'
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= config.src.web %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
      ]
    }
  });

  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function(target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function(target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'concurrent:test',
        'autoprefixer'
      ]);
    }

    grunt.task.run([
      'connect:test',
      'mocha'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('push-lambda', [
    'exec:s3push:' + config.dist.lambda + ':' + config.aws.lambda.bucket + ':' + 'lambda:' + config.aws.cliProfile + ':' + config.aws.region
  ]);

  grunt.registerTask('push-api', [
    'exec:s3push:' + config.src.api + ':' + config.aws.lambda.bucket + ':' + 'api:' + config.aws.cliProfile + ':' + config.aws.region
  ]);

  grunt.registerTask('compress-lambda', [
    'compress:bootstrap',
    'compress:drivers',
    'compress:predictions',
    'compress:restaurants',
    'compress:swaggerImport',
    'compress:users'
  ]);

  grunt.registerTask('bootcamp-init', [
    'exec:s3create:' + config.aws.lambda.bucket + ':' + config.aws.cliProfile + ':' + config.aws.region
  ]);

  grunt.registerTask('bootcamp-stack', [
    'exec:cfnBootcampStack:' + config.aws.cloudformation.stackName + ':' + config.src.cfn + '/lab_environment.template:' + config.aws.cliProfile + ':' + config.aws.region
  ]);

  grunt.registerTask('bootcamp', [
    'clean:dist',
    'auto_install:lambda',
    'compress-lambda',
    'push-lambda',
    'push-api',
    'bootcamp-stack'
  ]);

  grunt.registerTask('bootcamp-config', [
    'execute:write_cfn_outputs'
  ]);

  grunt.registerTask('es', [
    'execute:create_es_domain'
  ]);

  grunt.registerTask('es-config', [
    'execute:write_es_config'
  ]);

  grunt.registerTask('bootstrap', [
    'execute:bootstrap_config',
    'execute:bootstrap_mappings',
    'execute:bootstrap_streams'
  ]);

  grunt.registerTask('create-api', [
    'execute:import_swagger'
  ]);

  grunt.registerTask('load-drivers', [
    'execute:load_drivers'
  ]);

  grunt.registerTask('load-restaurants', [
    'execute:load_restaurants'
  ]);

  grunt.registerTask('publish', [
    'build',
    'exec:s3push:' + config.dist.web + ':' + config.bootcamp.WebsiteBucket + '::' + config.aws.cliProfile + ':' + config.aws.region
  ]);

  grunt.registerTask('publish-lambda', [
    'auto_install:lambda',
    'compress-lambda',
    'push-lambda'
  ]);
};
