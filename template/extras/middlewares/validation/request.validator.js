const Joi = require("@hapi/joi");

/**
 * Router Middleware for validating incoming request payload
 * @param {Object} schema Joi validation Schema
 * @param {String} where Telling where to look for values to validate. Possible values: body(default) | query | params | cookies
 * @returns {Function} Express middleware
 * @throws {Error}
 */
const validator = (schema, where = "body") => (req, __, next) => {
    try {
        const { error } = Joi.validate(req[where], schema);
        if (error) {
            throw new $Error(error.message, 400, ":ValidationError");
        }

        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = validator;
