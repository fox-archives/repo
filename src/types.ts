import { fs, z } from "./deps.ts";

/* -------------------- Command Line -------------------- */

export interface foxLintArgs {
	fix?: boolean;
}

/* ----------------------- Context ---------------------- */
export type GitRemoteInfo =
	| {
			site: string;
			owner: string;
			repo: string;
	  }
	| undefined;

export type Context = {
	dir: string;
	git: GitRemoteInfo;
	ecosystem: ProjectEcosystem;
	form: ProjectForm;
	person: FoxConfigGlobal["person"];
	github_token: FoxConfigGlobal["github_token"];
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
	| "gradle"
	| "unknown";
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
	z.literal("unknown"),
]);

export type ProjectForm = "app" | "lib" | "unknown";
export const ProjectFormSchema = z.union([
	z.literal("app"),
	z.literal("lib"),
	z.literal("unknown"),
]);

export type FoxConfigProject = {
	ecosystem?: ProjectEcosystem;
	form?: ProjectForm;
	status?: "dev" | "alpha" | "beta" | "release";
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
		status: {
			type: "string",
			enum: ["dev", "alpha", "beta", "release"],
		},
	},
};

export type FoxConfigGlobal = {
	person: {
		fullname: string;
		email: string;
		websiteURL: string;
	};
	github_token: string;
};
export const FoxConfigGlobalSchema = {
	type: "object",
	additionalProperties: false,
	required: ["person", "github_token"],
	properties: {
		person: {
			type: "object",
			additionalProperties: false,
			required: ["fullname", "email", "websiteURL"],
			properties: {
				fullname: {
					type: "string",
				},
				email: {
					type: "string",
				},
				websiteURL: {
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
	id: string;
	name: string;
	activateOn: {
		ecosystem: Omit<ProjectEcosystem, "unknown"> | "any";
		form: Omit<ProjectForm, "unknown"> | "any";
	};
	match?: Map<
		string,
		(opts: foxLintArgs, entry: fs.WalkEntry, notices: Notice[]) => void
	>;
	triggers?: {
		onInitial: (opts: foxLintArgs, notices: Notice[]) => void;
	};
};

export type Notice = {
	name: string;
	description: string;
	position?: {
		row?: number;
		column?: number;
	};
};
