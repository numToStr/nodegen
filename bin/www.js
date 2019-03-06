#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const program = require("commander");
const { version } = require("../package.json");

program
    .version(version, "-v, --version")
    .command("init <dir>")
    .description("Initialize project directory")
    .option("-r, --recursive", "Remove recursively")
    .action((dir, cmd) => {
        const dirPath = path.join(".", dir);

        fs.mkdir(dirPath, error => {
            if (error) {
                throw error;
            }

            console.log("Directory created: %s", dir);
        });
    });

program.parse(process.argv);
