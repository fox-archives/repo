use clap::{CommandFactory, Parser};
use config::parse_local_config;

mod cli;
mod commands;
mod config;
mod repo;
mod util;

use cli::{Cli, Cmd, DeployCmd, InternalCmd};
use commands::{RunDeploy, RunGui, RunInternal, RunTask};
use util::get_template_info;

fn main() {
	let cli = Cli::parse();
	match &cli.cmd {
		Cmd::Task {
			list,
			ecosystem,
			task_name,
		} => {
			let run_task = RunTask::new();

			run_task.run(ecosystem.clone(), task_name.clone());
		}
		Cmd::Deploy { cmd } => {
			let run_deploy = RunDeploy::new();

			match cmd {
				DeployCmd::Now {} => {
					// Move NOW stuff to 'add' and make its behavior
					// when not specifying directly
					run_deploy.d(&mut Cli::command()).unwrap();
				}
				DeployCmd::Add {} => {
					// ADD directories corresponding to a binary (and label them). Somehow also incorporate PATH
					run_deploy.add()
				}
				DeployCmd::Set {} => {
					// Set which of the entries to use
					run_deploy.set()
				}
				DeployCmd::Info { bin } => {
					run_deploy.info(bin.clone()).unwrap();
				}
				DeployCmd::List {} => {
					run_deploy.list().unwrap();
				}
			}
		}
		Cmd::Gui {} => {
			let run_gui = RunGui::new();

			run_gui.run();
		}
		Cmd::Internal { cmd } => {
			let run_internal = RunInternal::new();

			match cmd {
				InternalCmd::Doctor {} => {
					parse_local_config().unwrap();
				}
				InternalCmd::Completion { shell } => {
					run_internal.run(shell.clone(), &mut Cli::command());
				}
				InternalCmd::GenerateReadme {} => {
					run_internal.generate_readme().unwrap();
				}
			};
		}
	}
}
