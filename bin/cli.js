#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const ejs = require("ejs");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");
const CHAR_ENC = "utf-8";

const questions = [
    {
        type: "input",
        name: "projectName",
        message: "Project Name: ",
        default: "hello-world"
    },
    {
        type: "input",
        name: "projectDescription",
        message: "Project Description: "
    },
    {
        type: "input",
        name: "authorName",
        message: "Author Name: "
    },
    {
        type: "list",
        name: "frameworkType",
        message: "Which framwork do you want to use? ",
        choices: ["express", "koa", "fastify"]
    },
    {
        type: "confirm",
        name: "isMongo",
        message: "Include mongoDB/mongoose? ",
        default: "y"
    }
];

(async () => {
    const answers = await inquirer.prompt(questions);

    const appName = createAppName(answers.projectName);

    // Creating Entry Folder
    mkdir(appName, ".");

    // // Copying template files
    // copyTemplateMulti({
    //     from: ".",
    //     to: appName
    // });

    const locals = {
        ...answers,
        projectName: appName
    }

    // Copying and parsing package json
    copyTemplate({
        file: "package.json",
        from: ".",
        to: appName,
        parse: true,
        locals
    });

    // Copying and parsing License
    copyTemplate({
        file: "LICENSE",
        from: ".",
        to: appName,
        parse: true,
        locals
    });

    // // Copying and parsing .env
    // copyTemplate({
    //     file: ".env",
    //     from: ".",
    //     to: appName,
    //     parse: true
    // });

    // // Copying and parsing .gitignore
    // copyTemplate({
    //     file: ".gitignore",
    //     from: ".",
    //     to: appName,
    //     parse: true
    // });
})();

function createAppName(pathName) {
    return path
        .basename(pathName)
        .replace(/[^A-Za-z0-9.-]+/g, "-")
        .replace(/^[-_.]+|-+$/g, "")
        .toLowerCase();
}

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
function copyTemplate({ file, from, to, parse = false, locals = {} }) {
    // Make dest directory
    // Read files from source dir
    // write files to dest dir
    const destPath = path.join(to, file);

    if (parse === true) {
        const parsed = loadTemplate({ from, file, locals });

        return write(parsed, destPath, CHAR_ENC);
    }

    const filePath = path.join(TEMPLATE_DIR, from, file);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code !== "EISDIR") {
                throw err;
            }

            if (file === "misc" || file === "node_modules") {
                return;
            }

            mkdir(to, file);
            return copyTemplateMulti({
                from: `${from}/${file}`,
                to: `${to}/${file}`
            });
        }

        write(data, destPath, CHAR_ENC);
    });
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

/**
 * Load template file.
 */

function loadTemplate({ from, file, locals }) {
    const _filePath = path.join(TEMPLATE_DIR, from, `${file}.ejs`);
    const contents = fs.readFileSync(_filePath).toString(CHAR_ENC);

    return ejs.render(contents, locals);
}
