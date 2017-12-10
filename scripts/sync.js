const fs = require("fs");
const {log} = require("./log");
const {errors} = require("./errors");

const prep = (destination) =>{
	try {
		if (!fs.existsSync(destination) && /^(\.{1,2})/.test(destination)){
			let newDir = "";
			destination.split('/').forEach((dir,i, curr)=>{ //iterate through directory names in the destination path
				newDir += dir+"/"; 
				if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
			});
		}
		return fs.existsSync(destination);
	}
	catch(err){
		process.emitWarning(err)
	}
}
exports.sync = (source, destination, rsync, flags="avz") =>{
	rsync.flags(flags)
	.source(source)
	.destination(destination)
	.set("rsync-path", `mkdir -p ${destination} && rsync`)
	.set("progress")
	if (source === destination) { //let's not do anything unnecessary
		log(`${destination}: ${source}`);
		return true;
	}
	else {
		prep(destination);
		rsync.execute((err, code, cmd)=>{
			log(`Trying: ${cmd}`);
			if (code) {
				const explanation = errors.get(code)||"";
				process.emitWarning(`\nFailed with code ${code} ${explanation}\n\n${errors.get("default")}`);
			}
		});		
	}
}