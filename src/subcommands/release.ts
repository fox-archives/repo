import { flags, c, fs, path } from "../deps.ts";

import NodeJSReleaser from "../releasers/nodejs.ts";
import * as types from "../types.ts";
import * as util from "../util/util.ts";

export async function foxRelease(ctx: types.Context, args: flags.Args) {
	await NodeJSReleaser.release();
}
