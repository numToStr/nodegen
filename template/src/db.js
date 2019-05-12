const mongoose = require("mongoose");

const db = uri => {
    return mongoose.connect(uri, {
        useFindAndModify: true,
        useNewUrlParser: true
    });
};

module.exports = db;
