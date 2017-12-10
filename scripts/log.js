const colors = require("colors");
const {log} = console;
const warn = (warning, ...rest)=> {
	if (!rest) process.emitWarning(warning.red);
	else process.emitWarning(warning.red, ...rest);
}
module.exports = {warn, log};