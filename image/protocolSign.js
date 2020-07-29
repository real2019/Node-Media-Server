const Constants = require("../constants");
const logger = require('../node_core_logger');
const Crypto = require('crypto-js')

class ProtocolSign {
    constructor() {
        
    }


    validSign(data) {
        let str = Constants.username + data.nonce + data.time_stamp + JSON.stringify(data.data);
        logger.info("str:", str);

        let signStr = Crypto.HmacSHA256(str, Constants.password).toString(Crypto.enc.Base64);
        logger.debug("signStr:", signStr);

        return (signStr === data.sign);
    }

    getSignString(data) {
        let str = Constants.username + data.nonce + data.time_stamp + JSON.stringify(data.data);
        logger.debug("str:", str);

        let signStr = Crypto.HmacSHA256(str, Constants.password).toString(Crypto.enc.Base64);
        logger.debug("signStr:", signStr);

        return signStr;
    }
}

module.exports = ProtocolSign;
