/// <binding AfterBuild='build:js' Clean='clean' />
'use strict';

module.exports = function (grunt) {
    var gruntConfig = {};
    // setup config variables
    gruntConfig.config = require('./grunt/config/config');

    //autoprefix css for older browsers
    grunt.loadNpmTasks('grunt-autoprefixer');
    gruntConfig.autoprefixer = require('./grunt/config/autoprefixer');

    //clean folders, to start fresh
    grunt.loadNpmTasks('grunt-contrib-clean');
    gruntConfig.clean = require('./grunt/config/clean');

    //grunt server that starts your browser and performs livereload
    grunt.loadNpmTasks('grunt-contrib-connect');
    gruntConfig.connect = require('./grunt/config/connect');

    //copy files and folders
    grunt.loadNpmTasks('grunt-contrib-copy');
    gruntConfig.copy = require('./grunt/config/copy');

    //execute a commando in your cmd.exe process
    grunt.loadNpmTasks('grunt-exec');
    gruntConfig.exec = require('./grunt/config/exec');

    //watch for changes to files and perform other action when something changes
    grunt.loadNpmTasks('grunt-contrib-watch');
    gruntConfig.watch = require('./grunt/config/watch');

    //inject your JS into your html files
    grunt.loadNpmTasks('grunt-file-blocks');
    gruntConfig.fileblocks = require('./grunt/config/fileblocks');

    //add an unique number to the DIST assets for better caching
    grunt.loadNpmTasks('grunt-filerev');
    gruntConfig.filerev = require('./grunt/config/filerev');

    //put your html inside angular templatecache
    grunt.loadNpmTasks('grunt-html2js');
    gruntConfig.html2js = require('./grunt/config/html2js');

    //lint your HTML
    grunt.loadNpmTasks('grunt-htmlhint');
    gruntConfig.htmlhint = require('./grunt/config/htmlhint');

    //minify your html
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    gruntConfig.htmlmin = require('./grunt/config/htmlmin');

    //karma testrunner
    //grunt.loadNpmTasks('grunt-karma');
    //gruntConfig.karma = require('./grunt/config/karma');

    //make sure that the DI is in the correct syntax - inline array annotation (for obfuscation)
    grunt.loadNpmTasks('grunt-ng-annotate');
    gruntConfig.ngAnnotate = require('./grunt/config/ngAnnotate');

    //make constant files depending on environment (local/deployed)
    grunt.loadNpmTasks('grunt-ng-constant');
    gruntConfig.ngconstant = require('./grunt/config/ngconstant');

    //generate documents from ngDoc (jsdoc) syntax
    grunt.loadNpmTasks('grunt-ngdocs');
    gruntConfig.ngdocs = require('./grunt/config/ngdocs');

    //replace text
    grunt.loadNpmTasks('grunt-text-replace');
    gruntConfig.replace = require('./grunt/config/replace');

    //compile SASS to CSS
    grunt.loadNpmTasks('grunt-dart-sass');
    gruntConfig['dart-sass'] = require('./grunt/config/sass');

    //minification of SVG
    grunt.loadNpmTasks('grunt-svgmin');
    gruntConfig.svgmin = require('./grunt/config/svgmin');

    //linting of typescript
    grunt.loadNpmTasks('grunt-tslint');
    gruntConfig.tslint = require('./grunt/config/tslint');

    //uglify and obfuscation of JS
    grunt.loadNpmTasks('grunt-contrib-uglify');
    gruntConfig.uglify = require('./grunt/config/uglify');

    //minificiation (use-min is a special one)
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    gruntConfig.useminPrepare = require('./grunt/config/useminPrepare');
    gruntConfig.usemin = require('./grunt/config/usemin');

    //run live tasks concurrently
    grunt.loadNpmTasks('grunt-concurrent');
    gruntConfig.concurrent = require('./grunt/config/concurrent');

    // compress dist files
    grunt.loadNpmTasks('grunt-contrib-compress');
    gruntConfig.compress = require('./grunt/config/compress');



    //path-casing task, check that all path's must have lower kebab case    
    //grunt.loadNpmTasks('@hohr/grunt-path-casing');
    //gruntConfig.pathCasing = require('./grunt/config/pathCasing');

    //file-exists-checker, check if all path's in fileorder exists
    //grunt.loadNpmTasks('@hohr/grunt-file-exists-checker');
    //gruntConfig.fileExistsChecker = require('./grunt/config/file-exists-checker');

    //get usage of hohr directives and filters. This data is available in angular constants, so that you can use it in a test.
    //output is in '.usage-stats/*.js'
    //grunt.loadNpmTasks('@hohr/grunt-usage-stats');

    // hohr-lint
    //require('@hohr/hohr-lint')(grunt);
    //gruntConfig.hohrlint = require('./grunt/config/hohrlint');

    // ----------------------------------------------------------------------------
    //          init configuration, with configuration that is created above
    // ----------------------------------------------------------------------------
    grunt.initConfig(gruntConfig);


    grunt.registerTask('config_constants', function (version) {
        gruntConfig.config.constants = gruntConfig.ngconstant[version].constants.settings;
        //console.log(gruntConfig.config);
    });


    // ----------------------------------------------------------------------------
    //                         start your app tasks
    // ----------------------------------------------------------------------------
    grunt.registerTask('serve', 'Compile then start a connect web server', [
        'build:js',
        'copy:styles',
        'autoprefixer',
        'build:html',
        'clean:tsoutput',
        'ngconstant:local',
        'config_constants:local',
        //'fileExistsChecker:vendorJs',
        'fileblocks:intranet',
        'dart-sass:local',
        'concurrent:app'
    ]);

    grunt.registerTask('start-application', [
        'lint',
        'testrunner',
        'serve'
    ]);

    grunt.registerTask('updatejson', function (key, value) {
        var projectFile = "dist/" + gruntConfig.config.constants.WebApp + "/manifest.json";

        if (!grunt.file.exists(projectFile)) {
            grunt.log.error("file " + projectFile + " not found");
            return true;//return false to abort the execution
        }
        var project = grunt.file.readJSON(projectFile);//get file as json object

        project['short_name'] = gruntConfig.config.constants.Title.split(' ')[0];
        project['name'] = gruntConfig.config.constants.Title;
        project['description'] = gruntConfig.config.constants.Title;
        project['icons'][0].src = '/images/' + gruntConfig.config.constants.WebApp + '/fav192.png';
        project['background_color'] = gruntConfig.config.constants.ThemeColor;
        project['theme_color'] = gruntConfig.config.constants.ThemeColor;

        grunt.file.write(projectFile, JSON.stringify(project, null, 2));
    });

    grunt.registerTask('addExternalFile', function (key, value) {
        var projectFile = "dist/" + gruntConfig.config.constants.WebApp + "/APP03.js";
        var pf = grunt.file.read("custom-scripts/debugger.js");
        grunt.file.write(projectFile, pf);

    });


    // ----------------------------------------------------------------------------
    //                              build tasks
    // ----------------------------------------------------------------------------
    grunt.registerTask('common_build', [
        'useminPrepare',
        'build:html',
        'dart-sass:local',
        'copy:styles',
        //'svgmin',
        'autoprefixer',
        'clean:tsoutput',
        //'fileExistsChecker:vendorJs',
        'fileblocks:intranet',
        'ngAnnotate',
        'copy:dist',
        'updatejson',
        'cssmin',
        'concat',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin',
        //'addExternalFile',
        //'concurrent:app'
        'replace',
        //'compress'
        'copy:deploy',
    ]);


    grunt.registerTask('build:js', 'clean output folders and generate JS from TS', [
        'clean',
        'exec:tsc'
    ]);

    grunt.registerTask('build:html', 'Converts all the html to 1 javascript file', [
        //'pathCasing',
        'html2js'
    ]);



    grunt.registerTask('deploy_uk_maruti', [
        'build:js',
        'ngconstant:deploy_uk_maruti',
        'config_constants:deploy_uk_maruti',
        'common_build',
    ]);


    grunt.registerTask('deploy_one247_io', [
        'build:js',
        'ngconstant:deploy_one247_io',
        'config_constants:deploy_one247_io',
        'common_build'
    ]);
    grunt.registerTask('deploy_one247_bet', [
        'build:js',
        'ngconstant:deploy_one247_bet',
        'config_constants:deploy_one247_bet',
        'common_build'
    ]);
    
    grunt.registerTask('deploy_fairbook', [
        'build:js',
        'ngconstant:deploy_fairbook',
        'config_constants:deploy_fairbook',
        'common_build'
    ]);
    grunt.registerTask('deploy_bookpro', [
        'build:js',
        'ngconstant:deploy_bookpro',
        'config_constants:deploy_bookpro',
        'common_build'
    ]);
   
    grunt.registerTask('deploy_royalexch', [
        'build:js',
        'ngconstant:deploy_royalexch',
        'config_constants:deploy_royalexch',
        'common_build'
    ]);
    grunt.registerTask('deploy_bazigarbet', [
        'build:js',
        'ngconstant:deploy_bazigarbet',
        'config_constants:deploy_bazigarbet',
        'common_build'
    ]);
    grunt.registerTask('deploy_jaibook', [
        'build:js',
        'ngconstant:deploy_jaibook',
        'config_constants:deploy_jaibook',
        'common_build'
    ]);
    
    grunt.registerTask('deploy_jackpot247', [
        'build:js',
        'ngconstant:deploy_jackpot247',
        'config_constants:deploy_jackpot247',
        'common_build'
    ]);
    grunt.registerTask('deploy_winjoy365', [
        'build:js',
        'ngconstant:deploy_winjoy365',
        'config_constants:deploy_winjoy365',
        'common_build'
    ]);
   
    grunt.registerTask('deploy_lucky77', [
        'build:js',
        'ngconstant:deploy_lucky77',
        'config_constants:deploy_lucky77',
        'common_build'
    ]);
    grunt.registerTask('deploy_wicket777', [
        'build:js',
        'ngconstant:deploy_wicket777',
        'config_constants:deploy_wicket777',
        'common_build'
    ]);
    grunt.registerTask('deploy_wicket777_admin', [
        'build:js',
        'ngconstant:deploy_wicket777_admin',
        'config_constants:deploy_wicket777_admin',
        'common_build'
    ]);
  
    grunt.registerTask('deploy_book365', [
        'build:js',
        'ngconstant:deploy_book365',
        'config_constants:deploy_book365',
        'common_build'
    ]);
    grunt.registerTask('deploy_book365_admin', [
        'build:js',
        'ngconstant:deploy_book365_admin',
        'config_constants:deploy_book365_admin',
        'common_build'
    ]);
    grunt.registerTask('deploy_rockybook24', [
        'build:js',
        'ngconstant:deploy_rockybook24',
        'config_constants:deploy_rockybook24',
        'common_build'
    ]);
    grunt.registerTask('deploy_betinexchange99', [
        'build:js',
        'ngconstant:deploy_betinexchange99',
        'config_constants:deploy_betinexchange99',
        'common_build'
    ]);
    grunt.registerTask('deploy_bsafe999', [
        'build:js',
        'ngconstant:deploy_bsafe999',
        'config_constants:deploy_bsafe999',
        'common_build'
    ]);
   
    // bazigar
    grunt.registerTask('deploy_bazigar', [
        'build:js',
        'ngconstant:deploy_bazigar',
        'config_constants:deploy_bazigar',
        'common_build'
    ]);
    grunt.registerTask('deploy_lucky7', [
        'build:js',
        'ngconstant:deploy_lucky7',
        'config_constants:deploy_lucky7',
        'common_build'
    ]);
    grunt.registerTask('deploy_abexch9', [
        'build:js',
        'ngconstant:deploy_abexch9',
        'config_constants:deploy_abexch9',
        'common_build'
    ]);
    grunt.registerTask('deploy_king247', [
        'build:js',
        'ngconstant:deploy_king247',
        'config_constants:deploy_king247',
        'common_build'
    ]);
    grunt.registerTask('deploy_drpapaya', [
        'build:js',
        'ngconstant:deploy_drpapaya',
        'config_constants:deploy_drpapaya',
        'common_build'
    ]);
    grunt.registerTask('deploy_drpapaya_admin', [
        'build:js',
        'ngconstant:deploy_drpapaya_admin',
        'config_constants:deploy_drpapaya_admin',
        'common_build'
    ]);
    grunt.registerTask('deploy_thekingbook', [
        'build:js',
        'ngconstant:deploy_thekingbook',
        'config_constants:deploy_thekingbook',
        'common_build'
    ]);
    grunt.registerTask('deploy_drpapayaio', [
        'build:js',
        'ngconstant:deploy_drpapayaio',
        'config_constants:deploy_drpapayaio',
        'common_build'
    ]);
    grunt.registerTask('deploy_minister777', [
        'build:js',
        'ngconstant:deploy_minister777',
        'config_constants:deploy_minister777',
        'common_build'
    ]);
    grunt.registerTask('deploy_minister777_admin', [
        'build:js',
        'ngconstant:deploy_minister777_admin',
        'config_constants:deploy_minister777_admin',
        'common_build'
    ]);
    grunt.registerTask('deploy_win555', [
        'build:js',
        'ngconstant:deploy_win555',
        'config_constants:deploy_win555',
        'common_build'
    ]);

    grunt.registerTask('deploy_new_ui', [
        'build:js',
        'ngconstant:deploy_new_ui',
        'config_constants:deploy_new_ui',
        'common_build'
    ]);

    // lucky7
    grunt.registerTask('deploy_lotusbook9', [
        'build:js',
        'ngconstant:deploy_lotusbook9',
        'config_constants:deploy_lotusbook9',
        'common_build'
    ]);
    grunt.registerTask('deploy_lotusbook7', [
        'build:js',
        'ngconstant:deploy_lotusbook7',
        'config_constants:deploy_lotusbook7',
        'common_build'
    ]);
    grunt.registerTask('deploy_lotusbook9io', [
        'build:js',
        'ngconstant:deploy_lotusbook9io',
        'config_constants:deploy_lotusbook9io',
        'common_build'
    ]);
    grunt.registerTask('deploy_exch444', [
        'build:js',
        'ngconstant:deploy_exch444',
        'config_constants:deploy_exch444',
        'common_build'
    ]);
    grunt.registerTask('deploy_rock7', [
        'build:js',
        'ngconstant:deploy_rock7',
        'config_constants:deploy_rock7',
        'common_build'
    ]);
    grunt.registerTask('deploy_exch333', [
        'build:js',
        'ngconstant:deploy_exch333',
        'config_constants:deploy_exch333',
        'common_build'
    ]);
    // ----------------------------------------------------------------------------
    //                              testing tasks
    // ----------------------------------------------------------------------------
    grunt.registerTask('testrunner', [
        'build:js',
        'build:html',
        'ngconstant:local',
        'config_constants:deploy_local',
        'usageStats',
        'karma'
    ]);

    grunt.registerTask('test', [
        'build:js',
        'build:html',
        'ngconstant:local',
        'config_constants:deploy_local',
        'usageStats',
        'fileExistsChecker',
        'fileblocks:test',

        'concurrent:test'
    ]);

    // ----------------------------------------------------------------------------
    //                              lint task
    // ----------------------------------------------------------------------------
    grunt.registerTask('lint', [
        'htmlhint',
        'tslint',
        'hohrlint',
        //'sasslint'
    ]);
};
