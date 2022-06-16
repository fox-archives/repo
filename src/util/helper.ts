import { fs, path, Ajv } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "./util.ts";
import * as projectUtils from "./projectUtils.ts";
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

export async function getContext() {
	await cdToProjectRoot();

	const result = await util.exec({
		cmd: ["git", "remote", "get-url", "origin"],
	});
	const repo = result.stdout.split("/").at(-1);
	if (!repo) {
		util.die("Could not find repo"); // FIXME
	}

	const foxConfigGlobal = await getGlobalFoxConfig();
	const foxConfig = await getProjectFoxConfig();

	const dir = Deno.cwd(); // TODO
	const ecosystem =
		(await projectUtils.determineEcosystem(dir)) ||
		util.die("Failed to determine ecosystem");

	const ctx: types.Context = {
		ecosystem,
		form:
			(await projectUtils.determineForm(foxConfig, ecosystem)) ||
			util.die("Failed to determine form"),
		dir,
		repo: repo,
		owner: foxConfigGlobal.owner,
		github_token: foxConfigGlobal.github_token,
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
export async function incrementVersion(oldVersion: string): Promise<string> {
	console.log(`Old version: ${oldVersion}`);
	const newVersion = await prompt("New version?");
	console.log(`You chose: ${newVersion}`);

	if (!newVersion) {
		// FIXME
		console.error("Failed to get input. Exiting");
		Deno.exit(1);
	}

	return newVersion;
}
