define(function(require, exports, module){
	"use strict";
	
	//get needed Brackets Modules
	var NodeDomain     		= brackets.getModule("utils/NodeDomain");
	var ExtensionUtils 		= brackets.getModule("utils/ExtensionUtils");
    var MainViewManager 	= brackets.getModule("view/MainViewManager");
	var ProjectManager		= brackets.getModule("project/ProjectManager");
	var FileSystem			= brackets.getModule("filesystem/FileSystem");
	var FileUtils			= brackets.getModule("file/FileUtils");
	var FindInFiles			= brackets.getModule("search/FindInFiles");
	var CommandManager		= brackets.getModule("command/CommandManager");
	var Menus				= brackets.getModule("command/Menus");
	var KeyBindingManager	= brackets.getModule("command/KeyBindingManager");
	
	
	//load bracketsjdk NodeDomain that contains all our backend functions (everything that needs shell access basically)
	var bracketsjdk 			= new NodeDomain("bracketsjdk", ExtensionUtils.getModulePath(module, "node/bracketsjdk"));
	
	
	//our libraries
	var console				= require("console"); //to log to dev tools for debugging instead, use window.console instead.

	//************** define our main.js functions ***********************//
	
	/**
	 * Calls bracketsjdk's compileFiles function on the Nodejs end.
	 * @author Adel Wehbi
	 * @param   {array}  filePaths  An array containing the paths of the files to be compiled.
	 * @param   {string} outputPath The path of the directory in which the compiled file should be placed.
	 * @returns {Promise} A promise that resolves after compilation with true for success and false for fail.
	 */
	function compileFiles(filePaths, outputPath){
		return bracketsjdk.exec(
			"compileFiles",
			filePaths,
			outputPath
		);
	}
	
	/**
	 * Compiles all java files under projectPath into the outputPath.
	 * @author Adel Wehbi
	 * @param   {string} projectPath Path to java project.
	 * @param   {string} outputPath  The output path for the compiled files RELATIVE TO PROJECT PATH
	 * @returns {Promise} The promise returned by compileFiles().
	 */
	function compileProject(projectPath, outputPath){
		
		var filesToCompile		=	findJavaFilesUnderPath(projectPath);
		
		//TODO change projectPath
		return compileFiles(filesToCompile, projectPath + outputPath);
	}
	
	/**
	 * Calls bracketsjdk's run function on the Nodejs end.
	 * @author Adel Wehbi
	 * @param {string} filePath The path of the .class file to run.
	 */
	function run(filePath){
		//the directory in which the class to execute resides
		var directory		= FileUtils.getDirectoryPath(filePath);
		//getBaseName removes preceding path, and then getFilenameWithoutExtension removes the extension,
		//so we're left with the class name only
		var className		= FileUtils.getFilenameWithoutExtension(FileUtils.getBaseName(filePath));
		
		bracketsjdk.exec(
			"run",
			directory,
			className
		);
	}
	
	
	/**
	 * Calls bracketjdk's function with the same name that writes to the currently running process
	 * @author Adel Wehbi
	 * @param {string} input Input text.
	 */
	function writeToStdin(input){
		bracketsjdk.exec("writeToStdin", input);
	}
	
	
	/**
	 * Finds the Java project path based on the currently viewed file.
	 * The project is considered to be the directory lying on Brackets that contains (no matter how deep) the file.
	 * @author Adel Wehbi
	 * @returns {string} The path of the Java project.
	 */
	function findProjectPath(){
		var bracketsRoot	= ProjectManager.getProjectRoot().fullPath;
		
		//first we check the currently viewed file
		var file			= MainViewManager.getCurrentlyViewedFile();
		//if there is an open file and if it is in the Brackets file tree
		if(file != null && ProjectManager.isWithinProject(file.fullPath)){
			//if the file is actually inside a java project and not just hanging on root
			if(FileUtils.getParentPath(file.fullPath) != bracketsRoot){
				//gets the path of the file relative to brackets root
				var relativePath 	= FileUtils.getRelativeFilename(bracketsRoot, file.fullPath);
				var directoryName 	= relativePath.split("/")[0];
				//we have our project path
				return bracketsRoot + directoryName + "/";
			}
		}
		
		//not needed. Every selected file is automatically viewed
//		//if all those failed, we check if the user has selected an item in the file tree view
//		var file = ProjectManager.getSelectedItem(); //could be file or directory
//		//if there is a selected file/directory and it's within the Brackets file tree
//		if(file != null && ProjectManager.isWithinProject(file.fullPath)){
//			//if the file is actually inside a java project and not just hanging on root
//			if(FileUtils.getDirectoryPath(file.fullPath) != bracketsRoot){
//				var relativePath	= FileUtils.getRelativeFilename(bracketsRoot, file.fullPath);
//				var directoryName	= relativePath.split("/")[0];
//				return bracketsRoot + directoryName;
//			}
//		}
	}
	
	/**
	 * Finds all files with the .java extension under a specific path.
	 * @author Adel Wehbi
	 * @param   {string}  path Path to be searched.
	 * @returns {array} Array containing paths of java files.
	 */
	function findJavaFilesUnderPath(path){
		//get all files in File Tree if they satisfy the filter
		var fetchAllFiles		= ProjectManager.getAllFiles(function(file, number){
			//ignore if not under projectPath
			if(file.fullPath.indexOf(path) < 0)
				return false;
			
			//if not a java file, ignore too
			if(file.name.indexOf(".java") < 0)
				return false;
			
			return true;
		});
		
		var filePaths	=	[];
		fetchAllFiles.then(function(allFiles){
			for(var i = 0; i < allFiles.length; i++){
				filePaths.push(allFiles[i].fullPath);
			}
		});
		return filePaths;
	}
	
	/**
	 * Finds the name of the Java class that contains the main method.
	 * @author Adel Wehbi
	 * @param   {string} path Path to look under.
	 * @returns {Promise} The promise that is resolved when the result is found.
	 */
	function findJavaMainUnderPath(path){
		var queryObject		= {
			query: "public\\s+static\\s+void\\s+main",
			caseSensitive: true,
			isRegexp: true
		};
		//the scope of the java project to search inside
		var scope			= FileSystem.getDirectoryForPath(path);
		//the possible files in this scope
		var candidateFiles = FindInFiles.getCandidateFiles(scope);
		var searchTask 		= FindInFiles.doSearchInScope(queryObject, scope, null, null, candidateFiles);
		
		//return a promise
		return searchTask.then(function(result){
			var className;
			if($.isEmptyObject(result)){
				className = undefined;
				return;
			}
			//we only support one main method as of now, so just take first key which is the path
			var foundFile;
			for(var key in  result){
				foundFile = key;
				break;
			}
			className		= FileUtils.getFilenameWithoutExtension(FileUtils.getBaseName(foundFile));
			return className;
		});
	}
	
	//******************* Begin initializing Everything *****************//
	
	
	//***********************LISTENERS*************************//
	
	//listen to logs coming from our backend
	bracketsjdk.on("log", function(event, text){
		console.log(text);
	});
	
	//listen to any output
	bracketsjdk.on("output", function(event, text){
		console.output(text);
	});
	
	//same but for errors
	bracketsjdk.on("error", function(event, text){
		console.error(text);
	});
	//listen to any input coming in from the console
	console.onInput(function(input){
		writeToStdin(input);
	});
	
	//***********************COMMANDS*************************//
	//register the command for "Build Project"
	var buildProjectCommand			= CommandManager.register(
		"Build Java Project",
		"bracketsjdk.buildProjectCommand",
		function(){
			var projectPath = findProjectPath();
			if(projectPath != undefined){
				compileProject(projectPath, './bin')
		}
	});
	
	//register the command for "Run Project"
	var runProjectCommand			= CommandManager.register(
		"Run Java Project",
		"bracketsjdk.runProjectCommand",
		function(){
			var projectPath = findProjectPath();
			if(projectPath != undefined){
				findJavaMainUnderPath(projectPath).then(function(className){
					//if we can't find the class main
					if(className != undefined)
						run(projectPath + "./bin/" + className);
				});
			}else
				return;
		}
	);
	
	//register the command for the "Build and Run Java Project"
	var buildAndRunProjectCommand	= CommandManager.register(
		"Build and Run Java Project",
		"bracketsjdk.buildAndRunProjectCommand",
		function(){
			var projectPath = findProjectPath();
			if(projectPath != undefined){
				compileProject(projectPath, './bin').then(function(result){
					//if compilation failed
					if(!result)
						return;
					findJavaMainUnderPath(projectPath).then(function(className){
						//if we can't find the class main
						if(className != undefined){
							run(projectPath + "./bin/" + className);
						}
					});
				});
				
			}else
				return;
			
		}
	);
	
	
	//*******************EDIT MENU***************************//
	//add 2 menu options in the Edit tab for these three commands
	//first get the Edit menu
	var editMenu			= Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
	//add a divider into the menu before our options to seperate our commands from the rest
	editMenu.addMenuDivider();
	//now add both commands by their ID
	editMenu.addMenuItem("bracketsjdk.buildProjectCommand");
	editMenu.addMenuItem("bracketsjdk.runProjectCommand");
	editMenu.addMenuItem("bracketsjdk.buildAndRunProjectCommand");
	//add divider after too
	editMenu.addMenuDivider();
	
	
	//********************KEYBOARD SHORTCUTS*****************//
	//bind keyboard shortcuts for both commands too
	KeyBindingManager.addBinding(buildProjectCommand, "Shift-F6");
	KeyBindingManager.addBinding(buildAndRunProjectCommand, "Ctrl-Shift-F6");
});