module.exports = {
    options: {
        browsers: [
            "ie >= 10",
            "last 2 versions",
            "> 1%"
        ]
    },
    dist: {
        files: [
            {
                expand: true,
                cwd: '.tmp/styles/',
                src: '{,*/}*.css',
                dest: '.tmp/styles/'
            }
        ]
    }
}