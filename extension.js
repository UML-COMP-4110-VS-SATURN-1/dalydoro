// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { PerformanceObserver } = require('perf_hooks');
const vscode = require('vscode');

let myTimer;
let myStartStop;
let myList;
let taskList = ["task 1", "task 2"];
let startTimer;

// Mock-up object holds value for timer, and a bool for whether it is paused or not.
// For temporary use only, needs to be developed further.
let myTimerObj = {
	pomodoroSection: 0,
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

let periodLength = {
	work: 25,
	shortBreak: 5,
	longBreak: 10,
	snooze: 5
};

let checkMarks = {
	marks: [],
	cycles: null,
	numOfCyclesCompleted: 0
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
	setTimerlength();
	showTimer();
	showStartStop();
	showList();
}

//length should be given in minutes
function setTimerlength(){
	let length;
	
	// deciding which period is being useds
	if(myTimerObj.pomodoroSection >= 7){
		length = periodLength.longBreak;
		myTimerObj.pomodoroSection = 0;
	}else if(myTimerObj.pomodoroSection % 2 == 0){
		length = periodLength.work;
		myTimerObj.pomodoroSection++;
	}else{
		length = periodLength.shortBreak;
		myTimerObj.pomodoroSection++;
	}
	myTimerObj.timeInSec = length * 60;

	// if timer starts at less then a minute this displays it correctly
	if(myTimerObj.timeInSec >= 60){
		myTimerObj.remaining = length.toString() + ":00";	
	}else{
		myTimerObj.remaining = "0:" + length.toString();
	}
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
		setTimerlength();
		showStartStop();

		// Add and display checkmark when a work period completed
		// (resets on an extended break)
		if (myTimerObj.pomodoroSection == 0) {
			checkMarks.numOfCyclesCompleted++;
			for(var i = 0; i < checkMarks.marks.length; ++i) {
				checkMarks.marks[i].hide();
				checkMarks.marks[i].dispose();
			}
			if (checkMarks.numOfCyclesCompleted == 1) {
				checkMarks.cycles = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -1);
				checkMarks.cycles.text = "x" + checkMarks.numOfCyclesCompleted.toString();
				checkMarks.cycles.show();
			} else {
				checkMarks.cycles.text = "x" + checkMarks.numOfCyclesCompleted.toString();
			}
		} else if (myTimerObj.pomodoroSection % 2 == 0){
			var checkMark = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
			checkMark.text = "$(check)";
			checkMark.show();
			checkMarks.marks.push(checkMark);
		}
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
