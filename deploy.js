const fs = require('fs');//will be used to do the templating if needed
const Rsync = require('rsync'); //required to actually deploy the app
let {project_src={}} = require("./package.json"); //get the project source object from package json

if (typeof project_src === 'string'){ //if source is a string, assume it links to another project file.
	project_src = require(project_src);
}
let {
	main=".", //
	assets_dir="./build/",
	views_dir="./build/",
	index_file="index.php", //name of the file to produce from script
	template_inputs = ["__([a-zA-Z]\\w*)__"],
	template_outputs = [["<?=$", "?>"]],
} = project_src;
assets_dir =  assets_dir.replace("{main}", main);
views_dir = views_dir.replace("{main}", main);

const error_template = "regex at index {g} is missing {missing}";
const error = (index, missing) => error_template.replace(/({g})|({missing})/g, (match, g, m, offset, string) => {
	if (g) return index;
	if (m) return missing;
})

const test_cases = new Map();
	test_cases.set(/^[^()\s]+/g, "a left template tag")
	test_cases.set(/\)/g, "a right parenthesis")
	test_cases.set(/\([^()]+\)/g, "a capture group")
	test_cases.set(/\(/g, "a left parenthesis")
	test_cases.set(/[^()\s]+$/, "a right template tag");

const regex_test = (regex, g) =>{
	let responses = ``;
	test_cases.forEach((missing, check)=>{
  		if (!check.test(regex)) {
  			responses+=`${error(g, missing)}\n`;
  		}
	})
	if (responses.length > 0) console.error(responses);
	return responses.length;
}
const init_templates = input => using =>{
	let e = [];
	let result = input.reduce((regex, group, g)=>{
		group = typeof group === 'string'?[group]:group;
		if (group instanceof Array){
			switch(group.length){
				case 1: //assume you know what you're doing.
					_regex = group[0]; 
					break;
				case 2://assume opening and closing templates are equal
					_regex = `${group[0]}\\s*(${group[1]})\\s*${group[0]}`; 
					break;
				case 3: //assume that you know what you want, but also want to allow lots of space between your template tags
					_regex = `${group[0]}\\s*(${group[1]})\\s*${group[2]}`; 
					break;				
				default: // assume you want lots of groups
					let [open, ...rest] = group; 
					let close = rest.splice(rest.length-1);
					_regex = `${open}(${rest.reduce((a, b)=>{return `${a}|${b}`}, "")})${close}`;
			}
			if (regex_test(_regex, g) === 0){
				return regex + _regex;
			}
		}
		else { //oops -- looks like bad input
			e.push([g, typeof group]);
		}
	},"");
	if (e.length > 0){
		e = e.reduce((a, i)=>{
			a+`${i[0]}: should be an array or string. (found ${i[1]}) `+"\n"}, "");

		let errors = `Input group at index:\n\t ${e}`;
		console.error(errors);
	}
	return new RegExp(result, "g");
}
const regex = init_templates(template_inputs);
const template = (match, ...matches) =>{
	matches.splice(matches.length - 2, 2);
	for (let m in matches){
		if (matches[m]){
			let [o, c] = template_outputs[m];
			return o+matches[m]+c;
		}
	}
}

fs.readFile('./build/index.html', function(error, data){
	if (error) {
		console.error(error);
		return false;
	}
	let text = data.toString().replace(regex, template); //by default, will replace __var__ with <?=var?>
	fs.writeFileSync("./build/index.html", text); //insert templated text into new file
	fs.rename("./build/index.html",`./build/${index_file}`); //rename and log all the stuff.
});

//Uses the rsync shell command -> https://ss64.com/bash/rsync.html <- more info
//Check also the docs for the rsync npm package (https://www.npmjs.com/package/rsync)
const sync = (source, destination)=>(
	flags="avz")=>(
	include=null, exclude=null, current=/assets/.test(destination)?"assets":"views"
	) =>{
	let rsync = new Rsync()
	.flags(flags)
	if (include) rsync.set("include", include)
	if (exclude) rsync.set("exclude", exclude)
	rsync.source(source)
	.destination(destination)
	.execute((err, code, cmd)=>{
	if (code) throw `current directory: ${current} \n\t ->\t${cmd} ->\n\t failed with code ${code}\n\t\t${err}`;
	else {
		console.log(`current directory: ${current} \n\t ->\t${cmd} ->\n\t deployed with no problems.`);
		return true;
	}
});
}

const exec = (s1, m1="assets deployed") => (s2, m2="view deployed") =>{
	try {
		sync("./build/", assets_dir)()("/*","/*.php");
		sync("./build/", views_dir)()("/*.php", "/*");
	}
	catch (err){
		console.error(err);
	}
}
