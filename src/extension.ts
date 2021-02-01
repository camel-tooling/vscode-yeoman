'use strict';

import {window, workspace, commands, ExtensionContext, Uri, OutputChannel} from 'vscode';
import EscapeException from './utils/EscapeException';
import Yeoman from './yo/yo';
import listGenerators from './utils/list-generators';

const figures = require('figures');

export function activate(context: ExtensionContext) {

	const yeomanCommand = 'yeoman.yeoman';
	const yoCommand = 'yeoman.yo';
	const outChannel = window.createOutputChannel('Yeoman');

	const commandHandler = (currentFolderUri?: Uri) => {
		let cwd = currentFolderUri ? currentFolderUri.fsPath : workspace.rootPath;
		if (!cwd) {
			window.showErrorMessage('Please open a workspace directory first.');
			return;
		}

		const yo = new Yeoman({cwd, outChannel});
		let main;
		let sub;

		Promise.resolve(window.showQuickPick(listGenerators(yo), { 
			placeHolder: 'Select one of the available Yeoman generators below.', 
			ignoreFocusOut: true
		})).then((generator: any) => {
				outChannel.show(true);
				if (generator === undefined) {
					throw new EscapeException();
				}

				main = generator.label;

				if (generator.subGenerators.length > 1) {
					return runSubGenerators(generator.subGenerators);
				} else {
					return 'app';
				}
			})
			.then(subGenerator => {
				if (subGenerator === undefined) {
					throw new EscapeException();
				}

				sub = subGenerator;

				return yo.run(`${main}:${sub}`, cwd);
			})
			.catch(err => {
				const regexp = new RegExp('Did not provide required argument (.*?)!', 'i');

				if (err) {
					const match = err.message.match(regexp);

					if (match) {
						return `${sub} ${match[1]}?`;
					}
				}

				throw err;
			})
			.then((question: any) => {
				// question provided only if argument is needed and calculated as a result of previous .catch call
				if (question === undefined) {
					throw new EscapeException();
				}
				return window.showInputBox({prompt: question})
					.then(input => {
						if (!input) {
							throw new EscapeException();
						}

						return input;
					});
			})
			.then(argument => {
				return yo.run(`${main}:${sub} ${argument}`, cwd);
			})
			.catch(err => {
				if (!err || err instanceof EscapeException) {
					return;
				}

				window.showErrorMessage(err.message || err);
			});
	};

	context.subscriptions.push(commands.registerCommand(yeomanCommand, commandHandler));
	context.subscriptions.push(commands.registerCommand(yoCommand, commandHandler));
}

function runSubGenerators(subGenerators: string[]) {
	const app = `${figures.star} app`;
	const index = subGenerators.indexOf('app');

	if (index !== -1) {
		subGenerators.splice(index, 1);
		subGenerators.unshift(app);
	}

	return window.showQuickPick(subGenerators)
		.then(choice => {
			if (choice === app) {
				return 'app';
			}

			return choice;
		});
}


