const url = "https://lxadm.com/Rsync_exit_codes";
const errors = new Map();
errors.set(1,  "Syntax or usage error")
errors.set(2,  "Protocol incompatibility")
errors.set(3,  "Errors selecting input/output files, dirs")
errors.set(4,  "An option was specified that is not supported")
errors.set(5,  "Error starting client-server protocol")
errors.set(6,  "Daemon unable to append to log-file")
errors.set(10, "Error in socket I/O")
errors.set(11, "Error in file I/O")
errors.set(12, "Error in rsync protocol data stream")
errors.set(13, "Errors with program diagnostics")
errors.set(14, "Error in IPC code")
errors.set(20, "Received SIGUSR1 or SIGINT")
errors.set(21, "Some error returned by waitpid()")
errors.set(22, "Error allocating core memory buffers")
errors.set(23, "Partial transfer due to error")
errors.set(24, "Partial transfer due to vanished source files")
errors.set(25, "The --max-delete limit stopped deletions")
errors.set(30, "Timeout in data send/receive")
errors.set(35, "Timeout waiting for daemon connection")
errors.set("default", `See ${url} for more information`);
exports.errors = errors;