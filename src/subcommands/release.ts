import { flags, c, fs, path } from "../deps.ts";

import NodeJSReleaser from "../releasers/nodejs.ts";
import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";

export async function foxRelease(args: flags.Args) {
	const ctx = await helper.getCtx();

	await NodeJSReleaser.release();
}
