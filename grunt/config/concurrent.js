module.exports = {
    app: {
        tasks: ['connect:app', 'exec:tscWatch', 'watch'],
        options: {
            logConcurrentOutput: true
        }
    },
    test: {
        tasks: ['connect:test', 'exec:tscWatch', 'watch'],
        options: {
            logConcurrentOutput: true
        }
    }
}