# shellcheck shell=bash

task.watch() {
	find . | entr -c -dd ./bake bundle
}

task.build() {
	mkdir -p ./output
	deno bundle --unstable ./src/main.ts ./output/bundle.js
}
