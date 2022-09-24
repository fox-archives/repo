import { flags, c, fs, path } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import NodeJSReleaser from "../releasers/nodejs.ts";

export async function foxxoRelease() {
	const ctx = await helper.getContext();

	await NodeJSReleaser.release();
}
