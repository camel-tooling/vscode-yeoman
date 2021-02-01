import Yeoman from "../yo/yo";
import { expect } from "chai";
import listGenerators from "../utils/list-generators";
import { window } from "vscode";

describe("List generators", () => {
	it("locally installed generators are available", async () => {
		const outChannel = window.createOutputChannel('Yeoman');
		const quickPicks = await listGenerators(new Yeoman({cwd: __dirname, outChannel}));
		// generator-generator should be visible as it is a dev dependency of this project
		expect(quickPicks.map(_ => _.label)).to.contain("generator");
	});
});
