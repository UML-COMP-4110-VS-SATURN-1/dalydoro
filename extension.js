// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let myTimer;
let myStartStop;
//let myPause;
let myList;
let taskList = ["task 1", "task 2"];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dalydoro" is now active!');

	
	const timerCommandId = 'dalydoro.timerSelected';
	const startStopCommandId = 'dalydoro.startSelected';
	//const pauseCommandId = 'dalydoro.pauseSelected';
	const listCommandId = 'dalydoro.listSelected';

	// Register command for timer status bar item
	context.subscriptions.push(vscode.commands.registerCommand(timerCommandId, () => {
		vscode.window.showInformationMessage("timer was selected!");
	}));

	// Register command for start status bar item
	context.subscriptions.push(vscode.commands.registerCommand(startStopCommandId, () => {
		vscode.window.showInformationMessage("start button selected!");
	}));

	// Register command for pause status bar item
	// context.subscriptions.push(vscode.commands.registerCommand(pauseCommandId, () => {
	// 	vscode.window.showInformationMessage("pause button selected!");
	// }));

	// Register command for list status bar item
	context.subscriptions.push(vscode.commands.registerCommand(listCommandId, () => {
		vscode.window.showInformationMessage("list button selected!");
		vscode.window.showQuickPick(taskList);
	}));

	// Create status bar timer item
	myTimer = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
	myTimer.command = timerCommandId;
	context.subscriptions.push(myTimer);

	// Create start status bar item
	myStartStop = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
	myStartStop.command = startStopCommandId;
	context.subscriptions.push(myStartStop);

	// Create pause status bar item
	// myPause = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	// myPause.command = pauseCommandId;
	// context.subscriptions.push(myPause);

	// Create list status bar item
	myList = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	myList.command = listCommandId;
	context.subscriptions.push(myList);

	// Call functions to display status bar items
	showTimer(); 
	showStart();
	//showPause();
	showList();
}

function showTimer() {
	myTimer.text = 'I am timer';
	myTimer.show();
}

function showStart() {
	myStartStop.text = `$(play)`;
	myStartStop.show();
}

// function showPause() {
// 	myPause.text = `$(debug-pause)`;
// 	myPause.show();
// }

function showList() {
	myList.text = `$(tasklist)`;
	myList.show();
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
