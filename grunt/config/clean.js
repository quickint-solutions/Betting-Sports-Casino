module.exports = {
    dist: {
        files: [
            {
                dot: true,
                src: [
                    '.tmp',
                    '<%= config.dist %>/{,*/}*',
                    '!<%= config.dist %>/.git*'
                ]
            }
        ]
    },
    tsoutput: {
        files: [
            {
                dot: true,
                src: [
                    '<%= config.generatedJs %>/etools.*',
                    '<%= config.generatedJs %>/etools-.*'
                ]
            }
        ]
    },
    server: '.tmp',
    jsoutputdev: {
        files: [
            {
                dot: true,
                src: [
                    '<%= config.generatedJs %>/**/*.js',
                    '<%= config.generatedJs %>/**/*.js.map'
                ]
            }
        ]
    }
}