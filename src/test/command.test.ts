"use strict";

import * as vscode from "vscode";
import * as assert from "assert";

describe("vscode/commands", () => {

	const commandRegistrationChecker = async (commandName: string) => {
		// ensure that the command executes successfully
		try {
			await vscode.commands.executeCommand(commandName);
			assert.ok('command exists');
		} catch (error) {
			assert.fail(error);
		}
	};

	const commandRegistrationFailChecker = async (commandName: string) => {
		// ensure that the command does not execute successfully
		try {
			await vscode.commands.executeCommand(commandName);
			assert.fail('command exists');
		} catch (error) {
			assert.ok(error);
		}
	};

	describe("Yeoman and Yo", () => {

		it("Check yeoman command is registered", () => commandRegistrationChecker("yeoman.yeoman"));

		it("Check yo command is registered", () => commandRegistrationChecker("yeoman.yo"));

		it("Check yoyo command is not registered", () => commandRegistrationFailChecker("yeoman.yoyo"));
	});

});