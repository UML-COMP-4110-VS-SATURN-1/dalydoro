const vscode = require('vscode');

class TaskList {
    constructor() {
        this.taskList = [];
    }

    // opens input box to collect new task name, create a new task from that name and add 
    // to taskList
    async addTask() {
        const result = await vscode.window.showInputBox({
            prompt: 'Enter a new task to be tracked',
            placeHolder: 'Please enter a new task',
        });
        vscode.window.showInformationMessage(`new task: ${result}\n was added to the task list`);
        this.taskList.push(new Task(result));
    }

    // opens quick pick of task list, when a task is selected it will be removed from the list
    async removeTask() {
        const currentTasks = await this.getTasks();
        
        vscode.window.showQuickPick(currentTasks)
            .then((selection) => {
                // drop selected from list unless undefined
                if(selection){                    
                    for(let i = 0; i < this.taskList.length; i++){
                        let curTaskName = this.taskList[i].name;
                        if(selection == curTaskName){
                            this.taskList.splice(i,1);
                        }
                    }
                }
            })

    }

    // returns list of task names
    async getTasks() {
        let currentList = [];
        for(let i = 0; i < this.taskList.length; i++){
            currentList.push(this.taskList[i].name);
        }
        return currentList;
    }

    // mark a selected task complete. Add checkmark to name and mark task complete
    async markTaskComplete(selection){
        // find task
        for(let i = 0; i < this.taskList.length; i++){
            if(selection === this.taskList[i].name && this.taskList[i].isComplete === false){
                this.taskList[i].CompleteTask();
                this.taskList[i].name = '$(check) ' + this.taskList[i].name;
                break;
            }
        }
    }

}


class Task {
    constructor(_name, _isComplete = false) {
        this.name = _name;
        this.isComplete = _isComplete;
    }

    CompleteTask() {
        this.isComplete = true;
    }
}

module.exports = TaskList;