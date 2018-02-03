define(function(require, exports, module){
	"use strict";
	
	var _$panel			= $(require('text!html/console.html'));
	var _visible		= false;
	
	var PanelManager	= brackets.getModule("view/PanelManager");
	var Resizer			= brackets.getModule("utils/Resizer");
	
	/**
	 * Creates the panel to initialize the console.
	 * @private
	 * @author Adel Wehbi
	 */
	function _init(){
		PanelManager.createBottomPanel("basicjdk.console", _$panel, 100);
		_$panel.find(".close").on("click", function(){
			hide();
		});
	}
	
	/**
	 * Called when the user enters something into the console. Triggers the "input" event.
	 * @private
	 * @author Adel Wehbi
	 * @param {string} text Text entered by the user.
	 */
	function _input(text){
		$(this).trigger("input", text);
	}
	
	/**
	 * Shows the console.
	 * @author Adel Wehbi
	 */
	function show(){
		if(!_visible){
			//show panel
			Resizer.show(_$panel);
			_visible = true;
		}
	}
	
	/**
	 * Hides the console.
	 * @author Adel Wehbi
	 */
	function hide(){
		if(_visible){
			//hide panel
			Resizer.hide(_$panel);
			_visible = false;
		}
	}
	
	/**
	 * Writes out to the console when called.
	 * @author Adel Wehbi
	 * @param {string} text Text to output.
	 */
	function log(text){
		if(!_visible)
			show();
		_$panel.find("#content").append(text);
	}
	
	/**
	 * Writes out errors to the console when called.
	 * @author Adel Wehbi
	 * @param {string} text Error text to ouput.
	 */
	function error(text){
		if(!_visible)
			show();
		_$panel.find("#content").append(text);
	}
	
	
	//initialize immediately once imported
	_init();
	
	//expose these functions
	exports.show	= show;
	exports.hide	= hide;
	exports.log		= log;
	exports.error	= error;
	//export this object as $(this), to make setting listeners easier
	exports			= $(exports);
});