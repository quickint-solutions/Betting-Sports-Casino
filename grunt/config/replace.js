//replace text inside files
module.exports = {
    dev: {
        src: ['<%= config.dist %>/styles/*.css', '<%= config.dist %>/scripts/*.js', '<%= config.dist %>/vendor-styles/*.css',],
        overwrite: true,
        replacements: [
            { from: '/public/images', to: '../images' },
            { from: '/public/fonts', to: '../fonts' },
            { from: '../../public/fonts', to: '../fonts' },
            { from: '../../node_modules/font-awesome/fonts/', to: '../fonts' }
        ]
    },
    // Inject `defer` into the production-built <script> tags so the 6.5 MB of
    // vendor + app JS does not block first paint on slow CPUs (Windows desktop).
    // Runs after usemin + htmlmin in the common_build pipeline.
    deferScripts: {
        src: ['<%= config.dist %>/index.html'],
        overwrite: true,
        replacements: [
            {
                from: /<script src="(scripts\/[^"]+\.js)"><\/script>/g,
                to: '<script defer src="$1"></script>'
            }
        ]
    }
}