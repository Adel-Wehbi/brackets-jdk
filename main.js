define(function(require, exports, module){
	"use strict";
	
	//get needed Brackets Modules
	var NodeDomain     		= brackets.getModule("utils/NodeDomain");
	var ExtensionUtils 		= brackets.getModule("utils/ExtensionUtils");
    var MainViewManager 	= brackets.getModule("view/MainViewManager");
	var ProjectManager		= brackets.getModule("project/ProjectManager");
	var FileUtils			= brackets.getModule("file/FileUtils");
	var CommandManager		= brackets.getModule("command/CommandManager");
	var KeyBindingManager	= brackets.getModule("command/KeyBindingManager");
	
	
	//load basicjdk NodeDomain that contains all our backend functions (everything that needs shell access basically)
	var basicjdk = new NodeDomain("basicjdk", ExtensionUtils.getModulePath(module, "node/basicjdk"));
	
	/**
	 * Calls basicjdk's compileFiles function on the Nodejs end.
	 * @author Adel Wehbi
	 * @param   {array}  filePaths  An array containing the paths of the files to be compiled.
	 * @param   {string} outputPath The path of the directory in which the compiled file should be placed.
	 * @returns {object} An object containing the process exit code, stdout, and stderr of the compile command.
	 */
	function compileFiles(filePath, outputPath){
		return basicjdk.exec(
			"compileFile",
			filePath,
			outputPath
		);
	}
	
	/**
	 * Calls basicjdk's run function on the Nodejs end.
	 * @author Adel Wehbi
	 * @param {string} filePath The path of the .class file to run.
	 */
	function run(filePath){
		var directory		= FileUtils.getDirectoryPath(filePath);
		var className		= FileUtils.getFilenameWithoutExtension(FileUtils.getBaseName(filePath));
		
		basicjdk.exec(
			"run",
			directory,
			className
		);
	}
	
	//listen to any output whether from compilation or from running
	basicjdk.on("output", function(event, text){
		console.log(text);
	});
	
	//same but for errors
	basicjdk.on("error", function(event, text){
		console.error(text);
	});
	
	
	
	var command				= CommandManager.register(
		'command',
		'basicjdk.command',
		function(){
			run("/home/admin/.config/Brackets/extensions/user/brackets-basic-jdk/test.class");
		}
	);
	
	KeyBindingManager.addBinding(command, "Shift-F6");
});