<h1 style='text-align:center;'>nodegen</h1>

### A CLI tool for creating nodejs app 🚀

## Installation

```sh
$ npm install -g @realvikas/nodegen
```

After installation you have access to the binary. You can use the following command to verify the installation.

```sh
nodegen -v
```

For getting help about the cli

```sh
nodegen --help
```

## Quick Start

Creating the app:

```bash
$ nodegen init
```

This command will guide you to a series of question.

## Project Structure

```
> app
    > {component}
        - {component}.controllers.js
        - {component}.dal.js
        - {component}.model.js
        - {component}.routes.js
    - app.js
> bin
    - www.js
> config
    - keys.js
> src
    - server.js
> utils
    - error.js
.env
.eslintignore
.eslintrc.json
.gitignore
LICENSE
README.md
package.json
```

## License

[MIT](http://opensource.org/licenses/MIT)
