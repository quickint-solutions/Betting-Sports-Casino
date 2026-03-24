var fileorder = require('../../fileorder.js');

module.exports = {
    options: {
        rebuild: true
    },
    intranet: {
        src: '<%= config.pub %>/index.html',
        blocks: {
            'vendor': {
                src: [].concat(
                    fileorder.vendorJs()
                ),
                prefix: '../'
            },
            'scripts': {
                src: [].concat(
                    fileorder.srcJsWithoutSpecs('<%= config.generatedJs %>')
                ),
                prefix: '../'
            },
        }
    },
    deploy: {
        src: '<%= config.pub %>/index.html',
        blocks: {
            'vendor': {
                src: [].concat(
                    fileorder.vendorJs()
                ),
                prefix: '../'
            },
            'scripts': {
                src: [].concat(
                    fileorder.srcJsWithoutSpecs('<%= config.generatedJs %>')
                        //.concat(['<%= config.pub %>/APP03.js'])
                ),
                prefix: '../'
            },
        }
    },
    test: {
        src: '<%= config.test %>/debug.html',
        blocks: {
            'all': {
                src: [].concat(
                    fileorder.testingVendorJs(),
                    fileorder.srcJsWithSpecs('<%= config.generatedJs %>')
                ),
                prefix: '../'
            },
        },
    }
}