const router = require("express").Router();

const { createUser, getUser } = require("./user.controllers");

router.post("/", createUser);
router.get("/:id", getUser);

module.exports = router;
