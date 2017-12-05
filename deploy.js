//Next version should use an es6-class-based approach...
const fs = require('fs');//will be used to do the templating if needed
const Rsync = require('rsync'); //required to actually deploy the app
process.on('warning', (e)=>{
	process.exit(1);
});
let project, blueprint;
const echo = msg => {
	process.stdout.clearLine();
	process.stdout.write(msg);
}
try {
	echo("searching for blueprint in package.json...");
	({blueprint} = require("./package.json"))
	if (typeof blueprint === 'string'){ //if source is a string, assume it links to another project file.
		echo(`blueprint found containing a link to ${blueprint}...`);
		project = require(blueprint);
		echo(`getting settings from ${blueprint} `);
	} else if (blueprint.hasOwnProperty("constructor") && blueprint instanceof Object) {
		project = blueprint;
	} else {
		throw "No blueprint found - using defaults...";
	}
} catch (e) {
	echo(e);
	project = {};
}

let {
	src=".",
	outlet=".", //replaces {outlet}, when used, in assets_dir and views_dir with this value. {{ 1 }}
	build="build",
	assets=build, //where everything but the index_file will be moved.
	views=build, //where the index_file will be moved.
	index_file="index.php", //name of the file to produce from script.
	//template_input > input --> length: 1 (must have a (group)) | 2(index 1 = (group)) | 3 (all but (index 0 and k) = (group))
	template_input = [["__","[a-zA-Z]\\w*"]], 
	//outputs *must equal* inputs: 0 --> (group) --> 1
	template_output = [["<?=$", "?>"]], 
} = project;
build = `${src}/${build}`;

try {
	if (template_input.length !== template_output.length ){
		let n = Math.abs(template_input.length - template_output.length);
		throw `Total Input != Total Output:\n\t${n<0?"template_input":"template_output"} needs ${n} more element${n>0?"s":""}`;
	}
} catch(e){
	process.emitWarning(e, `Initialization Error: I/O mismatch: \n\t${e}`, "WARN001");
}

// const dir = x => x.replace("{outlet}", outlet);
// assets_dir =  dir(assets); //{{ 1 }}
// views_dir = dir(views); //{{ 1 }}

// //regex checking starts here...
// const error_template = "regex at index {g} is missing {missing}"; //could be modified to fit any error in...
// const error = (index, missing) => error_template.replace(/({g})|({missing})/g, (match, g, m, offset, string) => {
// 	if (g) return index;
// 	if (m) return missing;
// })

// const test_cases = new Map(); 
// 	test_cases.set(/^[^()\s]+/g, "a left template tag")
// 	test_cases.set(/\)/g, "a right parenthesis")
// 	test_cases.set(/\([^()]+\)/g, "a capture group")
// 	test_cases.set(/\(/g, "a left parenthesis")
// 	test_cases.set(/[^()\s]+$/, "a right template tag");

// const regex_test = (regex, g) =>{
// 	let responses = ``;
// 	test_cases.forEach((missing, check)=>{
//   		if (!check.test(regex)) {
//   			responses+=`${error(g, missing)}\n`;
//   		}
// 	})
// 	if (responses.length > 0) process.emitWarning(responses);
// 	return responses.length;
// }
// //End regex checking
// //Templating starts here...
// const init_templates = input => using =>{
// 	let e = [];
// 	let result = input.reduce((regex, group, g)=>{
// 		group = typeof group === 'string'?[group]:group;
// 		if (group instanceof Array){
// 			switch(group.length){
// 				case 1: //assume user knows what user's' doing.
// 					_regex = group[0]; 
// 					break;
// 				case 2://assume opening and closing templates are equal
// 					_regex = `${group[0]}\\s*(${group[1]})\\s*${group[0]}`; 
// 					break;
// 				case 3: //assume that user know what user want, but also want to allow lots of space between user's template tags
// 					_regex = `${group[0]}\\s*(${group[1]})\\s*${group[2]}`; 
// 					break;				
// 				default: // assume user wants lots of possibilities
// 					let [open, ...rest] = group; 
// 					let close = rest.splice(rest.length-1);
// 					_regex = `${open}(${rest.reduce((a, b)=>{return `${a}|${b}`}, "")})${close}`;
// 			}
// 			if (regex_test(_regex, g) === 0){
// 				return regex + _regex;
// 			}
// 		}
// 		else { //oops -- looks like bad input (put group index and type aside for later -- so we can throw all errors together like confetti)
// 			e.push([g, typeof group]);
// 		}
// 	},"");
// 	if (e.length > 0){ //if there's any confetti -- it's time to throw them
// 		e = e.reduce((a, i)=>{
// 			a+`${i[0]}: should be an array or string. (found ${i[1]}) `+"\n"}, "");
// 		let errors = `Input group at index:\n\t ${e}`;
// 		throw errors; //Happy birthday! (confetti thrown - time well spent)
// 	}
// 	return new RegExp(result, "g"); //looks like everything is okay - make that regex! But keep it global in case user wants to do different stuff for different cases.
// }
// //setup the template regexes ... serious stuff : no confetti allowed.
// const regex = init_templates(template_input);
// const template = (match, ...matches) =>{
// 	matches.splice(matches.length - 2, 2); //we don't need the input and index so let's get rid of that.
// 	for (let m in matches){ //check all capture groups and template match where necessary
// 		if (matches[m]){ 
// 			let [opening, closing] = template_output[m];
// 			return opening+matches[m]+closing;
// 		}
// 	}
// }
// //End templating...
// //
// //Deploying starts here...
// fs.readFile(`${build}/index.html`, function(error, data){
// 	if (error) {
// 		process.emitWarning(error);
// 	}
// 	let text = data.toString().replace(regex, template); //Unleash the above on index.html
// 	fs.writeFileSync(`${build}/index.html`, text); //Paste new identity on index.html
// 	fs.rename(`${build}/index.html`,`${build}/${index_file}`); //rename index.html before sending it off.
// });

// //Uses the rsync shell command -> https://ss64.com/bash/rsync.html <- more info
// //Check also the docs for the rsync npm package (https://www.npmjs.com/package/rsync)
// //
// const sync = (source, destination)=>( //make a function so we don't need to make 2 Rsyncs...
// 	flags="avz")=>( //allow more parenthese so it's easier to modify the flags (easier to keep defaults)
// 	include=null, exclude=null
// 	) =>{
// 		if (source === destination) { //let's not do anything unnecessary
// 			console.log("destination = source -> moving on");
// 		} else {
// 			let rsync = new Rsync()
// 			.flags(flags)
// 			if (include) rsync.set("include", include)
// 			if (exclude) rsync.set("exclude", exclude)
// 			rsync.source(source)
// 			.destination(destination)
// 			.execute((err, code, cmd)=>{
// 				if (code) throw `current destination: ${destination} \n\t ->\t${cmd} ->\n\t failed with code ${code}\n\t\t${err}`;
// 				else {
// 					console.log(`current destination: ${destination} \n\t ->\t${cmd} ->\n\t deployed with no problems.`);
// 					return true;
// 				}
// 			});
// 		}
// }
// //now try to move everything
// try {
// 	if (sync(build, assets_dir)()("/*","/*.php")) console.log(`assets moved to ${assets_dir}`);
// 	if (sync(build, views_dir)()("/*","/*.php")) console.log(`assets moved to ${views_dir}`);
// }
// catch (err){
// 	process.emitWarning(err);
// }
// //End everything...