import * as bake from "./bake.ts";
import * as basalt from "./basalt.ts";
import * as bash from "./bash.ts";
import * as deno from "./deno.ts";
import * as editorconfig from "./editorconfig.ts";
import * as git from "./git.ts";
import * as license from "./license.ts";
import * as prettier from "./prettier.ts";
import * as shellcheck from "./shellcheck.ts";

import { FixModule } from "../types.ts";

export const ModuleObjects: Record<string, FixModule> = {
	bake,
	basalt,
	bash,
	deno,
	editorconfig,
	git,
	license,
	prettier,
	shellcheck,
};
