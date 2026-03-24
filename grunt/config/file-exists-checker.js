var fileorder = require('../../fileorder');

module.exports = {
    vendorJs: fileorder.vendorJs(),
    testingVendorJs: fileorder.testingVendorJs()
};