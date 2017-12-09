const error_template = "{regex} | missing {missing}"; //could be modified to fit any error in...
const error = (regex, missing) => error_template.replace(/({regex})|({missing})/g, (match, r, m, offset, string) => {
	if (r) return regex;
	if (m) return missing;
})

const test_cases = new Map(); 
	test_cases.set(/(^[^()\s]+)/, "a left template tag")
	test_cases.set(/(\))/, "a right parenthesis")
	test_cases.set(/(\([^()]+\))/, "a capture group")
	test_cases.set(/(\()/, "a left parenthesis")
	test_cases.set(/([^()\s]+$)/, "a right template tag");

exports.reg_val = (regex, g) =>{
	let responses =[];
	test_cases.forEach((missing, check)=>{
  		if (!check.test(regex)) {
  			responses.push([g,`${error(regex, missing)}`]);
  		}
	})
	return responses;
}
