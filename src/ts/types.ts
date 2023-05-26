import { fs, z } from "./deps.ts";

/* -------------------- Command Line -------------------- */

export interface foxLintArgs {
	fix?: boolean;
}

/* ----------------------- Context ---------------------- */
export type VcsInfo =
	| {
			site: string;
			owner: string;
			repo: string;
	  }
	| undefined;

export type Context = {
	dir: string;
	git: VcsInfo; // TODO: rename
	ecosystem: ProjectEcosystem;
	form: ProjectForm;
	person: FoxConfigGlobal["person"];
	github_token: FoxStateGlobal["github_token"];
};

/* --------------- Fox Configuration File --------------- */

export type ProjectEcosystem =
	| "nodejs"
	| "golang"
	| "deno"
	| "rust"
	| "nim"
	| "basalt"
	| "gradle"
	| "unknown";
export const ProjectEcosystemSchema = z.union([
	z.literal("nodejs"),
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

export type ProjectFor = "me" | "anyone";
export type ProjectStatus =
	| "experimental"
	| "dogfooding"
	| "earlyaccess"
	| "maintained";

export type FoxConfigProject = {
	project?: {
		ecosystem?: ProjectEcosystem;
		form?: ProjectForm;
		for?: ProjectFor;
		status?: ProjectStatus;
	};
	discovery?: {
		categories?: [];
		tags?: [];
	};
};

export type FoxConfigGlobal = {
	person: {
		fullname: string;
		email: string;
		websiteURL: string;
	};
	defaults: {
		vcsOwner: string;
		vcsSite: string;
	};
};

export type FoxStateGlobal = {
	github_token: string;
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
		(opts: foxLintArgs, entry: fs.WalkEntry) => Promise<void>
	>;
	triggers?: {
		onInitial: (opts: foxLintArgs) => Promise<void>;
	};
};
