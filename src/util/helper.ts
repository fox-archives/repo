import { fs, path } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "./util.ts";

export async function cdToProjectRoot() {
	const cdUntilFileOrDir = async (
		dir: string,
		name: string
	): Promise<string | undefined> => {
		let potentialFile;
		do {
			potentialFile = path.join(dir, name);
			if (await fs.exists(potentialFile)) {
				return dir;
			}
			dir = path.dirname(dir);
		} while (dir !== "/");
	};

	for (const rel of ["fox.json", ".git"]) {
		const dir = await cdUntilFileOrDir(Deno.cwd(), rel);
		if (dir) {
			return dir;
		}
	}
}

export async function getContextInfo() {
	const result = await util.exec({
		cmd: ["git", "remote", "get-url", "origin"],
	});
	const repo = result.stdout.split("/").at(-1);
	if (!repo) {
		util.die("Could not find repo"); // FIXME
	}

	// FIXME
	const foxConfig = path.join(
		Deno.env.get("HOME") || "",
		".config",
		"fox",
		"config.json"
	);
	const json = JSON.parse(await Deno.readTextFile(foxConfig));
	if (!json.github_token) {
		util.die("Faield to find github token");
	}
	return {
		repo,
		github_token: json.github_token,
	};
}
