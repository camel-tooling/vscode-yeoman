import Yeoman from "../yo/yo";
import { expect } from "chai";
import listGenerators from "../utils/list-generators";

describe("List generators", () => {
    it("locally installed generators are available", async () => {
        let quickPicks = await listGenerators(new Yeoman({cwd: __dirname}));
        // generator-generator should be visible as it is a dev dependency of this project
        expect(quickPicks.map(_ => _.label)).to.contain("generator");
    });

})
