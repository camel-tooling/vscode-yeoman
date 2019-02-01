"use strict";

import * as vscode from "vscode";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import * as sinon from "sinon";
import * as assert from "assert";

const expect = chai.expect;
chai.use(sinonChai);

describe("vscode/commands", () => {
	let sandbox: sinon.SinonSandbox;
	let inputStub: sinon.SinonStub;

	before(() => {
		sandbox = sinon.createSandbox();
		inputStub = sandbox.stub(vscode.window, "showInputBox");
	});

	after(() => {
		sandbox.restore();
	});

	describe("Check commands are registered", () => {
		before(() => {
			inputStub.onFirstCall().returns("goonies");
		});

		after(() => {
			inputStub.reset();
		});

		const commandRegistrationChecker = async (commandName: string) => {
			try {
				await vscode.commands.executeCommand(commandName);
			} catch (error) {
				assert.fail(error);
			}
		};

		it("Check yeoman command is registered", () => commandRegistrationChecker("yeoman.yeoman"));

		it("Check yo command is registered", () => commandRegistrationChecker("yeoman.yo"));

	});

});
