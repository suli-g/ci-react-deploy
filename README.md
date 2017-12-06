# Name Pending...
A simple script for converting and templating a frontend index file into a backend file (like php).

## Prerequisites
1. [Node js](https://nodejs.org/) updated to latest version (needs to support es6).
2. An `index.html` file in the same directory as `deploy.js`.
3.* Support for [rsync.js](https://www.npmjs.com/package/rsync)
  * If you are on a windows 10 PC, then I recommend getting the Windows subsystem for Linux:
    * [what's that?](https://msdn.microsoft.com/en-us/commandline/wsl/about)
    * [where do I get it?](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10)
    
## Getting started
1. Download `deploy.js` and place it inside your project root directory.
2. run `node deploy` in the directory containing [the script](#script).

## Example use case (coming soon - will be `create-react-app` related):

## Installing

1. Simply place the `deploy.js` file in the same directory as your `index.html` file.
2. run `node deploy` in that directory.

### default behaviour:
1. Scan `blueprint` (a `json` file or `module.exports`).
2. Check that template \_input and \_output are arrays of the same length. (true by default)
  * if not - tell the user which one is shorter and by how much
3. Set the views and assets outlet. (views = assets = outlet by default)
  * if the assets field or the views field contains a reference to {outlet} - set that to the value of the outlet field.
4. Make sure each item in `template``_input` and `_output` follows the [template regulations](#template_regs)
5. Scan for and replace template matches in `${build}/index.html` .
6. Start deploying all necessary files according to the following criteria:
  * if
    * source = destination: inform user of indifference | move on
    * destination = assets: `rsync -avz --include=/* --exclude=/*.php {src}/{build} {outlet}/{assets}`
    * destination = views: `rsync -avz --include=/* --exclude=/*.php {src}/{build} {outlet}/{views}`
--

#### default settings

```[cson]
src: "."
outlet: "."
build: "build"
assets: "{outlet}"
views: "{outlet}"
index_file: "index.php"
template_input: (resolves to /__([a-zA-Z]\w*)__/g)
template_output: (resolves to <?=$(var)?>) //where var = template_input capture group.
```

#### Customizing settings:
By default - `deploy.js` will search for settings:

1. `node deploy` was run with an additional argument, `argv[2]`:
  * `file argv[2] exists?`
    * get custom settings from `argv[2]`
2. `package.json` exists?
  * `package.json` contains a `blueprint field`?
    * `blueprint` is a string
      * file `blueprint` exists?
        * use `blueprint` settings
      * use defaults
    * `blueprint` can be imported
      * blueprint is an object?
        * use blueprint
      * use defaults
3. use default settings

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

--- 
