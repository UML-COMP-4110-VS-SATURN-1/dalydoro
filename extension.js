// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//const { PerformanceObserver } = require('perf_hooks');
const vscode = require('vscode');
const TaskList = require('./tasklist');

let myTimer;
let mySnooze;
let myStartStop;
let myList;
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
	alarm: false,
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
	snooze: 25
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
	const taskList = new TaskList();
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dalydoro" is now active!');

	const snoozeCommandId = 'dalydoro.snoozeSelected';
	const startStopCommandId = 'dalydoro.startSelected';
	const listCommandId = 'dalydoro.listSelected';

	// Register command for snooze status bar item
	context.subscriptions.push(vscode.commands.registerCommand(snoozeCommandId, () => {
		myTimerObj.isPaused = false;
		if(myTimerObj.alarm == true){
			clearAlert();
			clearInterval(startAlert);
			showStartStop();
			setTimerlength();
		}else {
			myTimerObj.isSnoozed = true;
			myTimerObj.timeInSec += periodLength.snooze * 60; // adds snooze length in seconds
		}
		showTimer();
	}));

	// Register command for start/stop status bar item
	context.subscriptions.push(vscode.commands.registerCommand(startStopCommandId, () => {
		// Start stop button pushed, toggle pause value, update button state
		myTimerObj.togglePause(); 
		clearInterval(startAlert);
		showStartStop();
		showTimer();
		clearAlert();
	}));

	// Register command for list status bar item
	context.subscriptions.push(vscode.commands.registerCommand(listCommandId, async () => {
		const currentList = await taskList.getTasks();
		const options = [
			'add task',
			'remove task'
		]
		const quickPickOptions = [].concat(currentList,options);

		vscode.window.showQuickPick(quickPickOptions)
			.then((selection) => {
				if(selection === 'add task') {
					taskList.addTask();
				} else if (selection === 'remove task'){
					taskList.removeTask();
				} else if (selection){ 
					taskList.markTaskComplete(selection);
				}
		})
	}));

	// Create status bar timer item
	mySnooze = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	mySnooze.command = snoozeCommandId;
	context.subscriptions.push(mySnooze);

	// Create status bar timer item
	myTimer = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4);
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
	if(vscode.window.activeColorTheme.kind == themeKind){ // base theme
		vscode.workspace.getConfiguration('workbench').update('colorTheme', secondaryTheme, vscode.ConfigurationTarget.Global);
	}else {
		vscode.workspace.getConfiguration('workbench').update('colorTheme', theme, vscode.ConfigurationTarget.Global);
	}

	myTimerObj.alarm = true;
}

// this function will refresh the timer on the bottom of the corner
function timerRefresh(){
	myTimerObj.timeInSec -= 1;
	let minutes = Math.floor(myTimerObj.timeInSec / 60);
	let seconds = myTimerObj.timeInSec - (minutes * 60);
	
	// Add leading a zero for when there are less than 10 seconds left
	if (seconds < 10) {
		myTimerObj.remaining = minutes.toString() + ":0" + seconds.toString();
	} else {
		myTimerObj.remaining = minutes.toString() + ":" + seconds.toString();
	}
	showTimer();
}

function showTimer() {
	if(myTimerObj.timeInSec <= 0){
		myTimerObj.setRemaining(`Timer expired`);
		// sets paused to true so that the alarm will go until play is pressed again
		myTimerObj.isPaused = true; 
		clearInterval(startTimer);
		alert();
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

function clearAlert(){
	myTimerObj.alarm = false;
	vscode.workspace.getConfiguration('workbench').update('colorTheme', theme, vscode.ConfigurationTarget.Global);
}


function showStartStop() {
	if(!myTimerObj.checkPaused()){ 
		myStartStop.text = `$(debug-pause)`;
		myTimerObj.setRemaining(`Started`);
		startTimer = setInterval(function timer(){
			timerRefresh();
		}, 1000);
	} else {
		myStartStop.text = `$(play)`;
		clearInterval(startTimer);
	}
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
