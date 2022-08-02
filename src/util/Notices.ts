import { fs, path, c, toml } from "../deps.ts";

export type Notice = {
	moduleId: string;
	name: string;
	description: string;
	context?: {
		file?: string;
		row?: string;
		column?: string;
	};

	fixFunction?: () => void;
};

const noticesList: Notice[] = [];

export class Notices {
	#moduleId: string;

	constructor(moduleId: string) {
		this.#moduleId = moduleId;
	}

	add(
		name: string,
		options: Pick<Notice, "description" | "context">,
		fixFunction?: () => void
	) {
		noticesList.push({
			moduleId: this.#moduleId,
			name,
			...options,
			fixFunction,
		});
	}

	static async fixAll() {
		for (const notice of noticesList) {
			if (notice.fixFunction) {
				await notice.fixFunction();
			}
		}
	}

	static printAll() {
		for (const notice of noticesList) {
			console.log(`${c.red(`${notice.moduleId}/${notice.name}:`)}
  -> ${notice.description}`);
		}
	}
}
