import bakeModule from "../linters/bake.ts";
import basaltModule from "../linters/basalt.ts";
import denoModule from "../linters/deno.ts";
import gitModule from "../linters/git.ts";
import glueModule from "../linters/glue.ts";
import licenseModule from "../linters/license.ts";
import prettierModule from "../linters/prettier.ts";

export const foxModules = [
	bakeModule,
	basaltModule,
	denoModule,
	gitModule,
	glueModule,
	licenseModule,
	prettierModule,
];
