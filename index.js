#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Rsync = require('rsync');
const {settings, deploy} = require("./scripts/ops");

let project = settings(path.resolve(process.cwd(), process.argv[2])||path.resolve(process.cwd(),"./package.json"));

try {
	let {
		output="./output/",
		src="./build/",
		outlet="./project", 
		assets="{outlet}/assets", 
		views="{outlet}/views", 
		index_file="index.php", 
		template_input =  [["__","[a-zA-Z]\\w*"]], 
		template_output = [["<?=$", "?>"]], 
	} = project;
	if (template_input.length !== template_output.length ){
		let n = Math.abs(template_input.length - template_output.length);
		throw `I/O mismatch:\n\t${n<0?"template_input":"template_output"} needs ${n} more element${n>0?"s":""}`;
	}
	// output = path.resolve(process.cwd(),output);
	outlet = outlet.replace("{output}", output);
	assets_dir =  assets.replace("{outlet}", outlet)
	views_dir = views.replace("{outlet}", outlet);
	deploy(src, output, template_input, template_output, index_file, assets_dir, views_dir);
} catch (error){
	process.emitWarning(error, "Initialization Error");
}

