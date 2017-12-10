#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const Rsync = require('rsync');
const {log, settings, deploy} = require("./helpers/ops");
let project = settings(process.argv[2]||`${process.cwd()}/package.json`);

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
	output = output.undot();
	outlet = outlet.replace("{output}", output);
	assets_dir =  assets.replace("{outlet}", outlet)
	views_dir = views.replace("{outlet}", outlet);
	deploy(src, output, template_input, template_output, index_file, assets_dir, views_dir);
} catch (error){
	process.emitWarning(error, "Initialization Error");
}

