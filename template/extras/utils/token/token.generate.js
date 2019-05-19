const { generate } = require("../../libs/token/token.lib");
const { TOKEN_KEY, TOKEN_EXP } = require("<keys_import>");

class TokenGenerator {
    constructor(ctx = {}) {
        this.ctx = ctx;
        this.cookieConfig = {
            path: "/",
            secure: false,
            sameSite: true,
            httpOnly: true
        };
    }
}

// For generating access token
TokenGenerator.prototype.access = function access() {
    try {
        const accessToken = generate({
            secret: TOKEN_KEY,
            exp: TOKEN_EXP,
            payload: {
                data: this.ctx,
                type: "access"
            }
        });

        this.accessToken = accessToken;

        return this;
    } catch (error) {
        throw error;
    }
};

module.exports = TokenGenerator;
