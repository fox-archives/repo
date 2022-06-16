import { fs, z } from "./deps.ts";

/* ----------------------- Context ---------------------- */

export type Context = {
	dir: string;
	ecosystem: ProjectEcosystem;
	form: ProjectForm;
	owner: {
		username: string;
		fullname: string;
		email: string;
		website: string;
	};
	repo: string;
	github_token: string;
};

/* --------------- Fox Configuration File --------------- */

export type ProjectEcosystem =
	| "node"
	| "nodejs"
	| "go"
	| "golang"
	| "deno"
	| "rust"
	| "nim"
	| "basalt"
	| "gradle";
export const ProjectEcosystemSchema = z.union([
	z.literal("node"),
	z.literal("nodejs"),
	z.literal("go"),
	z.literal("golang"),
	z.literal("deno"),
	z.literal("rust"),
	z.literal("nim"),
	z.literal("basalt"),
	z.literal("gradle"),
]);

export type ProjectForm = "app" | "lib";
export const ProjectFormSchema = z.union([z.literal("app"), z.literal("lib")]);

export type FoxConfigProject = {
	ecosystem?: ProjectEcosystem;
	form?: ProjectForm;
};
export const FoxConfigProjectSchema = {
	type: "object",
	additionalProperties: false,
	properties: {
		ecosystem: {
			type: "string",
		},
		form: {
			type: "string",
		},
	},
};

export type FoxConfigGlobal = {
	owner: {
		username: string;
		fullname: string;
		email: string;
		website: string;
	};
	github_token: string;
};
export const FoxConfigGlobalSchema = {
	type: "object",
	additionalProperties: false,
	required: ["owner", "github_token"],
	properties: {
		owner: {
			type: "object",
			additionalProperties: false,
			required: ["username", "fullname", "email", "website"],
			properties: {
				username: {
					type: "string",
				},
				fullname: {
					type: "string",
				},
				email: {
					type: "string",
				},
				website: {
					type: "string",
				},
			},
		},
		github_token: {
			type: "string",
		},
	},
};

/* ------------------ Fox Linter Module ----------------- */

export type FoxModule = {
	name: string;
	activateOn: {
		ecosystem: string;
		form: string;
	};
	match?: Map<string, (opts: FoxModuleOptions, entry: fs.WalkEntry) => void>;
	triggers?: {
		onInitial: (opts: FoxModuleOptions) => void;
	};
};

export type FoxModuleOptions = {
	fix?: "no" | "prompt" | "yes";
};

export type LintRule = {
	name: string;
	description: string;
};
