import { fs } from "../deps.ts";

import * as util from "../util/util.ts";

export const name = "Prettier";
export const description = "Checks prettier configuration";
export const onFiles = [
	{
		files: [".shellcheckrc"],
		fn() {},
	},
];
