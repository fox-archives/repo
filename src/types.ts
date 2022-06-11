import { fs, z } from "./deps.ts";

import * as util from "./util/util.ts";

export interface FixModule {
	id: string;
	name: string;
	description: string;
	init?: (opts?: ModuleOptions) => void;
	onFiles?: Array<{
		files: string[] | RegExp | ((arg0: string) => boolean);
		fn: (opts: ModuleOptions, entry: fs.WalkEntry) => void;
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

export type ProjectEcosystem =
	| "nodejs"
	| "go"
	| "deno"
	| "rust"
	| "nim"
	| "basalt"
	| "gradle";

export type ProjectForm = "app" | "lib";

export type FoxConfig = {
	ecosystem?: ProjectEcosystem;
	form?: ProjectForm;
};

export type FoxModule = {
	name: string;
	activateOn: {
		ecosystem: string;
		form: string;
	};
	match?: Map<string, (opts: ModuleOptions, entry: fs.WalkEntry) => void>;
	triggers?: {
		onInitial: (opts: ModuleOptions) => void;
	};
};

export type ModuleOptions = {
	fix?: "no" | "prompt" | "yes";
};

export type Context = {
	dir: string;
	owner: string | null;
	repo: string | null;
	github_token: string;
};
