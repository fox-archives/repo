import { module as bakeModule } from "./bake.ts";
import { module as basaltModule } from "./basalt.ts";
import { module as bashModule } from "./bash.ts";
import { module as denoModule } from "./deno.ts";
import { module as editorConfigModule } from "./editorconfig.ts";
import { module as gitModule } from "./git.ts";
import { module as glueModule } from "./glue.ts";
import { module as hookahModule } from "./hookah.ts";
import { module as licenseModule } from "./license.ts";
import { module as prettierModule } from "./prettier.ts";

export const foxLinterModules = [
	bakeModule,
	basaltModule,
	bashModule,
	denoModule,
	editorConfigModule,
	gitModule,
	hookahModule,
	glueModule,
	licenseModule,
	prettierModule,
];
