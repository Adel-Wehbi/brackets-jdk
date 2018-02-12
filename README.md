# brackets-jdk

Integration for Java Development Kit. Compiles and Runs. Includes its own Java Console.

## Dependencies
<ul>
      <li>  <a href="https://github.com/shelljs/shelljs">Shelljs</a> (will be phased out in the future)             </li>
      <li>  Java Development Kit (java and javac commands should run correctly from the Command Prompt or Terminal) </li>
</ul>

## Usage
The Extension adds 4 commands to the Edit Menu in the Menu Bar:
<ul>
    <li>    Build Java Project (Shortcut: Shift-F6)                 </li>
    <li>    Run Java Project (Shortcut: None)                       </li>
    <li>    Build and Run Java Project (Shortcut: Ctrl-Shift-F6)    </li>
    <li>    Toggle Java Console (Shortcut: Ctrl-Alt-J)              </li>
</ul>

Java Project are considered to be the folders present <b>on</b> Bracket's Project Root.
So for example, say you want to create two Java projects, you create two new folders on the Bracket's
Project Root called "JavaProject1" and "JavaProject2". In the future, this will be a preference option.

<i>Which</i> java project to compile is determined by the currently viewed file. In our example, if
you're currently viewing a file ```main.java"``` located immediately in the "JavaProject1" directory
and you use the Compile command, then "JavaProject1" will be compiled.

Compiled files are placed in the directory ```bin/``` inside the project. If that directory does not exist,
it will be created. This directory is emptied before each compilation. In the future, the location of this directory
will be a preference choice.

When using th Run command, the extension itself finds the class that contains the main method
using the Regex ```public\s+static\s+void\s+main``` and runs that class.

Currently, this extension only supports <b>one</b> point of entry to any Java project. If you have
several main methods in your project, the first class found to have that method will be run.

## TODO
I intend to work on these features later on. However, if you would like to contribute, go ahead!
Do make me aware that you've adopted a feature from the TODO list so I don't start from scratch on it.
If you'd like a specific feature added to this list, file an issue! Here's the TODO list
(There's no order of priority):
<ul>
    <li>
        Remove the Shelljs dependency as it turned out it isn't very necessary. (Phasing its use out should be easy). STATUS: ONGOING.
    </li>
    <li>
        Support setting preferences such as whether to have the entire workspace be one Java project,
        the location of the build directory...
    </li>
    <li>
        Support multiple project entry points (multiple main methods).
    </li>
    <li>
        Autocomplete support for Java.
    </li>
    <li>
        Java linting and error detection.
    </li>
    <li>
        Support displaying Java documentation (including for user created functions).
    </li>
</ul>

## Contribute
Contributing to this project should be fairly easy. There are a few things to keep in mind though.
If you want to modify anything that normally occurs on the command line (compiling, or running, etc...),
you need to effect your modifications on the Nodejs end of Brackets. An example of that is the file ```bracketsjdk.js```.
You can modify that file or imitate it. If you want to call any function on the Nodejs side from the node-webkit side,
you'll have to use the Node Domain variable (that would be the variable ```bracketsjdk``` in the ```main.js``` file).
If you want to send something from the Nodejs side to the node-webkit side, however, you'll have to use the DomainManager.emitEvent
function (see ```bracketsjdk.js``` for an example).

For a clearer explanation on how that works, consult the
<a href="https://github.com/adobe/brackets/wiki/Brackets-Node-Process:-Overview-for-Developers">Brackets Node Process: Overview for Developers</a>.
