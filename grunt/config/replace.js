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
    }
}