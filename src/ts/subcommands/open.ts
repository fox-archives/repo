import { flags, c, fs, path, conversion } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";

export async function foxxoOpen() {
	const home = Deno.env.get("HOME");
	if (!home) {
		throw new Error("home is not defined");
	}
	const rootDir = path.join(home, "Docs", "Programming", "repos");

	const projects1 = await util.getProjects(rootDir, {
		ignored: ["GGroups", "Groups"],
	});
	const projects2 = await util.getProjects(path.join(rootDir, "GGroups"));
	const projects3 = await util.getProjects(path.join(rootDir, "Groups"));

	const projects = ([] as string[]).concat(projects1, projects2, projects3);

	const p = Deno.run({
		cmd: ["fzf"],
		stdin: "inherit",
		stdout: "piped",
		stderr: "piped",
	});
	// p.stdin.write(new TextEncoder().encode(projects.join("\n")));

	// const [status, stdout, stderr] = await Promise.all([
	// 	p.status(),
	// 	p.output(),
	// 	p.stderrOutput(),
	// ]);
	// p.close();

	// console.log("got", stdout);
}
