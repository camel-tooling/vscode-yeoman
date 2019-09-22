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
			console.log("commandRegistrationFailChecker");
			await vscode.commands.executeCommand(commandName);
			assert.fail('command exists');
		} catch (error) {
			assert.ok(error);
		}
	};

	describe("Yeoman and Yo register", () => {

		it("Check yeoman command is registered", async () => await commandRegistrationChecker("yeoman.yeoman"));

		it("Check yo command is registered", async () => await commandRegistrationChecker("yeoman.yo"));

		it("Check yoyo command is not registered", async () => await commandRegistrationFailChecker("yeoman.yoyo"));
	});
	
});