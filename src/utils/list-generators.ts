import Yeoman from "../yo/yo";
import { QuickPickItem, window } from "vscode";
const opn = require('opn');

export default function (yo: Yeoman): Promise<QuickPickItem[]> {
	return new Promise((resolve, reject) => {
		setImmediate(() => {
			yo.getEnvironment().lookup(() => {
				const generators = yo.getGenerators().map(generator => {
					return {
						label: generator.name.replace(/(^|\/)generator\-/i, '$1'),
						description: generator.description,
						subGenerators: generator.subGenerators
					};
				});

				if (generators.length === 0) {
					reject();

					window.showInformationMessage('Make sure to install some generators first.', 'more info')
						.then(choice => {
							if (choice === 'more info') {
								opn('http://yeoman.io/learning/');
							}
						});

					return;
				}

				resolve(generators);
			});
		});
	});
}