module.exports = {
    options: {
        quietDeps: true,
        silenceDeprecations: ['legacy-js-api'],
        sourceMap: true,
        includePaths: ['./node_modules']
    },
    local: {
        files: [{
            expand: true,
            cwd: '<%= config.pub %>/<%= config.theme %>/scss',
            src: ['*.{scss,sass}'],
            dest: '<%= config.pub %>/styles',
            ext: '.css'
        }]
    },
    deploy: {
        files: [{
            expand: true,
            cwd: '<%= config.pub %>/<%= config.theme %>/scss',
            src: ['*.{scss,sass}'],
            dest: '<%= config.pub %>/styles',
            ext: '.css'
        }]
    }
};
