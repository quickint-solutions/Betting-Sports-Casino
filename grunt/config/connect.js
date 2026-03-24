var config = require('./config');


var moduleExports = {

    options: {

        // Change this to '0.0.0.0' to access the server from outside.
        hostname  : 'localhost'
    },

    app: {
        options: {
            port      : config.appPort,
            keepalive : true,
            open      : {
                target: 'http://localhost:' + config.appPort + '/public'
            }
        }
    },
    test: {
        options: {
            port      : config.testPort,
			keepalive : true,
            open      : {
                target: 'http://localhost:' + config.testPort + '/test/debug.html'
            }
        }
    }
};

if(config.enableLivereload){

    moduleExports.app.options.livereload = config.livereload;
}

module.exports = moduleExports;