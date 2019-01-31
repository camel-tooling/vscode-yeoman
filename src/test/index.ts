"use strict";

import * as testRunner from "vscode/lib/testrunner";

testRunner.configure({
	ui: "bdd",
	useColors: true,
	timeout: 100000,
	slow: 50000
});

module.exports = testRunner;