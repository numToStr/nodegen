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
        mkdir(dir, "bin");

        copyTemplateMulti({
            from: "bin",
            to: `${dir}/bin`
        });
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
}

/**
 * Copy multiple files from template directory.
 */

function copyTemplateMulti({ from, to, nameGlob }) {
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
