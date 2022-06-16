import { flags, c, fs, path } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import * as project from "../util/project.ts";

export async function foxLint(args: flags.Args) {
	const ctx = await helper.getCtx();
	const foxConfig = await helper.getProjectFoxConfig();

	const ecosystem = await project.determineEcosystem(".");
	if (!ecosystem) {
		util.die("Failed to automatically calculate 'ecosystem'");
	}
	console.log(`Ecosystem: ${ecosystem}`);

	const form = await project.determineForm(foxConfig, ecosystem);
	if (!form) {
		util.die("Failed to automatically calculate 'form'");
	}
	console.log(`Form: ${form}`);

	await helper.performLint(ctx);
}
