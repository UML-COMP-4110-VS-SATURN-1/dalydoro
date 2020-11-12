// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let myTimer;

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

	context.subscriptions.push(vscode.commands.registerCommand(timerCommandId, () => {
		vscode.window.showInformationMessage("timer was selected!");
	}));

	// create status bar timer item
	myTimer = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	myTimer.command = timerCommandId;
	context.subscriptions.push(myTimer);

	updateTimer();

}

function updateTimer() {
	myTimer.text = 'I am timer';
	myTimer.show();
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
