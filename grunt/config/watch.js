var config = require('./config');


var moduleExports = {
    options: {
        interval: 1000
    },
    html: {
        files: [
            '<%= config.app %>/**/*.html',
            '<%= config.pub %>/<%= config.theme %>/**/*.html'
        ],
        tasks: [
            'html2js'
        ],
    },
    scss: {
        files: [
            '<%= config.pub %>/<%= config.theme %>/**/*.scss'
        ],
        tasks: [
            'dart-sass:local',
            'copy:styles',
            'autoprefixer',
            'copy:tempStyles'
        ],
    },
};

if(config.enableLivereload){

    moduleExports.livereload = {
        options: {
            livereload: config.livereload
        },
        files: [
            '<%= config.generatedJs %>/execWatchfile.tsout',
            '<%= config.generatedJs %>/app-templates.js',
            '<%= config.pub %>/styles/main.css'
        ]
    };
}

module.exports = moduleExports;
