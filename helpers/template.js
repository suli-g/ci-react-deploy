module.exports.template = (x, ...rest) =>{
	let matches = rest.filter((match, i)=>i%2===1&&i<rest.length-2);
	for (let m in matches){ //check all capture groups and template match where necessary
		let match = matches[m];
		if (typeof matches[m] !== 'undefined'){
			let filter = template_output[m];
			let open, replace, close;
			if (typeof filter === 'string'){
				return filter;
			}
			else switch (filter.length){
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
					throw `${m}: Template should be an array or string. (${typeof filter} found)`;
			}
		}
	}
}