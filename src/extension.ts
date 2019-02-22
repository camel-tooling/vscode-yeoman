'use strict';

import * as vscode from 'vscode';
import EscapeException from './utils/EscapeException';
import Yeoman from './yo/yo';
import * as figures from 'figures';
import * as opn from 'opn';

interface YeomanGeneratorQuickPickItem extends vscode.QuickPickItem {
	subGenerators : any[];
	id : string;
}

async function handleCommand(): Promise<any> {
	const cwd = vscode.workspace.rootPath;
	if (!cwd) {
		vscode.window.showErrorMessage('Please open a workspace directory first.');
		return;
	}

	const yo = new Yeoman({cwd});
	let main:any;
	let sub:any;
	const generatorList:vscode.QuickPickItem[] = await list(yo);

	return Promise.resolve(vscode.window.showQuickPick(generatorList, 
		{ 
			placeHolder: 'Select one of the available Yeoman generators below.'
		})).then((generator: any) => {
			if (generator === undefined) {
				throw new EscapeException();
			}
			main = generator.label;
			if (generator.subGenerators.length > 1) {
				return runSubGenerators(generator.subGenerators);
			} else {
				return 'app';
			}
		}).then(subGenerator => {
			if (subGenerator === undefined) {
				throw new EscapeException();
			}
			sub = subGenerator;
			return yo.run(`${main}:${sub}`, cwd);
		}).catch(err => {
			const regexp = new RegExp('Did not provide required argument (.*?)!', 'i');
			if (err) {
				const match = err.message.match(regexp);
				if (match) {
					return `${sub} ${match[1]}?`;
				}
			}
			throw err;
		}).then((question: any) => {
			return vscode.window.showInputBox({prompt: question})
				.then(input => {
					if (!input) {
						throw new EscapeException();
					}
					return input;
				});
		}).then(argument => {
			return yo.run(`${main}:${sub} ${argument}`, cwd);
		}).catch(err => {
			if (!err || err instanceof EscapeException) {
				return;
			}
			vscode.window.showErrorMessage(err.message || err);
		});
}

export function activate(context: vscode.ExtensionContext) {
	const yeomanCommand = 'yeoman.yeoman';
	const yoCommand = 'yeoman.yo';

	context.subscriptions.push(vscode.commands.registerCommand(yeomanCommand, handleCommand));
	context.subscriptions.push(vscode.commands.registerCommand(yoCommand, handleCommand));
}

function runSubGenerators(subGenerators: string[]) {
	const app = `${figures.star} app`;
	const index = subGenerators.indexOf('app');

	if (index !== -1) {
		subGenerators.splice(index, 1);
		subGenerators.unshift(app);
	}

	return vscode.window.showQuickPick(subGenerators)
		.then(choice => {
			if (choice === app) {
				return 'app';
			}
			return choice;
		});
}

function list(yo: Yeoman): Promise<vscode.QuickPickItem[]> {
	return new Promise((resolve, reject) => {
		yo.getEnvironment().lookup(() => {
			let generators: YeomanGeneratorQuickPickItem[] = [];
			yo.getGenerators().forEach ( generator => {
				generators.push( {
					label: generator.name.replace(/(^|\/)generator\-/i, '$1'),
					description: generator.description,
					subGenerators: generator.subGenerators, 
					id: generator.name
				});
			});

			if (generators.length === 0) {
				vscode.window.showInformationMessage('Make sure to install some generators first.', 'more info')
					.then(choice => {
						if (choice === 'more info') {
							opn('http://yeoman.io/learning/');
						}
					});

				reject();
			}

			resolve(generators);
		});
	});
}
