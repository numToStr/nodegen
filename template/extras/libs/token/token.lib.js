const jwt = require("jsonwebtoken");

/**
 * For generating Buffer from token payload
 * @param {Any} data Any data payload which are valid for Buffer
 * @returns {String}
 */
const genBuff = data => Buffer.from(data, "base64");

/**
 * Common function for generating token
 * @returns {String} jwt token
 */
const generate = ({ secret, exp, payload }) => {
    const secret = genBuff(secret);

    return jwt.sign(payload, secret, {
        expiresIn: exp,
        algorithm: ["HS256"]
    });
};

/**
 * Common function for verifying token
 * @param {String} secret Token Secret key
 * @param {String} token Actual jwt to verify
 * @returns {Object} Decoded Token if successfully verified
 * @throws {Error}
 */
const verify = (secret, token) => {
    const secret = genBuff(secret);

    return jwt.verify(token, secret, {
        algorithms: ["HS256"]
    });
};

module.exports = {
    generate,
    verify
};
