import { window, QuickPickOptions } from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

export default class ListPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		let inquirerChoices = this._question.choices;
		// see https://github.com/SBoudrias/Inquirer.js#question -> choices documentation
		if (typeof inquirerChoices === "function") {
			inquirerChoices = inquirerChoices();
		}
		const choices = inquirerChoices.reduce((result, choice) => {
			if (typeof choice !== "object") {
				// choice can be string or number
				choice = {name: choice, value: choice};
			}
			// choice can be object with name and value properties
			result[choice.name] = choice.value;
			return result;
		}, {});

		const options: QuickPickOptions = {
			 placeHolder: this._question.message
		};

		return window.showQuickPick(Object.keys(choices), options)
			.then(result => {
				if (result === undefined) {
					throw new EscapeException();
				}

				return choices[result];
			});
	}
}
