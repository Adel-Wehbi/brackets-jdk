
(function () {
    "use strict";

	var shell = require("shelljs");
	
    function compileFile(filePath, outputPath){
		shell.cd("~/.config/Brackets/extensions/user/java/");
		shell.exec("javac test.java ");
	}
    
   function init(domainManager){
		if (!domainManager.hasDomain("basicjdk")) {
            domainManager.registerDomain("basicjdk", {major: 0, minor: 1});
        }
		
		domainManager.registerCommand(
			"basicjdk",
			"compile",
			compile,
			false,
			"Prints Message",
			[{name: "msg", type: "string", description: "message to print."}],
			[]
		);
	}
    
    exports.init = init;
    
}());