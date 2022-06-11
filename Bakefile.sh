# shellcheck shell=bash

task.run() {
	deno run --allow-read --allow-write --allow-net ./src/main.ts "$@"
}

task.bundle() {
	mkdir -p ./output
	deno bundle ./src/main.ts ./output/bundle.js
}
