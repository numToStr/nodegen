#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const program = require("commander");
const { version } = require("../package.json");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");
const CHAR_ENC = "utf-8";

const main = (dir, cmd) => {
    const appName = createAppName(dir);

    // Creating Entry Folder
    mkdir(appName, ".");

    // Creating bin dir
    mkdir(appName, "bin");
    copyTemplateMulti({
        from: "bin",
        to: `${appName}/bin`
    });

    // Creating config dir
    mkdir(appName, "config");
    copyTemplateMulti({
        from: "config",
        to: `${appName}/config`
    });

    // Copying env file
    copyTemplate({
        file: ".env",
        from: ".",
        to: appName
    });

    // Copying env file
    copyTemplate({
        file: ".gitignore",
        from: ".",
        to: appName
    });

    // Copying and parsing package json
    copyTemplate({
        file: "package.json",
        from: ".",
        to: appName,
        parse: true,
        variables: [
            ["<app:name>", appName],
            ["<app:description>", "Something special"],
            ["<app:author>", "Vikas Raj"]
        ]
    });
};

program
    .version(version, "-v, --version")
    .command("init <dir>")
    .description("Initialize project directory")
    // .option("-r, --recursive", "Remove recursively")
    .action(main);

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
}

/**
 * Copy multiple files from template directory.
 */

function copyTemplateMulti({ from, to }) {
    const sourceDir = path.join(TEMPLATE_DIR, from);

    fs.readdir(sourceDir, { encoding: CHAR_ENC }, (err, files) => {
        if (err) {
            throw err;
        }

        files.forEach(file => {
            copyTemplate({
                file,
                from,
                to
            });
        });
    });
}

/**
 * Copy file from template directory.
 */
function copyTemplate({ file, from, to, parse = false, variables = [] }) {
    // Make dest directory
    // Read files from source dir
    // write files to dest dir
    const destPath = path.join(to, file);

    if (parse === true && variables.length > 0) {
        const _filePath = path.join(TEMPLATE_DIR, from, `misc/${file}.txt`);
        let parsed = fs.readFileSync(_filePath).toString(CHAR_ENC);

        variables.forEach(([key, value]) => {
            parsed = parsed.replace(new RegExp(key, "g"), value);
        });

        return write(parsed, destPath, CHAR_ENC);
    }

    const filePath = path.join(TEMPLATE_DIR, from, file);
    const content = fs.readFileSync(filePath);

    write(content, destPath, CHAR_ENC);
}

/**
 * For creating file onto the disk
 *
 * @param {String} fileName Name of the destination file
 * @param {String} context Content of the file to be written in new file
 */

function write(content, fileName) {
    fs.writeFileSync(fileName, content);
    console.log("> \x1b[36mcreated\x1b[0m : " + fileName);
}

function createAppName(pathName) {
    return path
        .basename(pathName)
        .replace(/[^A-Za-z0-9.-]+/g, "-")
        .replace(/^[-_.]+|-+$/g, "")
        .toLowerCase();
}

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} fn
 */

function emptyDirectory(dir, fn) {
    fs.readdir(dir, function(err, files) {
        if (err && err.code !== "ENOENT") throw err;
        fn(!files || !files.length);
    });
}
