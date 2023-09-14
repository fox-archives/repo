use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
pub struct Cli {
	#[command(subcommand)]
	pub cmd: Cmd,
}

#[derive(Subcommand, Debug)]
pub enum Cmd {
	Task {
		#[arg(long, default_value_t = false)]
		list: bool,

		#[arg(long, short)]
		ecosystem: String,

		task_name: Option<String>,
	},
	Deploy {
		#[command(subcommand)]
		cmd: DeployCmd,
	},
	Gui {},
	Internal {
		#[command(subcommand)]
		cmd: InternalCmd,
	},
}

#[derive(Subcommand, Debug)]
pub enum DeployCmd {
	Now,
	Add {},
	Set {},
	Info { bin: String },
	List,
}

#[derive(Subcommand, Debug)]
pub enum InternalCmd {
	Doctor,
	Completion { shell: String },
	GenerateReadme,
}
