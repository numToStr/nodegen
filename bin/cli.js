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
        message: "Project Name:",
        default: "hello-world"
    },
    {
        type: "input",
        name: "projectDescription",
        message: "Project Description:",
        default: "Something special"
    },
    {
        type: "input",
        name: "authorName",
        message: "Author Name:"
    },
    {
        type: "list",
        name: "frameworkType",
        message: "Which framwork do you want to use?",
        choices: ["express", "koa", "fastify"]
    },
    {
        type: "confirm",
        name: "isMongo",
        message: "Include mongoDB/mongoose?",
        default: "y"
    },
    {
        type: "input",
        name: "initialComponent",
        message: "Name of the initial component:",
        default: "user"
    }
];

// For sanitizing folder name
const createAppName = pathName => {
    return path
        .basename(pathName)
        .replace(/[^A-Za-z0-9.-]+/g, "-")
        .replace(/^[-_.]+|-+$/g, "")
        .toLowerCase();
};

/**
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */

const mkdir = (base, dir) => {
    const dirPath = path.join(base, dir);
    fs.mkdirSync(dirPath);
};

/**
 * Copy multiple files from template directory.
 */

const copyMulti = ({ from, to, locals, appendName = "" }) => {
    const sourceDir = path.join(TEMPLATE_DIR, from);

    fs.readdir(sourceDir, { encoding: CHAR_ENC }, (err, files) => {
        if (err) {
            throw err;
        }

        files.forEach(file => {
            copy({
                file,
                from,
                to,
                locals,
                appendName
            });
        });
    });
};

/**
 * Copy file from template directory.
 */
const copy = ({ file, from, to, locals = {}, appendName = "" }) => {
    // Make dest directory
    // Read files from source dir
    // write files to dest dir
    const destPath = path.join(to, file);
    const isEjs = path.extname(file) === ".ejs";

    // Check if File of Folder
    // If file => writeFile
    // If file === .ejs => parse => writeFile
    // If Folder => copy(params)

    if (isEjs) {
        const { name } = path.parse(destPath);
        const newDestPath = path.join(to, `${appendName}${name}`);

        const parsed = parseTemplate({ from, file, locals });

        return writeFile(parsed, newDestPath, CHAR_ENC);
    }

    const filePath = path.join(TEMPLATE_DIR, from, file);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code !== "EISDIR") {
                throw err;
            }

            if (file === "component") {
                const newTo = `app/${locals.initialComponent}`;

                mkdir(to, newTo);
                return copyMulti({
                    from: `${from}/${file}`,
                    to: `${to}/${newTo}`,
                    locals,
                    appendName: locals.initialComponent
                });
            }

            mkdir(to, file);
            return copyMulti({
                from: `${from}/${file}`,
                to: `${to}/${file}`,
                locals
            });
        }

        writeFile(data, destPath, CHAR_ENC);
    });
};

/**
 * For creating file onto the disk
 *
 * @param {String} fileName Name of the destination file
 * @param {String} context Content of the file to be written in new file
 */

const writeFile = (content, fileName) => {
    fs.writeFileSync(fileName, content);
    console.log("> \x1b[36mcreated\x1b[0m : " + fileName);
};

/**
 * Parsing ejs template
 */

const parseTemplate = ({ from, file, locals }) => {
    const filePath = path.join(TEMPLATE_DIR, from, file);
    const contents = fs.readFileSync(filePath).toString(CHAR_ENC);

    return ejs.render(contents, locals);
};

(async () => {
    const answers = await inquirer.prompt(questions);

    const appName = createAppName(answers.projectName);

    // Creating Entry Folder
    mkdir(appName, ".");

    // // Copying template files
    const locals = {
        ...answers,
        projectName: appName
    };

    copyMulti({
        from: ".",
        to: appName,
        locals
    });

    // Copying and parsing package json
    // copy({
    //     file: "package.json",
    //     from: ".",
    //     to: appName,
    //     parse: true,
    //     locals
    // });

    // // Copying and parsing License
    // copy({
    //     file: "LICENSE",
    //     from: ".",
    //     to: appName,
    //     parse: true,
    //     locals
    // });

    // // Copying and parsing .env
    // copy({
    //     file: ".env",
    //     from: ".",
    //     to: appName,
    //     parse: true
    // });

    // // Copying and parsing .gitignore
    // copy({
    //     file: ".gitignore",
    //     from: ".",
    //     to: appName,
    //     parse: true
    // });
})();
