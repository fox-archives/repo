import { flags, c, fs, path, conversion } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";

export async function foxxoClean() {
	await Deno.remove("a.out");

	for await (const file of fs.expandGlob("*.log")) {
		await Deno.remove(file.path);
	}
}
