// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let myTimer;
let myStartStop;
let myList;
let taskList = ["task 1", "task 2"];
let startTimer 

// Mock-up object holds value for timer, and a bool for whether it is paused or not.
// For temporary use only, needs to be developed further.
let myTimerObj = {
	timeInSec: 0,
	remaining: "Timer will start",// "i am timer", // initial value
	isPaused: true, // shows whether paused
	checkPaused: function() {
		return this.isPaused;
	},
	getRemaining: function() {
		return this.remaining;
	},
	togglePause: function() {
		this.isPaused = !this.isPaused;
	},
	setRemaining: function(val) {
		this.remaining = val;
	}
};

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
	const listCommandId = 'dalydoro.listSelected';

	// Register command for timer status bar item
	context.subscriptions.push(vscode.commands.registerCommand(timerCommandId, () => {
		vscode.window.showInformationMessage("timer was selected!");
	}));

	// Register command for start/stop status bar item
	context.subscriptions.push(vscode.commands.registerCommand(startStopCommandId, () => {
		vscode.window.showInformationMessage("start/stop button selected!");
		myTimerObj.togglePause(); // Start stop button pushed, toggle pause value, update button state
		showStartStop();
		showTimer();
	}));

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

	// Create list status bar item
	myList = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	myList.command = listCommandId;
	context.subscriptions.push(myList);

	// Call functions to display status bar items
	showTimer(); 
	setTimerLenght(0.1); // 25 is placeholder lenght
	showStartStop();
	showList();
}

//lenght should be given in minutes
function setTimerLenght(lenght){
	myTimerObj.timeInSec = lenght * 60;
	myTimerObj.remaining = lenght.toString() + ":00";
}

// this function will refresh the timer on the bottom of the corner
function timerRefresh(){
	myTimerObj.timeInSec -= 1;
	let tempTimer = Math.floor(myTimerObj.timeInSec / 60);
	// ugly line but it works for now but it works
	myTimerObj.remaining = tempTimer.toString() + ":" + (myTimerObj.timeInSec - (tempTimer * 60)).toString();
	showTimer();
}

function showTimer() {
	if(myTimerObj.timeInSec <= 0){
		myTimerObj.setRemaining(`Timer expired`);
		clearInterval(startTimer);
	}
	myTimer.text = myTimerObj.getRemaining();
	myTimer.show();
}


function showStartStop() {
	if(!myTimerObj.checkPaused()){ 
		myStartStop.text = `$(debug-pause)`;
		myTimerObj.setRemaining(`timer started`);
		startTimer = setInterval(function timer(){
			timerRefresh();
		}, 1000);
	} else {
		myStartStop.text = `$(play)`;
		clearInterval(startTimer);
	}
	myStartStop.show();
}

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
