module.exports = {
    dist: {
        files: [
            {
                expand: true,
                dot: true,
                cwd: '<%= config.pub %>',
                dest: '<%= config.dist %>',
                src: [
                    '*.{ico,png,txt,svg,xml,json}',
                    '.htaccess',
                    '*.html',
                    'views/{,*/}*.html',
                    //'images/{,*/}*',
                    'images/*.*',
                    'images/cover-image/{,*/}*',
                    'images/gif/{,*/}*',
                    'images/mobile/{,*/}*',
                    'images/icons/{,*/}*',
                    'images/icon2/{,*/}*',
                    //'images/scards/{,*/}*',
                    //'images/help/{,*/}*',
                    //'images/banners/{,*/}*',
                    //'images/<%= config.constants.ExtraImages %>/{,*/}*',
                    'images/<%= config.constants.WebApp %>/{,*/}*',
                    'images/<%= config.constants.WebApp %>/{,*/}*/{,*/}*',
                    'fonts/{,*/}*',
                    'audio/{,*/}*',
                    'vendor-styles/{,*/}*'
                ]
            }
            , {
                expand: true,
                cwd: '<%= config.pub %>',
                dest: '<%= config.dist %>/',
                src: ['manifest.json']
            }
            //, {
            //    expand: true,
            //    cwd: '<%= config.pub %>',
            //    dest: '<%= config.dist %>/',
            //    src: ['APP03.js']
            //}
            , {
                expand: true,
                cwd: '.tmp/images',
                dest: '<%= config.dist %>/images',
                src: ['generated/*']
            }, {
                expand: true,
                cwd: 'node_modules/bootstrap/dist',
                src: 'fonts/*',
                dest: '<%= config.dist %>'
            }, {
                expand: true,
                cwd: 'node_modules/font-awesome',
                src: 'fonts/*',
                dest: '<%= config.dist %>'
            }
        ]
    },
    styles: {
        expand: true,
        cwd: '<%= config.pub %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
    },
    tempStyles: {
        expand: true,
        cwd: '.tmp/styles/',
        dest: '<%= config.pub %>/styles',
        src: '{,*/}*.css'
    },
    fonts: {
        expand: true,
        cwd: '../BTM.Web.App/public/fonts',
        dest: 'public/fonts',
        src: '**/*'
    },
    deploy: {
        expand: true,
        cwd: '<%= config.dist %>',
        dest: '<%= config.publish %>/<%= config.constants.PublishName %>',
        src: '**/*'
    }
}