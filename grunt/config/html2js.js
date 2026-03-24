module.exports = {
    options: {
        rename: function (moduleName) {
            moduleName = moduleName.replace('../public/sky/', 'sky/').toLowerCase();
            moduleName = moduleName.replace('../public/lotus/', 'lotus/').toLowerCase();

            moduleName = moduleName.replace('../public/betfair/', 'betfair/').toLowerCase();

            moduleName = moduleName.replace('../public/bking/', 'bking/').toLowerCase();
            moduleName = moduleName.replace('../public/dimd/', 'dimd/').toLowerCase();

            moduleName = moduleName.replace('../public/sports/', 'sports/').toLowerCase();
            moduleName = moduleName.replace('../public/dimd2/', 'dimd2/').toLowerCase();

            return moduleName.replace('../public/app/', 'app/').toLowerCase();
        },
        htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        },
        module: 'app.templates'
    },
    //app: {
    //    src: ['<%= config.app %>/**/**/*.html'],
    //    dest: '<%= config.generatedJs %>/app-templates.js'
    //},
    app: {
        src: ['<%= config.app %>/**/**/*.html', '<%= config.pub %>/<%= config.theme %>/**/**/*.html'],
        dest: '<%= config.generatedJs %>/app-templates.js'
    }
}