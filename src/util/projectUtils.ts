import { fs, toml } from "../deps.ts";
import * as util from "./util.ts";
import * as types from "../types.ts";

export async function determineEcosystem(
	dir: string | URL
): Promise<types.ProjectEcosystem> {
	const oldPwd = Deno.cwd();
	Deno.chdir(dir);

	const ecosystem = await (async () => {
		if (await util.pathExists("./package.json")) {
			return "nodejs";
		} else if (await util.pathExists("./go.mod")) {
			return "go";
		} else if (
			(await util.pathExists("./deno.json")) ||
			(await util.pathExists("./mod.ts"))
		) {
			return "deno";
		} else if (await util.pathExists("./cargo.toml")) {
			return "rust";
		} else if (await util.pathExists("./gradle.build")) {
			return "gradle";
		} else if (await util.hasPath("*.nimble")) {
			return "nim";
		} else if (await util.pathExists("./basalt.toml")) {
			return "basalt";
		} else {
			return "unknown";
		}
	})();

	Deno.chdir(oldPwd);

	return ecosystem;
}

export async function determineForm(
	foxConfig: types.FoxConfigProject,
	ecosystemType: types.ProjectEcosystem
): Promise<types.ProjectForm> {
	if (foxConfig.form) {
		return foxConfig.form;
	}

	switch (ecosystemType) {
		case "basalt": {
			const content = toml.parse(await Deno.readTextFile("./basalt.toml"));

			const type = (content as any)?.package?.type;

			if (type === "app") {
				return "app";
			} else if (type === "lib") {
				return "lib";
			}

			break;
		}
	}

	return "unknown";
}
