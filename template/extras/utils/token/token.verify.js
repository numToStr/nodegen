const { verify } = require("../../libs/token/token.lib");
const { TOKEN_KEY } = require("<your_keys_import>");

class TokenVerifier {
    // For verifying access token
    static access(token) {
        try {
            return verify(TOKEN_KEY, token);
        } catch (error) {
            throw new $Error("Unauthorized Access! Please login", 401);
        }
    }
}

module.exports = TokenVerifier;
