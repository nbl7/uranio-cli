/**
 * Process module
 *
 * @packageDocumentation
 */

// import fs from 'fs';

// import * as cp from 'child_process';

import {Arguments} from './types';

import * as util from './util/';

import {help, init, transpose, dev, test} from './cmd/';

import {conf} from './conf/defaults';

import * as output from './output/';

import * as common from './cmd/common';

export function urn_process(args:Arguments)
		:void{
	
	_set_conf(args);
	
	process.chdir(conf.root);
	
	common.init_log();
	
	_log_arguments(args);
	
	_switch_command(args);
	
	// process.exit(1);
	
}

function _log_arguments(args:Arguments){
	output.verbose_log('args', JSON.stringify(args));
}

function _set_conf(args:Arguments){
	
	const verbose = args.v || args.verbose;
	
	if(verbose == true){
		conf.verbose = true;
	}
	if(typeof args.noverbose === 'boolean' && !!args.noverbose !== !conf.verbose){
		conf.verbose = !args.noverbose;
	}
	
	const hide = args.n || args.hide;
	
	if(hide == true){
		conf.hide = true;
	}
	if(typeof args.nohide === 'boolean' && !!args.nohide !== !conf.hide){
		conf.hide = !args.nohide;
	}
	
	const blank = args.b || args.blank;
	
	if(blank == true){
		conf.blank = true;
	}
	if(typeof args.noblank === 'boolean' && !!args.noblank !== !conf.blank){
		conf.blank = !args.noblank;
	}
	
	const fullwidth = args.f || args.fullwidth;
	
	if(fullwidth == true){
		conf.fullwidth = true;
	}
	if(typeof args.nofullwidth === 'boolean' && !!args.nofullwidth !== !conf.fullwidth){
		conf.fullwidth = !args.nofullwidth;
	}
	
	const prefix = args.p || args.prefix;
	
	if(typeof prefix === 'string' && prefix !== ''){
		conf.prefix = prefix;
	}
	
	const pacman = args.pacman;
	
	if(typeof pacman === 'string' && pacman != ''){
		util.set_pacman(pacman);
	}
	
	const repo = args.r || args.repo;
	
	if(typeof repo === 'string' && repo != ''){
		util.set_repo(repo);
	}
	
	let root = args.s || args.root;
	
	if(typeof root === 'string' && root !== ''){
		root = util.relative_to_absolute_path(root);
		if(!util.check_folder(root)){
			let end_log = '';
			end_log += `Invalid project root.`;
			output.wrong_end_log(end_log);
			process.exit(1);
		}else{
			conf.root = root;
			output.done_verbose_log('root', `$URNROOT$Project root set to [${conf.root}]`);
		}
	}else{
		util.auto_set_project_root();
	}
	
}

function _switch_command(args:Arguments){
	
	let cmd = args._[0] || '';
	
	if (args.version || args.V) {
		cmd = 'version';
	}
	
	if (args.help || args.h) {
		cmd = 'help';
	}
	
	switch(cmd){
		case '':
		case 'version':{
			output.stop_loading();
			console.log('v0.0.1');
			break;
		}
		case 'init':{
			init.command(args);
			break;
		}
		case 'transpose':{
			transpose.command();
			break;
		}
		case 'dev':{
			dev.command();
			break;
		}
		case 'help':{
			help.command();
			break;
		}
		case 'test':{
			test.command();
			break;
		}
		default:{
			console.log('Command not found.');
		}
	}
}

