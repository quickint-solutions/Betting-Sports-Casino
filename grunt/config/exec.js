var config = require('./config');


module.exports = {
    tsc: {
        cmd: 'node ./node_modules/typescript/lib/tsc'
    },
    tscWatch: {
        cmd: 'node ./node_modules/typescript/lib/tsc -watch | node node_modules/grep-cli/bin/cli/grep.js "Compilation complete" > '+config.generatedJs+'/execWatchfile.tsout'
    }
}