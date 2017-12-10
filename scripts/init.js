const fs = require("fs");
const colors = require("colors")
const {log} = require("./log");
log("Deploying app...".blue);
process.on('warning', (e)=>{ //lets stop everything if a warning is shown.
	log("process will now terminate...".grey)
	process.exit(1); 
});
Object.prototype.isEmpty = function(){
	for (let i in this){
		if (this.hasOwnProperty(i)) return false;
		return true;
	}
}

module.exports.settings = src => {
	log(`Searching for blueprint in ${src.cyan}...`);
	if (fs.existsSync(src)){
		project = require(src);
		if (project.hasOwnProperty("project_src")){
			let {project_src} = require(src);
			if (typeof project_src === "string" && fs.existsSync(project_src)){
				log(`link found in ${src.cyan} : ${project_src.cyan}`)
				project_src = require(project_src);
			}
			if (project_src instanceof Object && !project.isEmpty()){
				log(`${"blueprint found".cyan} ${"- getting settings...".yellow}`);
				return (project_src);
			} else {
				log("no settings found in blueprint".yellow + " - "+ "using defaults".bgCyan);
			}
		}
	}
	else log(`blueprint ${"not found".red} - ${"loading defaults".yellow}`);
	return ({});	
}