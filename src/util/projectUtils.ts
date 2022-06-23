import { fs, toml } from "../deps.ts";
import * as util from "./util.ts";
import * as types from "../types.ts";

const enum EcosystemFiles {
	nodePackageJson = "./package.json",
	goMod = "./go.mod",
	denoJson = "./deno.json",
	denoModTs = "./mod.ts",
	cargoToml = "./cargo.toml",
	nimblePostfix = "./.nimble",
	gradleBuild = "./gradle.build",
	basaltToml = "./basalt.toml",
}

export async function determineEcosystem(
	dir: string | URL
): Promise<types.ProjectEcosystem> {
	const oldPwd = Deno.cwd();
	Deno.chdir(dir);

	const ecosystem = await (async () => {
		if (await util.pathExists(EcosystemFiles.nodePackageJson)) {
			return "nodejs";
		} else if (await util.pathExists(EcosystemFiles.goMod)) {
			return "go";
		} else if (
			(await util.pathExists(EcosystemFiles.denoJson)) ||
			(await util.pathExists(EcosystemFiles.denoModTs))
		) {
			return "deno";
		} else if (await util.pathExists(EcosystemFiles.cargoToml)) {
			return "rust";
		} else if (await util.pathExists(EcosystemFiles.gradleBuild)) {
			return "gradle";
		} else if (await util.hasPath("*.nimble")) {
			return "nim";
		} else if (await util.pathExists(EcosystemFiles.basaltToml)) {
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
			const content = toml.parse(
				await Deno.readTextFile(EcosystemFiles.basaltToml)
			);

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
