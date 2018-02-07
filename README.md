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
So for example, say you want to create two java projects, you create two new folders on the Bracket's
Project Root called "JavaProject1" and "JavaProject2". In the future, this will be a preference option.

</br>

<i>Which</i> java project to compile is determined by the currently viewed file. In our example, if
you're currently viewing a file "main.java" located immediately in the "JavaProject1" directory
and you use the Compile command, then "JavaProject1" will be compiled.

</br>

Compiled files are placed in the directory bin/ inside the project. If that directory does not exist,
it will be created. This directory is emptied before each compilation. In the future, the location of this directory
will be a preference choice.

When using th Run command, the extension itself finds the class that contains the main method
using the regex "public\s+static\s+void\s+main" and runs that class.

</br>

Currently, this extension only supports <b>one</b> point of entry to any java project. If you have
several main methods in your app, the first class found to have that method will be run.

## TODO
I intend to work on these features later on. However, if you would like to contribute, go ahead!
Do make me aware that you've adopted a feature from the TODO list so I don't start from scratch on it.
If you'd like a specific feature added to this list, file an issue! Here's the TODO list
(There's no order of priority):
<ul>
    <li>
        Remove the Shelljs dependency as it turned out it isn't very necessary. (Phasing its use out should be easy)
    </li>
    <li>
        Support setting preferences such as whether to have the entire workspace be one java project,
        the location of the build directory...
    </li>
    <li>
        Support multiple project entry points (multiple main methods).
    </li>
    <li>
        Autocomplete support for java.
    </li>
    <li>
        Java linting and error detection.
    </li>
    <li>
        Support displaying Java documentation (including for user created functions).
    </li>
</ul>
