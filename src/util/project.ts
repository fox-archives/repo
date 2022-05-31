import { fs, toml } from "../deps.ts";
import * as util from "./util.ts";
import { ProjectVariant, EcosystemType, FoxConfig } from "../types.ts";

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

export async function determineEcosystemType(
	dir: string | URL
): Promise<EcosystemType> {
	const oldPwd = Deno.cwd();
	Deno.chdir(dir);

	const isNimble = async () =>
		(await util.arrayFromAsync(Deno.readDir("."))).some(
			(item) => item.isFile && item.name.endsWith(EcosystemFiles.nimblePostfix)
		);

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
	} else if (await isNimble()) {
		return "nim";
	} else if (await fs.exists(EcosystemFiles.basaltToml)) {
		return "basalt";
	} else {
		util.die("ecosystemType could not be determined");
	}

	Deno.chdir(oldPwd);
}

export async function determineProjectVariant(
	foxConfig: FoxConfig,
	ecosystemType: EcosystemType
): Promise<ProjectVariant> {
	switch (ecosystemType) {
		case "basalt": {
			const content = toml.parse(
				await Deno.readTextFile(EcosystemFiles.basaltToml)
			);

			if (content["type"] === "app") {
				return "app";
			} else if (content["type"] === "lib") {
				return "lib";
			} else {
				util.die(
					`projectType could not be determined from ecosystem: ${ecosystemType}`
				);
			}
			break;
		}
		case "deno": {
			return foxConfig.variant;
		}
		default: {
			const content = await Deno.readTextFile("./fox.json");

			util.die(`projectType could not be determined from ecosystem`);
		}
	}
}
