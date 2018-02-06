define(function(require, exports, module) {
    "use strict";

    //all the ui stuff
    var _$panel             = $(require('text!html/console.html'));
    var _$contentWrapper    = _$panel.find("#content-wrapper");
    var _$output            = _$panel.find("#output");
    var _$caret             = _$panel.find(".custom-caret");
    var _$input             = _$panel.find("#input");
    var _$inputContent      = _$panel.find("#input-content");
    var _visible            = false;

    var inputCallback;

    var WorkspaceManager    = brackets.getModule("view/WorkspaceManager");
    var Resizer             = brackets.getModule("utils/Resizer");
    var ExtensionUtils      = brackets.getModule("utils/ExtensionUtils");

    /**
     * Creates the panel to initialize the console.
     * @private
     * @author Adel Wehbi
     */
    function _init() {
        //load console.css file
        ExtensionUtils.loadStyleSheet(module, "css/console.css").then(function() {
            WorkspaceManager.createBottomPanel("bracketsjdk.console", _$panel, 100);
            //make sure the x button actually closes the console.
            _$panel.find(".close").on("click", function() {
                hide();
            });
            //start blinking the cursor
            _blinkCursor();
            //start listening to input
            _listenToInput();
            console.log(_$panel.find("#content-wrapper").css("height"));
        });
    }

    /**
     * Starts an infinite loop to keep blinking the text cursor.
     * @private
     * @author Adel Wehbi
     */
    function _blinkCursor() {
        _$caret.fadeTo("slow", 0, function() {
            $(this).fadeTo("slow", 1, function() {
                _blinkCursor();
            });
        });
    }

    /**
     * Listens for clicks in the console and grabs focus after a click event. Listens to
     * the Enter key and then calls the _input callback with the input content.
     * @private
     * @author Adel Wehbi
     */
    function _listenToInput() {
        //grab the focus on click
        _$panel.on("click", function() {
            _$panel.find("input").focus();
        });

        //make sure the input caret sticks to the end
        _$input.on("keydown", function(event) {
            //reset the caret position to the end
            this.setSelectionRange(this.value.length, this.value.length);
        });

        //listen to the enter button with keypress
        _$input.on("keypress", function(event) {
            //13 is the code for the Enter key
            if (event.which == 13) {
                //get the text and add the newline we just captured
                var text = $(this).val() + "\n";
                //clear input
                $(this).val("");
                _$inputContent.html("");
                //trigger the input event with the text that we received
                _input(text);
                //and finally write the text we received to console so it doesn't get lost
                output(text);
                //we're done here
                return;
            }
        });
        //update the visible input-content with whatever is in the <input> element
        _$input.on("input", function(event) {
            _$inputContent.html(this.value);
        });
    };

    function _scrollToBottom() {
        _$contentWrapper.scrollTop(_$contentWrapper[0].scrollHeight);
    }

    /**
     * Returns current time for logging purposes.
     * @private
     * @author Adel Wehbi
     * @returns {string} The time in the format HH:MM:SS.
     */
    function _getTime() {
        var time = new Date();
        return ("0" + time.getHours()).slice(-2) +
            ":" + ("0" + time.getMinutes()).slice(-2) +
            ":" + ("0" + time.getSeconds()).slice(-2);
    }

    /**
     * Called when the user enters something into the console. Triggers the "input" event.
     * @private
     * @author Adel Wehbi
     * @param {string} text Text entered by the user.
     */
    function _input(text) {
        if (inputCallback != undefined)
            inputCallback(text);
    }


    /**
     * Sets the the callback that is called when console receives input.
     * @author Adel Wehbi
     * @param {function} callback Callback Function
     */
    function onInput(callback) {
        inputCallback = callback;
    }

    /**
     * Shows the console.
     * @author Adel Wehbi
     */
    function show() {
        if (!_visible) {
            //show panel
            Resizer.show(_$panel);
            _visible = true;
            //grab the focus
            _$panel.find("input").focus();
        }
    }

    /**
     * Hides the console.
     * @author Adel Wehbi
     */
    function hide() {
        if (_visible) {
            //hide panel
            Resizer.hide(_$panel);
            _visible = false;
        }
    }


    /**
     * Logs to console. That includes a timestamp and a new line after the text.
     * @author Adel Wehbi
     * @param {string} text Line to log.
     */
    function log(text) {
        if (!_visible)
            show();
        _$output.append("[" + _getTime() + "]: " + text + "\n");
        _scrollToBottom();
    }

    /**
     * Writes text as is to output.
     * @author Adel Wehbi
     * @param {string} text Text to output.
     */
    function output(text) {
        if (!_visible)
            show();
        _$output.append(text);
        _scrollToBottom();
    }

    /**
     * Writes out errors to the console when called.
     * @author Adel Wehbi
     * @param {string} text Error text to ouput.
     */
    function error(text) {
        if (!_visible)
            show();
        _$output.append(text);
        _scrollToBottom();
    }


    //initialize immediately once imported
    _init();

    //expose these functions
    exports.onInput = onInput;
    exports.show = show;
    exports.hide = hide;
    exports.log = log;
    exports.output = output;
    exports.error = error;
});
