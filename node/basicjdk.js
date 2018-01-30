
(function () {
    "use strict";

	//cross-platform shell access
	var shell 			= require("shelljs");
	var _domainManager;
	var currentProcess;
	
    
	/**
	 * Compiles an array of java files.
	 * @author Adel Wehbi
	 * @param   {array}  filePath   An array containing the paths of the java files to compile.
	 * @param   {string} outputPath The directory where the compiled file should be placed.
	 * @returns {object} An object containing the exit code, stdout, and/or stderr.
	 */
	function compileFile(filePaths, outputPath){
		//compile using the command javac filePath1 filePath2... -d outputPath
		var result = shell.exec("javac '" + filePaths.join(" ") + "' -d '" + outputPath + "'");
		
		//result object is of the form {code: ..., stdout:..., stderr:...}
		return result;
	}
	
	
	/**
	 * Runs a java class. If there is already a class running by us, we kill its process.
	 * @author Adel Wehbi
	 * @param {string} directory The directory where the java class resides.
	 * @param {string} className The name of the class to execute.
	 */
	function run(directory, className){
		//if there is already a process running, send it a SIGINT (equivalent to control-c)
		if(currentProcess != undefined){
			currentProcess.kill("SIGINT");
		}

		//TODO if SIGINT does not kill the process, send a SIGTERM
		
		//change directory to that of the class to execute
		shell.cd(directory);
		
		//start the new process
		var process			= shell.exec("java " + className, {async: true});
		
		//listener for output on process stdout
		process.stdout.on("data", function(data){
			_domainManager.emitEvent("basicjdk", "output", data);
		});
		
		//listener for errors on process stderr
		process.stderr.on("data", function(data){
			_domainManager.emitEvent("basicjdk", "error", data);
		});
		
		//clear the currentProcess variable if process exited
		process.on("exit", function(code, signal){
			//this check is necessary because sometimes the next process will start
			//before the current one is killed
			if(this == currentProcess)
				currentProcess	= undefined;
			console.log("Java process exited with code: " + code);
		});
		
		//for future reference
		currentProcess		= process;
	}
	
	
	/**
	 * Writes to the standard input stream of the running process. Does nothing if no process is running.
	 * @author Adel Wehbi
	 * @param {string} input The text to write to the input stream.
	 */
	function writeToStdin(input){
		if(currentProcess == undefined)
			return;
		
		currentProcess.stdin.write(input);
	}
    
	
	/**
	 * Initialize the basicjdk NodeDomain, expose its functions to the webkit end, and register its events.
	 * @author Adel Wehbi
	 * @param {object} domainManager Bracket's Domain Managers
	 */
	function init(domainManager){
	   	_domainManager			=	domainManager;
	   
		if (!domainManager.hasDomain("basicjdk")) {
            domainManager.registerDomain("basicjdk", {major: 0, minor: 1});
        }
		
	   //expose the compileFile function to the webkit end
		domainManager.registerCommand(
			"basicjdk",
			"compileFile",
			compileFile,
			false,
			"Compiles a single java file to a specific directory.",
			[
				{name: "filePath",		type: "string", description: "Path of file to compile."},
				{name: "outputPath",	type: "string", description: "Path of directory to compile to."}
			],
			[
				{name: "result",		type: "object", description: "An object containing the process return code, stdout, and stderr."}
			]
		);
	   
	   //expose the run function to the webkit end
	   domainManager.registerCommand(
		   "basicjdk",
		   "run",
		   run,
		   false,
		   "Runs a java .class file.",
		   [
			   {name: "directory",		type: "string",		description: "Directory in which the class to run resides."},
			   {name: "className",		type: "string", 	description: "Path of .class file to run, excluding the file extension."}
		   ],
		   [
			   {name: "write",			type: "function",	description: "A callback to be used to write to stdin."}
		   ]
	   );
	   
	   //expose the writeToProcess function to the webkit end
	   domainManager.registerCommand(
		   "basicjdk",
		   "writeToStdin",
		   false,
		   "Writes text to Standard Input of currently running process.",
		   [
			   {name: "text",		type: "string", description: "The text to write to Stdin."}
		   ]
	   );
	   
	   //register an stdout event
	   domainManager.registerEvent(
		   "basicjdk",
		   "output",
		   [
			   {name: "ouputText", 	type: "string", description: "The text of stdout."}
		   ]
	   );
	   
	   //register an stderr event
	   domainManager.registerEvent(
		   "basicjdk",
		   "error",
		   [
			   {name: "errorText", 	type: "string", description: "The text of stderr."}
		   ]
	   );
	}
    
    exports.init = init;
    
}());