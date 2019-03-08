const express = require("express");
const app = express();

const api = require("../app/app");
const customError = require("../utils/error");

/**
 * Binding Custom Error to global
 * It will $Error constructor class to global
 * $Error class extends the native javascript Error Object
 *
 * @returns {Error}
 */
global.$Error = customError;

// Registering middlewares
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// Registering app routes
app.use("/api", api);

/**
 * Error Handling
 *
 * 1. First block is used to catch error, then
 * 2. Second block is used to handle & send error
 */
app.use((req, res, next) => {
    const error = new $Error("URL not found!", 404, "ServerError");
    next(error);
});

app.use((error, req, res, next) => {
    const {
        message = "Oops! Something went wrong",
        status = 500,
        name = "SeverError"
    } = error;

    return res.status(status).json({
        success: false,
        message,
        name
    });
});

module.exports = app;
