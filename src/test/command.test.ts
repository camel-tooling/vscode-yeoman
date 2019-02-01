"use strict";

import * as vscode from "vscode";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import * as sinon from "sinon";

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

	describe("Yeoman and Yo", () => {
		before(() => {
			inputStub.onFirstCall().returns("goonies");
		});

		after(() => {
			inputStub.reset();
		});

		it("works by entering yeoman or yo", () => {
			vscode.commands.executeCommand("yeoman.yeoman");
			vscode.commands.executeCommand("yeoman.yo");
		});
	});

});
