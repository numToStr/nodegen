const TokenVerifier = require("../../utils/token/token.verify");

/**
 * Middleware for verifying token and protecting routes
 * Token should be sended along with http request
 * Token should be in authorization header
 *
 * Token Format ====
 * authorization: Basic <token>
 */

const isAuth = ({ type = "access", header = true }) => (req, res, next) => {
    try {
        // Getting the Authorization header
        let bearerHeader = req.get("Authorization");

        if (!header) {
            bearerHeader = req.cookies.SESID;
        }

        // Check if any value is present in Authorization header or not
        if (!bearerHeader) {
            return res.sendStatus(403);
        }

        // Spliting the code and the token
        const [code, token] = bearerHeader.split(" ");

        // Taking out the code
        if (code !== "Basic") {
            throw new $Error("Invalid Token", 401);
        }

        // Verifying the token by the type, if error => return
        const decoded = TokenVerifier[type](token);

        // If the token type doesn't match throw error
        if (type !== decoded.type) {
            throw new $Error("Invalid Token", 401);
        }

        // Forwarding the decoded token to next middleware
        req.$USER = decoded.data;

        next();
    } catch (error) {
        // If any error comes while verifying the token sending unauthorized
        next(error);
    }
};

module.exports = isAuth;
