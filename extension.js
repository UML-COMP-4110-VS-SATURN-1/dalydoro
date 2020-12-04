// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { PerformanceObserver } = require('perf_hooks');
const vscode = require('vscode');

let myTimer;
let mySnooze;
let myStartStop;
let myList;
let taskList = ["task 1", "task 2"];
let startTimer;
let startAlert;
let secondaryTheme;
const themeKind = vscode.window.activeColorTheme.kind;
const theme = vscode.workspace.getConfiguration('workbench').get('colorTheme');

// Mock-up object holds value for timer, and a bool for whether it is paused or not.
// For temporary use only, needs to be developed further.
let myTimerObj = {
	pomodoroSection: 0,
	timeInSec: 0,
	remaining: "Timer will start",// "i am timer", // initial value
	isPaused: true, // shows whether paused
	isSnoozed: false, // shows weather snoozed or not
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

let periodLength = {
	work: 0.1,
	shortBreak: 0.2,
	longBreak: 10,
	snooze: 5
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
	const snoozeCommandId = 'dalydoro.snoozeSelected';
	const startStopCommandId = 'dalydoro.startSelected';
	const listCommandId = 'dalydoro.listSelected';

	// Register command for timer status bar item
	context.subscriptions.push(vscode.commands.registerCommand(timerCommandId, () => {
		vscode.window.showInformationMessage("timer was selected!");
	}));

	// Register command for timer status bar item
	context.subscriptions.push(vscode.commands.registerCommand(snoozeCommandId, () => {
		vscode.window.showInformationMessage("snooze was selected!");
		myTimerObj.isSnoozed = true;
		myTimerObj.isPaused = false;
		setTimerlength();
		showStartStop();
		showTimer();
		clearInterval(startAlert);
	}));

	// Register command for start/stop status bar item
	context.subscriptions.push(vscode.commands.registerCommand(startStopCommandId, () => {
		vscode.window.showInformationMessage("start/stop button selected!");
		myTimerObj.togglePause(); // Start stop button pushed, toggle pause value, update button state
		clearInterval(startAlert);
		showStartStop();
		showTimer();
	}));

	// Register command for list status bar item
	context.subscriptions.push(vscode.commands.registerCommand(listCommandId, () => {
		vscode.window.showInformationMessage("list button selected!");
		vscode.window.showQuickPick(taskList);
	}));

	// Create status bar timer item
	mySnooze = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	mySnooze.command = snoozeCommandId;
	context.subscriptions.push(mySnooze);

	// Create status bar timer item
	myTimer = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4);
	myTimer.command = timerCommandId;
	context.subscriptions.push(myTimer);

	// Create start status bar item
	myStartStop = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
	myStartStop.command = startStopCommandId;
	context.subscriptions.push(myStartStop);

	// Create list status bar item
	myList = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	myList.command = listCommandId;
	context.subscriptions.push(myList);

	// Call functions to display status bar items
	pickTheme();
	setTimerlength();
	showTimer();
	showStartStop();
	showList();
	showSnooze();
}

//length should be given in minutes
function setTimerlength(){
	let length;
	
	// deciding which period is being useds
	if(myTimerObj.isSnoozed == true){
		length = periodLength.snooze;
	}else {
		if(myTimerObj.pomodoroSection >= 8){
			length = periodLength.longBreak;
			myTimerObj.pomodoroSection = 0;
		}else if(myTimerObj.pomodoroSection % 2 == 0){
			length = periodLength.work;
			myTimerObj.pomodoroSection++;
		}else{
			length = periodLength.shortBreak;
			myTimerObj.pomodoroSection++;
		}
	}
	myTimerObj.timeInSec = length * 60;
	myTimerObj.remaining = length.toString() + ":00"; // this only works for exact minutes. 1:30 won't display properly in the beginning
}

function alert(){
	startAlert = setInterval(function timer(){
		if(vscode.window.activeColorTheme.kind == themeKind){ // base theme
			vscode.workspace.getConfiguration('workbench').update('colorTheme', secondaryTheme, vscode.ConfigurationTarget.Global);
		}else {
			vscode.workspace.getConfiguration('workbench').update('colorTheme', theme, vscode.ConfigurationTarget.Global);
		}
	}, 1000);
}

// this function will refresh the timer on the bottom of the corner
function timerRefresh(){myTimerObj.togglePause(); // Start stop button pushed, toggle pause value, update button state
		
	myTimerObj.timeInSec -= 1;
	let tempTimer = Math.floor(myTimerObj.timeInSec / 60);
	// ugly line but it works for now but it works
	myTimerObj.remaining = tempTimer.toString() + ":" + (myTimerObj.timeInSec - (tempTimer * 60)).toString();
	showTimer();
}

function showTimer() {
	if(myTimerObj.timeInSec <= 0){
		myTimerObj.setRemaining(`Timer expired`);
		myTimerObj.isPaused = true; // sets paused to true so that the alarm will go until play is pressed again
		clearInterval(startTimer);
		alert();
		setTimerlength();
		showStartStop();
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
	vscode.workspace.getConfiguration('workbench').update('colorTheme', theme, vscode.ConfigurationTarget.Global);
	myStartStop.show();
}

function showSnooze(){
	mySnooze.text = "SNOOZE";
	mySnooze.show();
}

function showList() {
	myList.text = `$(tasklist)`;
	myList.show();
}

function pickTheme(){
	if(themeKind == 1) { 
		secondaryTheme = "Default Dark+";
	}else {
		secondaryTheme = "Default Light+";
	}
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
