exports.log = (...messages)=> {
	let line = "----------\n";
	process.stdout.write(line); //open with a line
	messages.forEach((msg)=>{
			process.stdout.write(`${msg}\n`);
	});
}
