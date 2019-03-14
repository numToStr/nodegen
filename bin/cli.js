#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const program = require("commander");
const inquirer = require("inquirer");
const ejs = require("ejs");

const { version } = require("../package.json");
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
    // {
    //     type: "list",
    //     name: "frameworkType",
    //     message: "Which framwork do you want to use?",
    //     choices: ["express", "koa", "fastify"]
    // },
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
        default: "dummy"
    },
    {
        type: "confirm",
        name: "isEslint",
        message: "Include eslint?",
        default: "y"
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

// For only creating component
const createComponent = ({ base = "app", component, from, to, locals }) => {
    const newTo = `${base}/${component}`;

    mkdir(to, newTo);
    return copyMulti({
        from: `${from}/component`,
        to: `${to}/${newTo}`,
        locals,
        appendName: component
    });
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
    const { name } = path.parse(destPath);

    const isEslintFile = /eslint/.test(name);
    if (!locals.isEslint && isEslintFile) {
        return;
    }

    const isMongoFile = /(\.model|\.dal)/.test(name);
    if (!locals.isMongo && isMongoFile) {
        return;
    }

    // Check if File of Folder
    // If file => writeFile
    // If file === .ejs => parse => writeFile
    // If Folder => copy(params)

    const isEjs = path.extname(file) === ".ejs";
    if (isEjs) {
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
                return createComponent({
                    component: locals.initialComponent,
                    from,
                    to,
                    locals
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

// For Initialize Project
const init = async ({ component, base }) => {
    // If component args is set, then only creating component
    if (component) {
        return createComponent({
            base,
            component,
            from: ".",
            to: ".",
            locals: {
                initialComponent: component,
                isMongo: true
            }
        });
    }

    const answers = await inquirer.prompt(questions);

    const appName = createAppName(answers.projectName);

    // Check if the file/dir exists in the current directory.
    fs.access(appName, fs.constants.F_OK, err => {
        if (err) {
            // File doesn't not exists
            if (err.code === "ENOENT") {
                const locals = {
                    ...answers,
                    projectName: appName
                };

                // Creating Entry Folder
                mkdir(".", appName);

                // Copying template files
                return copyMulti({
                    from: ".",
                    to: appName,
                    locals
                });
            }

            throw err;
        }

        console.log(`\n ${appName} directory already exists.`);
        process.exit(1);
    });
};

// Command: init
program
    .version(version, "-v, --version")
    .command("init")
    .description("Initialize project")
    .option("-c, --component <name>", "for creating app component")
    .option(
        "-b, --base [base]",
        "sets base directory for creating component",
        "app"
    )
    .action(init);

program.parse(process.argv);
