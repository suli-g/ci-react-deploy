const fs = require('fs');//will be used to do the templating if needed
const Rsync = require('rsync'); //required to actually deploy the app
let {project_src} = require("./package.json");

if (typeof project_src === 'string'){
	project_src = require(project_src);
}
let {
	dir:{
		main, //
		assets,
		views
	},
	index_file="index.php", //name of the file to produce from script
	template_groups = "__ *([a-z]\w*) *__",
	template_outputs = [["<?=$", "?>"]],
} = project_src;

assets =  assets.replace("{main}", main);
views = views.replace("{main}", main);

regex = new RegExp(template_groups, "gi"); //generate regular expression from the template tag array

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
const syncAssets = new Rsync()
	.flags("avz") //a: exactly copy everything, v: tell me as much as possible, z: then compress the stuff at destination
	.set('exclude', "/*.php") //don't copy .php file to destination
	.set("include", "/*") // "/*" means everything in the source folder
	.source('./build/') // everything necessary is stored in the build folder by default in c-r-a
	.destination(assets); //destination folder for assets defined in package.json under the "assets" key

const syncView = new Rsync()
	.flags("avz") //see above
	.set('include', "/*.php") //see above
	.set('exclude', '/*') //see above
	.source('./build/') //see above
	.destination(views); //see above

syncAssets.execute(function (error, code, cmd){
	console.log("moving assets...");
	if (code){
		console.error(error)
	}
	else {
		syncView.execute(function(error, code, cmd){
			console.log("moving index...");
			if (code){
				console.error(error)
			}
			else {
				console.log("all files moved");
			}
		})
	}
});