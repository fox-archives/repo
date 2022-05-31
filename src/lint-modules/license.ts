import { fs } from "../deps.ts";
import { toml } from "../deps.ts";

import * as util from "../util/util.ts";

// TODO: 'license' file should not be lowercase
// TODO: license should exit
// TODO: license should be one of []

export const name = "License";
export const description = "Checks for license files";
export const onFiles = [];
