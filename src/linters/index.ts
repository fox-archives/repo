import bakeModule from "../linters/bake.ts";
import basaltModule from "../linters/basalt.ts";
import denoModule from "../linters/deno.ts";
import editorConfigModule from "./editorconfig.ts";
import gitModule from "../linters/git.ts";
import glueModule from "../linters/glue.ts";
import licenseModule from "../linters/license.ts";
import prettierModule from "../linters/prettier.ts";

export const foxLinterModules = [
	bakeModule,
	basaltModule,
	denoModule,
	editorConfigModule,
	gitModule,
	glueModule,
	licenseModule,
	prettierModule,
];
