#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const program = require("commander");
const { version } = require("../package.json");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");

program
    .version(version, "-v, --version")
    .command("init <dir>")
    .description("Initialize project directory")
    .option("-r, --recursive", "Remove recursively")
    .action((dir, cmd) => {
        mkdir(".", dir);
    });

program.parse(process.argv);

/**
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */

function mkdir(base, dir) {
    const dirPath = path.join(base, dir);
    fs.mkdirSync(dirPath);

    copyTemplate("bin/www.js", `${dirPath}/www.js`);

    console.log("\n Project created: %s", dir);
}

/**
 * Copy file from template directory.
 */
function copyTemplate(from, to) {
    // Make dest directory
    // Read files from source dir
    // write files to dest dir
    const filesPath = path.join(TEMPLATE_DIR, from);

    const files = fs.readFileSync(filesPath);

    write(to, files, "utf-8");
}

/**
 * For creating file onto the disk
 *
 * @param {String} file
 * @param {String} str
 */

function write(file, str) {
    fs.writeFileSync(file, str);
    console.log("> \x1b[36mcreated\x1b[0m : " + file);
}
