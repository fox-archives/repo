#!/usr/bin/env bash

task.run() {
	local file="$1"
	bake.assert_nonempty 'file'

	perl "./bin/$file.pl"
}

task.lint() {
	perlcritic .
}

task.fmt() {
	perltidy ./**/*.pl

	for f in ./**/*.pl.tdy; do
		mv "$f" "${f%.tdy}"
	done
}
