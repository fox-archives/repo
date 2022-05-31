import { fs, z } from "./deps.ts";

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

export const FoxConfigSchema = z.object({
	ecosystem: z
		.union([
			z.literal("nodejs"),
			z.literal("go"),
			z.literal("deno"),
			z.literal("rust"),
			z.literal("nim"),
			z.literal("basalt"),
			z.literal("gradle"),
		])
		.optional(),
	variant: z.literal("app").or(z.literal("lib")).optional(),
});

export type EcosystemType =
	| "nodejs"
	| "go"
	| "deno"
	| "rust"
	| "nim"
	| "basalt"
	| "gradle";

export type ProjectVariant = "app" | "lib";

export type FoxConfig = {
	ecosystem: EcosystemType;
	variant: ProjectVariant;
};
