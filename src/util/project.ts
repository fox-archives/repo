import { fs, toml, conversion } from "../deps.ts";
import * as util from "./util.ts";
import { ProjectForm, ProjectEcosystem, FoxConfig } from "../types.ts";

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
): Promise<ProjectEcosystem | undefined> {
	const oldPwd = Deno.cwd();
	Deno.chdir(dir);

	const ecosystem = await (async () => {
		if (await fs.exists(EcosystemFiles.nodePackageJson)) {
			return "nodejs";
		} else if (await fs.exists(EcosystemFiles.goMod)) {
			return "go";
		} else if (
			(await fs.exists(EcosystemFiles.denoJson)) ||
			(await fs.exists(EcosystemFiles.denoModTs))
		) {
			return "deno";
		} else if (await fs.exists(EcosystemFiles.cargoToml)) {
			return "rust";
		} else if (await fs.exists(EcosystemFiles.gradleBuild)) {
			return "gradle";
		} else if (await util.hasPath("*.nimble")) {
			return "nim";
		} else if (await fs.exists(EcosystemFiles.basaltToml)) {
			return "basalt";
		}
	})();

	Deno.chdir(oldPwd);

	return ecosystem;
}

export async function determineForm(
	foxConfig: FoxConfig,
	ecosystemType: ProjectEcosystem
): Promise<ProjectForm | undefined> {
	if (foxConfig.form) {
		return foxConfig.form;
	}

	switch (ecosystemType) {
		case "basalt": {
			const content = toml.parse(
				await Deno.readTextFile(EcosystemFiles.basaltToml)
			);

			if (content["type"] === "app") {
				return "app";
			} else if (content["type"] === "lib") {
				return "lib";
			}

			break;
		}
	}
}

export async function getGitInfo(): Promise<{
	repoName: string;
}> {
	const p = await Deno.run({
		cmd: ["git", "remote", "get-url", "origin"],
		stdout: "piped",
	});
	const status = await p.status();
	if (!status.success) {
		Deno.exit(1);
	}
	const content = new TextDecoder().decode(await conversion.readAll(p.stdout));
	const repoName = content.split("/").at(-1);
	if (!repoName) {
		util.die("Failed to determine repoName");
	}
	return {
		repoName,
	};
}
