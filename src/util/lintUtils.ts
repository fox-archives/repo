import { fs, path } from "../deps.ts";

import * as util from "./util.ts";
import * as types from "../types.ts";

// TODO: integrate with notices
export async function validateSchemaAgainst(
	schemaName: string,
	object: Record<string, unknown>
) {
	const dirname = path.dirname(new URL(import.meta.url).pathname);
	const schemaFile = path.join(dirname, `../schemas/${schemaName}.schema.json`);

	const schemaContent = await util.mustReadFile(schemaFile);
	await util.validateAjv(JSON.parse(schemaContent), object);
}

// TODO: better comparison output and integrate with linter
export function validateValuesAgainst(
	expectedObject: Record<string, unknown>,
	object: Record<string, unknown>
) {
	asserts.assertEquals(expectedObject, object);
}
