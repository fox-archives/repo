use std::{env, fs, path::Path};

use anyhow::Result;

use crate::util;

pub struct RunDeploy;

impl RunDeploy {
	pub fn new() -> Self {
		Self
	}

	pub fn d(&self, cmd: &mut clap::Command) -> Result<()> {
		// TODO: create bins that exec to something in repo

		// Copy bins
		let current_dir = env::current_dir().expect("Failed to get current directory");
		let dirname = current_dir.file_name().unwrap();
		let dirname = dirname.to_str().unwrap();

		let bin_dir = util::get_bin_dir().unwrap();

		fs::copy(
			Path::new("./target/debug").join(dirname),
			bin_dir.join(dirname),
		)?;

		// Create Bash completions

		Ok(())
	}

	pub fn add(&self) {}

	pub fn set(&self) {}

	pub fn info(&self, bin_name: String) -> Result<()> {
		let bin_dir = util::get_bin_dir()?;

		let bin_file = bin_dir.join(bin_name);
		if bin_file.is_symlink() {
			let stat = fs::read_link(bin_file)?;
			println!("symlink: {}", stat.display());
			println!("exists?: {}", stat.exists());
		} else {
			println!("Not symlink: {}", bin_file.display());
		}

		Ok(())
	}

	pub fn list(&self) -> Result<()> {
		let bin_dir = util::get_bin_dir()?;

		println!("Binaries:");
		for entry in bin_dir.read_dir()? {
			let entry = entry?;

			let file = entry.file_name();
			println!("- {}", file.to_string_lossy());
		}
		println!("Done");

		Ok(())
	}
}
