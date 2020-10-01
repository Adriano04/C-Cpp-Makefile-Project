import * as vscode from 'vscode';
import { Language, createProject } from './project';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand(
		'c-cpp-project.initProject', () => {
			const projectPicks = [
				'C Project',
				'C++ Project',
				'Only C Makefile',
				'Only C++ Makefile'
			];
			const showMsg = (text: string) => vscode.window.showInformationMessage(text);
			
			vscode.window.showQuickPick(projectPicks, { canPickMany: false })
				.then((value: string|undefined) => {
					if (value === undefined) {
						showMsg('Could not create Project. Select an option.');
						return;
					}
					let isCreated = false;
					switch (value) {
						case projectPicks[0]:
							isCreated = createProject(Language.C, false);
							break;
						case projectPicks[1]:
							isCreated = createProject(Language.CPP, false);
							break;
						case projectPicks[2]:
							isCreated = createProject(Language.C, true);
							break;
						case projectPicks[3]:
							isCreated = createProject(Language.CPP, true);
							break;
					}
					if (isCreated) {
						showMsg(value + ' created!');
					} else {
						showMsg('Could not created project. Please open a folder!');
					}
				}, (reason: any) => {
					showMsg(`Could not create Project due to following reason: ${reason}`);
				});
		}
	));
}

// this method is called when your extension is deactivated
export function deactivate() {}
