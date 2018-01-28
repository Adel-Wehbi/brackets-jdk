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
	
	
	//load basicjdk NodeDomain
	var basicjdk = new NodeDomain("basicjdk", ExtensionUtils.getModulePath(module, "node/basicjdk"));
	
	
	function determineJavaProjectPath(){
		//Brackets' project root
		var root			= ProjectManager.getProjectRoot();
		var rootPath		= root.fullPath;
		
		//to contain a file object, can be an actual file or a directory
		var file;
		
		//we first check if there is a file being currently view
		//it's a safe bet that this file belongs to the java project the user is working on
		file				= MainViewManager.getCurrentlyViewedFile();
		
		//if there is no file being currently viewed, we'll find the currently selected file instead
		if(file == null)
			file			= ProjectManager.getSelectedItem();
		
		//if there is neither an open file nor a selected one, we'll refuse to go on. (silently for the moment)
		if(file == null)
			return false;
		
		var filePath		= file.fullPath;
		var parentDirPath	= FileUtils.getDirectoryPath(filePath);
		
		//if the directory that contains the file is the root directory
		//then the root directory is our java project path
		if(parentDirPath == rootPath)
			return rootPath;
		
		
		
	}
	
	var command				= CommandManager.register(
		'command',
		'basicjdk.command',
		function(){
			console.log(MainViewManager.getCurrentlyViewedFile().fullPath);
			var dir = ProjectManager.getProjectRoot();
			console.log(dir.fullPath);
		}
	);
	
	KeyBindingManager.addBinding(command, "Shift-F6");
});