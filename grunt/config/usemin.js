// Performs rewrites based on filerev and the useminPrepare configuration
module.exports = {
    html: ['<%= config.dist %>/{,*/}*.html'],
    css: ['<%= config.dist %>/styles/{,*/}*.css'],
    options: {
        assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
    }
}