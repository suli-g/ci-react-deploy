const {reg_val} = require("./reg_val");
const {log} = require("./log")

exports.templater = input =>{
	let errors = [];
	let result = input.reduce((regex, group, g)=>{
		group = typeof group === 'string'?[group]:group;
		if (typeof group.reduce !== 'function'){
			errors.push("is not ")
			return "";
		}
		if (group instanceof Array){
			switch(group.length){
				case 1: //assume user knows what user's' doing.
					_regex = group[0]; 
					break;
				case 2://assume opening and closing templates are equal
					_regex = `${group[0]}\\s*(${group[1]})\\s*${group[0]}`; 
					break;
				case 3: //assume that user know what user want, but also want to allow lots of space between user's template tags
					_regex = `${group[0]}\\s*(${group[1]})\\s*${group[2]}`; 
					break;				
				default: // assume user wants lots of possibilities
					let [open, ...rest] = group; 
					let close = rest.splice(rest.length-1);
					_regex = `${open}(${rest.reduce((a, b, c)=>{return a+(a.length>0&&c<rest.length?"|":"")+b}, "")})${close}`;
			}
			let warnings = reg_val(_regex, g);
			if (warnings.length === 0){
				return regex + `(${_regex})${(g !== input.length-1?"|":"")}`;
			} else {
				errors.push(...warnings);
			}
		}
		else { //oops -- looks like bad input (put group index and type aside for later -- so we can throw all errors together like confetti)
			errors.push(`should be an array or string. (found ${typeof group})`);
			return "";
		}
	},"");
	if (errors.length > 0){ //if there's any confetti -- it's time to throw them
		errors = errors.reduce((all, current)=>all+`${current[0]}: ${current[1]}\n`, "");
		process.emitWarning("Template error\n"+col.r+errors+col.g); //Happy birthday! (confetti thrown - time well spent)
	}
	//looks like everything is okay - make that regex! But keep it global in case user wants to do different stuff for different cases.
	log(`matching templates according to ${result}`);
	return new RegExp(result, "g");
}