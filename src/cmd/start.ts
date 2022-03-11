/**
 * Dev command module
 *
 * @packageDocumentation
 */

import * as output from '../output/index';

import * as util from '../util/index';

import {default_params} from '../conf/defaults';

import {Params} from '../types';

import {merge_params} from './common';

// import * as docker from './docker';

import {valid_admin_repos} from '../types';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let start_params = default_params as Params;

export async function start(params:Partial<Params>)
		:Promise<void>{
	
	start_server(params);
	
	if(valid_admin_repos().includes(start_params.repo)){
		start_panel(params);
	}
	
}

export async function start_server(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	const urn_lib_pre = ` urn_log_prefix_type=true`;
	const urn_config_path = ` -c ${start_params.root}/uranio.config.js`;
	const cmd_server = `yarn uranio-webservice-${start_params.repo}${urn_lib_pre}${urn_config_path}`;
	util_instance.spawn.log(cmd_server, 'start', 'starting server');
	
}

export async function start_panel(params:Partial<Params>)
		:Promise<void>{
	
	_init_params(params);
	
	const urn_lib_pre = ` urn_log_prefix_type=true`;
	const urn_config_path = ` -c ${start_params.root}/uranio.config.js`;
	const cmd_server = `yarn uranio-panel-${start_params.repo}${urn_lib_pre}${urn_config_path}`;
	util_instance.spawn.log(cmd_server, 'start', 'starting panel');
	
}

function _init_params(params:Partial<Params>)
		:void{
	
	params.spin = false;
	
	start_params = merge_params(params);
	
	output_instance = output.create(start_params);
	
	util_instance = util.create(start_params, output_instance);
	
}


