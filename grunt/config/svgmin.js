module.exports = {
    dist: {
        files: [
            {
                expand: true,
                cwd: '<%= config.pub %>/images',
                src: '{,*/}*.svg',
                dest: '<%= config.dist %>/images'
            }
        ]
    }
}