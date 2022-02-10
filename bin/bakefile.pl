#!/usr/bin/env perl

use warnings;
use strict;
use File::Find;

# for example let location be tmp
my $location = q(.);

sub find_txt {
	my $f = $File::Find::name;

	if (!($f =~ /Bakefile[.]sh$/sxm)) {
		return;
	}

	open my $fh, '<:encoding(UTF-8)', $f
		or die "Could not open file '$f' $!";

	while (my $line = <$fh>) {

		if ($line =~ /^(?:function[ \t]*)?task.fmt[()]?/sxm) {
			print "$f:$.: Please use task.format instead of task.fmt";
		}
	}

	close $fh;

	return;
}

find({ wanted => \&find_txt, no_chdir => 1 }, $location);
