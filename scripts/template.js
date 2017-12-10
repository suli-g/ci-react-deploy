module.exports.template = template_output => (x, ...rest) =>{
	let matches = rest.filter((match, i)=>i%2===1&&i<rest.length-2);
	try {for (let m in matches){ //check all capture groups and template match where necessary
			let match = matches[m];
			if (typeof matches[m] !== 'undefined'){
				let filter = template_output[m];
				let open, replace, close;
				if (["string", "number"].includes(typeof filter)){
					return filter;
				}
				else if (filter instanceof Array){
					switch(filter.length){
						case 1: 
						let [tag] = filter;
						return tag + match + tag;
					case 2:
						([open, close] = filter);
						return open + match + close;
					case 3:
						([open, replace, close] = filter);
						return open + replace + close;
					default:
						throw [m, `Length should be 1, 2 or 3 (found: ${filter.length}).`];
					}
				}
				else {
					throw [m, `Type should be a string, number or Array (found: ${typeof filter}).`];
				}
			}
		}
	} catch (error){
		if (error instanceof Array){
			let [index, warning] = error;
			process.emitWarning(`template_output --> ${index}: ${warning}`)
		}
		else process.emitWarning(error)
	}
}