module.exports = {
    dist: {
        src: [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '!<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '!<%= config.dist %>/images/avatars/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= config.dist %>/styles/fonts/*'
        ]
    }
}