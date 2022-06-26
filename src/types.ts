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
	ecosystem?: ProjectEcosystem; // TODO: make types required
	form?: ProjectForm;
	for?: "me" | "anyone";
	status?: "experimental" | "dogfooding" | "earlyaccess" | "maintained";
};

export type FoxConfigGlobal = {
	person: {
		fullname: string;
		email: string;
		websiteURL: string;
	};
	github_token: string;
	defaults: {
		vcsOwner: string;
		vcsSite: string;
	};
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
		(
			opts: foxLintArgs,
			entry: fs.WalkEntry
		) => Promise<NoticeReturn[] | undefined>
	>;
	triggers?: {
		onInitial: (opts: foxLintArgs) => Promise<NoticeReturn[] | undefined>;
	};
};

export type NoticeReturn = Omit<Notice, "moduleId">;
export type Notice = {
	moduleId: string;
	name: string;
	description: string;
	file?: string;
	position?: {
		row?: number;
		column?: number;
	};
};
