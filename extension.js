// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let myTimer;
let myStart;

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
	const startCommandId = 'dalydoro.startSelected';

	// Register command for timer status bar item
	context.subscriptions.push(vscode.commands.registerCommand(timerCommandId, () => {
		vscode.window.showInformationMessage("timer was selected!");
	}));

	// Register command for start status bar item
	context.subscriptions.push(vscode.commands.registerCommand(startCommandId, () => {
		vscode.window.showInformationMessage("start button selected!");
	}))

	// Create status bar timer item
	myTimer = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	myTimer.command = timerCommandId;
	context.subscriptions.push(myTimer);

	// Create start status bar item
	myStart = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	myStart.command = startCommandId;
	context.subscriptions.push(myStart);

	showTimer();
	showStart();
}

function showTimer() {
	myTimer.text = 'I am timer';
	myTimer.show();
}

function showStart() {
	myStart.text = `$(play)`;
	myStart.show();
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
