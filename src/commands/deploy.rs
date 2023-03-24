use std::{env, fs, path::Path};

use directories::BaseDirs;

pub struct RunDeploy;

impl RunDeploy {
	pub fn new() -> Self {
		Self
	}

	pub fn d(&self, cmd: &mut clap::Command) {
		// TODO: create bins that exec to something in repo

		// Copy bins
		let current_dir = env::current_dir().unwrap();
		let dirname = current_dir.file_name().unwrap();
		let dirname = dirname.to_str().unwrap();

		let target = Path::new(BaseDirs::new().unwrap().home_dir()).join(".local/state/repomgr/bin");
		fs::create_dir_all(&target).unwrap();
		fs::copy(
			Path::new("./target/debug").join(dirname),
			target.join(dirname),
		)
		.unwrap();

		// Create Bash completions
	}
}
