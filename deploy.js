//Next version should use an es6-class-based approach...
const fs = require('fs');//will be used to do the templating if needed
const Rsync = require('rsync');
const {log, sync, template, templater, regVal, init} = require("./helpers/ops");
let paths = [process.argv[2], "./package.json"];

let project, outlet, assets_dir, views_dir;
try {
	let i = 0;
	let path;
	for (let i = 0; i<paths.length; i++){
		log(`attempt ${i+1}: Searching for blueprint in ${paths[i]}`);
		if (fs.existsSync(paths[i])){
			project = require(paths[i]);
			if (project.hasOwnProperty("project_src")){
				let {project_src} = require(paths[i]);
				switch(typeof project_src){
					case "string":
						project = require(project_src);
						break;
					case "object":
						project = project_src;
						break;
					default:
						log("No blueprint found - using defaults...");
						project = {};				
				}
			}
		 	break;
		}
	}
	if (project) log(`blueprint found - getting values...`);
	({
		output="./output/",
		src="./build/",
		outlet="./", 
		assets="{outlet}", 
		views="{outlet}", 
		index_file="index.php", 
		template_input =  [["__","[a-zA-Z]\\w*"]], 
		template_output = [["<?=$", "?>"]], 
	} = project);
	if (template_input.length !== template_output.length ){
		let n = Math.abs(template_input.length - template_output.length);
		throw `I/O mismatch:\n\t${n<0?"template_input":"template_output"} needs ${n} more element${n>0?"s":""}`;
	}
	outlet = outlet.replace("{output}", output);
	assets_dir =  assets.replace("{outlet}", outlet)
	views_dir = views.replace("{outlet}", outlet);
} catch (e) {
	process.emitWarning(e, "Initialization Error", "WARN001");
}

let regex = templater(template_input);

let index_html;
if (fs.existsSync(index_html = `${src}index.html`)){
	fs.readFile(index_html, function(error, data){
		if (error) {
			process.emitWarning(error);
		}
		fs.mkdir(output, (err)=>{
			if (err){
				let {message, errno} = err;
			 	if (!message.match(/(EEXIST)/)) {
			 		throw err;
			 	}
			 }
			let text = data.toString().replace(regex, template); 
			fs.writeFile(`${output}${index_file}`, text, 'utf8', (err)=>{
				if (err) {process.emitWarning(err);}
				else {
					//Uses the rsync shell command -> https://ss64.com/bash/rsync.html <- more info
					//Check also the docs for the rsync npm package (https://www.npmjs.com/package/rsync)
					sync(src, output, new Rsync().set("exclude", "index.html").set("include", "/*"));
					sync(output, assets_dir, new Rsync().set("exclude", index_file).set("include", "/*"));
					sync(output, views_dir, new Rsync().set("include", index_file).set("exclude", "/*").set("include", index_file));
				}
			}); 
		});
	});
}  else {
	process.emitWarning(`${src}/index.html not found!`);
}