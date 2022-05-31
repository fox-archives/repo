import { fs } from "./deps.ts";

import * as util from "./util/util.ts";

export interface FixModule {
	name: string;
	description: string;
	init?: (opts?: util.Opts) => void;
	onFiles?: Array<{
		files: string[] | RegExp | ((arg0: string) => boolean);
		fn: (opts: util.Opts, entry: fs.WalkEntry) => void;
	}>;
}
