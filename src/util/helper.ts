import { fs, path, Ajv } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "./util.ts";
import { foxLinterModules } from "../linters/index.ts";

export async function performLint(ctx: types.Context) {
	const moduleList = [];
	for (const module of foxLinterModules as types.FoxModule[]) {
		if (
			(module.activateOn?.ecosystem === "ALL" ||
				module.activateOn?.ecosystem === ctx.ecosystem) &&
			(module.activateOn?.form === "ALL" ||
				module.activateOn?.form === ctx.form)
		) {
			moduleList.push(module);
		}
	}

	const foxOptions: types.FoxModuleOptions = {};
	for (const module of moduleList) {
		if (module.triggers?.onInitial) {
			console.log(`Executing: ${module.name}::onInitial()`);
			await module.triggers.onInitial(foxOptions);
		}
	}
	// FIXME: use path.joinGlobs to autofilter
	for await (const entry of fs.walk(ctx.dir, {
		skip: [
			/(?:bower_components|node_modules|jspm_packages|web_modules|.next|.nuxt|.yarn|out|dist|.cache|.hidden|vendor|third_party)/g,
		],
	})) {
		for (const module of moduleList) {
			if (!module.match) continue;

			for (const [glob, fn] of module.match) {
				if (entry.path.match(path.globToRegExp(glob))) {
					console.log(`Executing: ${module.name}::${glob}`);
					await fn(foxOptions, entry);
				}
			}
		}
	}
}

export async function getCtx() {
	await cdToProjectRoot();

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
	const info = {
		repo,
		github_token: json.github_token,
	};

	const ctx: types.Context = {
		ecosystem: "deno",
		form: "lib",
		dir: Deno.cwd(),
		owner: json.owner as types.Context["owner"],
		repo: info.repo,
		github_token: info.github_token,
	};
	return ctx;
}

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

	util.die("Expected fox.json or git repository"); // FIXME
}

export async function getProjectFoxConfig(): Promise<types.FoxConfigProject> {
	const json = await util.readConfig(".", "fox");
	return util.validateAjv<types.FoxConfigProject>(
		types.FoxConfigProjectSchema,
		json
	);
}

export async function getGlobalFoxConfig(): Promise<types.FoxConfigGlobal> {
	// FIXME: Throw expressions once landed or xdg library
	const foxConfigDir = path.join(
		Deno.env.get("XDG_CONFIG_HOME") ||
			path.join(Deno.env.get("HOME") || "/WINDOWS_NOT_SUPPORTED", ".config"),
		"fox"
	);

	const json = await util.readConfig(foxConfigDir, "config");
	return util.validateAjv<types.FoxConfigGlobal>(
		types.FoxConfigGlobalSchema,
		json
	);
}
