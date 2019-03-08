#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const program = require("commander");
const { version } = require("../package.json");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");

const main = (dir = "hello-world", cmd) => {
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

    copyTemplate({
        file: ".env",
        from: ".",
        to: appName
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

function copyTemplateMulti({ from, to, glob }) {
    const binDir = path.join(TEMPLATE_DIR, from);

    fs.readdir(binDir, { encoding: "utf8" }, (err, files) => {
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

    // fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
    //     .filter(minimatch.filter(nameGlob, { matchBase: true }))
    //     .forEach(function(name) {
    //         copyTemplate(path.join(fromDir, name), path.join(toDir, name));
    //     });
}

/**
 * Copy file from template directory.
 */
function copyTemplate({ file, from, to }) {
    // Make dest directory
    // Read files from source dir
    // write files to dest dir
    const filesPath = path.join(TEMPLATE_DIR, from, file);
    const content = fs.readFileSync(filesPath);

    const destPath = path.join(to, file);

    write(content, destPath, "utf-8");
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
