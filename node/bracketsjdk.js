(function() {
    "use strict";

    //cross-platform shell access
    var shell = require("shelljs");
    var _domainManager;
    var currentProcess;


    /**
     * Compiles an array of java files. Emits an error event in case compilation fails.
     * @author Adel Wehbi
     * @param   {Array}   filePaths  Array of paths of .java files to compile.
     * @param   {string}  outputPath The directory where the compiled files should be placed.
     * @returns {boolean} Returns false if compilation failed for any reason, and true if it didn't.
     */
    function compileFiles(filePaths, outputPath) {
        if (filePaths.length == 0)
            return false;

        //create the bin location if it does not already exist
        shell.mkdir("-p", outputPath);

        //empty it (in case file names were changed)
        shell.rm("-rf", outputPath + "*");

        _domainManager.emitEvent("bracketsjdk", "log", "Compiling...");

        //compile using the command javac filePath1 filePath2... -d outputPath
        var result = shell.exec("javac \"" + filePaths.join("\" \"") + "\" -d \"" + outputPath + "\"");

        if (result.stderr) {
            _domainManager.emitEvent("bracketsjdk", "error", result.stderr);
            return false;
        }

        _domainManager.emitEvent("bracketsjdk", "log", "Done.");

        return true;

    }


    /**
     * Runs a java class. If there is already a class running by us, we kill its process.
     * @author Adel Wehbi
     * @param {string} directory The directory where the java class resides.
     * @param {string} className The name of the class to execute.
     */
    function run(directory, className) {
        //if there is already a process running, send it a SIGINT (equivalent to control-c)
        if (currentProcess != undefined) {
            killProcess();
            //wait for process death before running again, just in case something's off
            currentProcess.on("exit", function(code, signal) {
                run(directory, className);
            });
            return;
        }

        //TODO if SIGINT does not kill the process, send a SIGTERM

        //change directory to that of the class to execute
        shell.cd(directory);

        _domainManager.emitEvent("bracketsjdk", "log", "Running class " + className + "...")

        //start the new process
        var process = shell.exec("java " + className, {
            async: true
        });

        //listener for output on process stdout
        process.stdout.on("data", function(data) {
            _domainManager.emitEvent("bracketsjdk", "output", data);
        });

        //listener for errors on process stderr
        process.stderr.on("data", function(data) {
            _domainManager.emitEvent("bracketsjdk", "error", data);
        });

        //clear the currentProcess variable if process exited
        process.on("exit", function(code, signal) {
            //this check is necessary because sometimes the next process will start
            //before the current one is killed
            if (this == currentProcess)
                currentProcess = undefined;
            _domainManager.emitEvent("bracketsjdk", "log", "Java exited with code: " + code);
            _domainManager.emitEvent("bracketsjdk", "output", "\n")
        });

        //for future reference
        currentProcess = process;
    }


    /**
     * Writes to the standard input stream of the running process. Does nothing if no process is running.
     * @author Adel Wehbi
     * @param {string} input The text to write to the input stream.
     */
    function writeToStdin(input) {
        if(currentProcess == undefined)
            return;

        currentProcess.stdin.write(input);
    }

    /**
     * Sends the process a SIGINT signal.
     * @author Adel Wehbi
     */
    function killProcess(){
        if(currentProcess == undefined)
            return;

        currentProcess.kill("SIGINT");
    }

    /**
     * Initialize the bracketsjdk NodeDomain, expose its functions to the webkit end, and register its events.
     * @author Adel Wehbi
     * @param {object} domainManager Bracket's Domain Managers
     */
    function init(domainManager) {
        _domainManager = domainManager;

        if (!domainManager.hasDomain("bracketsjdk")) {
            domainManager.registerDomain("bracketsjdk", {
                major: 0,
                minor: 1
            });
        }

        //expose the compileFile function to the webkit end
        domainManager.registerCommand(
            "bracketsjdk",
            "compileFiles",
            compileFiles,
            false,
            "Compiles an array of java files to a specific directory.", [{
                    name: "filePath",
                    type: "array",
                    description: "Array of paths of files to compile."
                },
                {
                    name: "outputPath",
                    type: "string",
                    description: "Path of directory to compile to."
                }
            ], [{
                name: "result",
                type: "object",
                description: "An object containing the process return code, stdout, and stderr."
            }]
        );

        //expose the run function to the webkit end
        domainManager.registerCommand(
            "bracketsjdk",
            "run",
            run,
            false,
            "Runs a java .class file.", [{
                    name: "directory",
                    type: "string",
                    description: "Directory in which the class to run resides."
                },
                {
                    name: "className",
                    type: "string",
                    description: "Path of .class file to run, excluding the file extension."
                }
            ], [{
                name: "write",
                type: "function",
                description: "A callback to be used to write to stdin."
            }]
        );

        //expose the writeToProcess function to the webkit end
        domainManager.registerCommand(
            "bracketsjdk",
            "writeToStdin",
            writeToStdin,
            false,
            "Writes text to Standard Input of currently running process.", [{
                name: "text",
                type: "string",
                description: "The text to write to Stdin."
            }]
        );

        //expose the killProcess function to the webkit end
        domainManager.registerCommand(
            "bracketsjdk",
            "killProcess",
            killProcess,
            false,
            "Sends the currently running Java process a SIGINT"
        );

        //register a log event
        _domainManager.registerEvent(
            "bracketsjdk",
            "log", [{
                name: "logText",
                type: "string",
                description: "Line to log."
            }]
        );

        //register an stdout event
        domainManager.registerEvent(
            "bracketsjdk",
            "output", [{
                name: "ouputText",
                type: "string",
                description: "The text of stdout."
            }]
        );

        //register an stderr event
        domainManager.registerEvent(
            "bracketsjdk",
            "error", [{
                name: "errorText",
                type: "string",
                description: "The text of stderr."
            }]
        );
    }

    exports.init = init;

}());
