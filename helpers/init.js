const fs = require("fs");
const {log} = require("./log");
log("Deploying app...");
process.on('warning', (e)=>{ //lets stop everything if a warning is shown.
	log("process will now terminate...")
	process.exit(1); 
});
Object.prototype.isEmpty = function(){
	for (let i in this){
		if (this.hasOwnProperty(i)) return false;
		return true;
	}
}
String.prototype.undot =function() {
		return this.replace(/(^\.[^.])|(^\.{2})/, (match, cwd, pwd)=>{
			if (cwd){
				return `${process.cwd()}/`;
			} 
			if (pwd){
				return `${process.cwd()}/${match}`;
			}
		});
	}
module.exports.settings = src => {
	log(`Searching for blueprint in ${src}...`);
	if (fs.existsSync(src)){
		project = require(src);
		if (project.hasOwnProperty("project_src")){
			let {project_src} = require(src);
			if (typeof project_src === "string" && fs.existsSync(project_src)){
				log(`link found in ${src} : ${project_src}`)
				project_src = require(project_src);
			}
			if (project_src instanceof Object && !project.isEmpty()){
				log(`blueprint found - getting settings...`);
				return (project_src);
			} else {
				log("no settings found in blueprint - using defaults");
			}
		}
	}
	else log("blueprint not found - loading defaults");
	return ({});	
}