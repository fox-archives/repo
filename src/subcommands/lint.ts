import { c, fs, path } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import * as projectUtils from "../util/projectUtils.ts";

export async function foxLint(flags: { fix?: boolean }) {
	const ctx = await helper.getContext();
	const foxConfig = await helper.getFoxConfigLocal();

	const ecosystem = await projectUtils.determineEcosystem(".");
	if (!ecosystem) {
		util.die("Failed to automatically calculate 'ecosystem'");
	}
	console.log(`Ecosystem: ${ecosystem}`);

	const form = await projectUtils.determineForm(foxConfig, ecosystem);
	if (!form) {
		util.die("Failed to automatically calculate 'form'");
	}
	console.log(`Form: ${form}`);

	await helper.performLint(ctx);
}
