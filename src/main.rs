use std::process::exit;

use clap::{CommandFactory, Parser};
use config::parse_local_config;
use directories::BaseDirs;

mod cli;
mod commands;
mod config;
mod util;

use cli::{Cli, Cmd, InternalCmd, TemplateCmd};
use commands::{RunDeploy, RunInternal, RunTask, RunTemplate};
use util::get_template_info;

fn main() {
	let cli = Cli::parse();
	match &cli.cmd {
		Cmd::Template { cmd } => {
			let run_template = RunTemplate::new();

			match &cmd {
				TemplateCmd::Use {
					template_name,
					target_dirname,
					watch,
				} => {
					let template = get_template_info(template_name.clone(), target_dirname.clone());

					run_template.command_use(template, *watch);
				}
				TemplateCmd::New { template_name } => {
					run_template.command_new(template_name.clone());
				}
				TemplateCmd::List {} => {
					run_template.list();
				}
			};
		}
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

			run_deploy.d(&mut Cli::command());
		}
		Cmd::Internal { cmd } => {
			let run_internal = RunInternal::new();

			match cmd {
				InternalCmd::Doctor {} => {
					parse_local_config();
				}
				InternalCmd::Completion { shell } => {
					run_internal.run(shell.clone(), &mut Cli::command());
				}
				InternalCmd::GenerateReadme {} => {
					run_internal.generate_readme();
				}
			};
		}
	}
}
