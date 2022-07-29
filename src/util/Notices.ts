import { fs, path, c, toml } from "../deps.ts";

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

const noticesList: Notice[] = [];

export class Notices {
	#moduleId: string;

	constructor(moduleId: string) {
		this.#moduleId = moduleId;
	}

	add(name: string, options: Omit<Notice, "moduleId" | "name">) {
		noticesList.push({
			moduleId: this.#moduleId,
			name,
			...options,
		});
	}

	static print() {
		for (const notice of noticesList) {
			console.log(`${c.red(`${notice.moduleId}/${notice.name}:`)}
  -> ${notice.description}`);
		}
	}
}
