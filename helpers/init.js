const {log} = require("./log");
log("Deploying app...");
process.on('warning', (e)=>{ //lets stop everything if a warning is shown.
	log("process will now terminate...")
	process.exit(1); 
});


