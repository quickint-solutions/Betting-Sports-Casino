module.exports = {
    main: {
        options: {
            archive: '<%= config.publish %>/<%= config.constants.PublishName %>' + '.zip'
        },
        files: [{
            expand: true,
            cwd: '<%= config.dist %>/',
            src: ['**'],
        }]

    }
}