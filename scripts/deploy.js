const fs = require("fs");
const Rsync = require('rsync');
const { log } = require("./log");
const { sync } = require("./sync");
const { template } = require("./template");
const { reg_val } = require("./reg_val");
const { errors } = require("./errors");
const { templater } = require("./templater");
const { settings } = require("./init");


exports.deploy = (src, output, template_input, template_output, index_file, assets_dir, views_dir) => {
    let index_html;
    let regex = templater(template_input);
    if (fs.existsSync(index_html = `${src}/index.html`)) {
        fs.readFile(index_html, function(error, data) {
            if (error) {
                warn(error);
            }
            fs.mkdir(output, (err) => {
                if (err) {
                    let { message, errno } = err;
                    if (!message.match(/(EEXIST)/)) {
                        throw err;
                    }
                }
                let text = data.toString().replace(regex, template(template_output));
                fs.writeFile(`${output}/${index_file}`, text, 'utf8', (err) => {
                    if (err) { warn(err); } else {
                        //Uses the rsync shell command -> https://ss64.com/bash/rsync.html <- more info
                        //Check also the docs for the rsync npm package (https://www.npmjs.com/package/rsync)
                        sync(src, assets_dir, new Rsync().set("exclude", "/index.html").set("include", "/*"));
                        sync(output, views_dir, new Rsync().set("include", index_file).set("exclude", "/*").set("include", index_file));
                    }
                });
            });
        });
    }
}