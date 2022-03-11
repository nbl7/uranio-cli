/**
 * Transpose command module
 *
 * @packageDocumentation
 */

import path from 'path';

import * as esbuild from 'esbuild';

import * as recast from 'recast';

import {
	Params,
	valid_admin_repos,
	valid_deploy_repos
} from '../types';

import {default_params} from '../conf/defaults';

import * as output from '../output/index';

import * as util from '../util/index';

import {merge_params} from './common';

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let transpose_params = default_params as Params;

export async function transpose(params:Partial<Params>, included=false)
		:Promise<void>{
	
	_init_tranpose(params);
	
	try{
		
		await _transpose_all(included);
		
	}catch(ex){
		
		const err = ex as Error;
		if(included){
			output_instance.error_log(err.toString());
			// if(err.stack){
			//   output_instance.error_log(err.stack.toString());
			// }
			output_instance.error_log(err.message);
		}else{
			throw ex;
		}
		
	}
	
}

export async function transpose_one(full_path:string, params:Partial<Params>, included=false)
		:Promise<void>{
	
	_init_tranpose(params);
	
	if(util_instance.fs.is_directory(full_path)){
		
		await _transpose_folder(full_path, included);
		
	}else{
		
		await _transpose_file(full_path, included);
		
	}
}

export async function transpose_unlink_dir(full_path:string, params:Partial<Params>, included=false)
		:Promise<void>{
	
	_init_tranpose(params);
	
	_validate_path(full_path);
	
	await _unlink_dir(full_path);
	
	if(included){
		output_instance.done_log(`Transpose unlink dir completed.`);
	}else{
		output_instance.end_log(`Transpose unlink dir completed.`);
	}
}

export async function transpose_unlink_file(full_path:string, params:Partial<Params>, included=false)
		:Promise<void>{
	
	_init_tranpose(params);
	
	_validate_path(full_path);
	
	await _unlink_file(full_path);
	
	if(included){
		output_instance.done_log(`Transpose unlink file completed.`);
	}else{
		output_instance.end_log(`Transpose unlink file completed.`);
	}
}

function _init_tranpose(params:Partial<Params>){
	
	transpose_params = merge_params(params);
	
	output_instance = output.create(transpose_params);
	
	util_instance = util.create(transpose_params, output_instance);
	
}

async function _transpose_all(included=false){
	
	await _transpose_folder(path.join(transpose_params.root, 'src'), true);
	
	if(included){
		output_instance.done_log(`Transpose completed.`);
	}else{
		output_instance.end_log(`Transpose completed.`);
	}
	
}

async function _transpose_file(file_path:string, included=false):Promise<void>{
	
	output_instance.debug_log(`Transposing [${file_path}]...`);
	
	_validate_exists_path(file_path);
	
	const src_path = `${transpose_params.root}/src`;
	
	const atoms_src_dir = `${src_path}/atoms`;
	const server_src_dir = `${src_path}/server`;
	const admin_src_dir = `${src_path}/admin`;
	
	if(file_path.includes(atoms_src_dir)){
		
		_transpose_atom_dir_file(file_path);
		
	}else if(
		valid_deploy_repos().includes(transpose_params.repo)
		&& file_path.includes(server_src_dir)
	){
		
		_transpose_server_dir_file(file_path);
		
	}else if(
		valid_admin_repos().includes(transpose_params.repo)
		&& file_path.includes(admin_src_dir)
	){
		
		_transpose_admin_dir_file(file_path);
		
	}
	
	if(!included){
		output_instance.done_log(`Transpose file completed. [${file_path}]`);
	}
	
}

function _validate_exists_path(full_path:string){
	
	_validate_path(full_path);
	
	if(!full_path || !util_instance.fs.exists(full_path)){
		let err_msg = '';
		err_msg += `Invalid file path [${full_path}].`;
		output_instance.error_log(err_msg, 'trsp');
		return;
	}
	
}

function _validate_path(full_path:string){
	
	if(typeof full_path !== 'string' || full_path === ''){
		output_instance.error_log('Invalid path.', 'trsp');
		process.exit(1);
	}
		
	const basename = path.basename(full_path);
	const extension = path.extname(basename);
	
	if(basename.match(/^\.git/) !== null){
		return;
	}
	
	const not_valid_extensions = ['.swp', '.swo'];
	if(not_valid_extensions.includes(extension)){
		return;
	}
	
	const src_path = `${transpose_params.root}/src`;
	
	if(!full_path.includes(src_path)){
		let err_msg = '';
		err_msg += `Invalid file path [${full_path}].`;
		err_msg += ` File must be in [${transpose_params.root}/src/].`;
		output_instance.error_log(err_msg, 'trsp');
		return;
	}
	
}

async function _unlink_dir(full_path:string){
	
	const src_path = `${transpose_params.root}/src`;
	
	const atoms_src_dir = `${src_path}/atoms`;
	const server_src_dir = `${src_path}/server`;
	const admin_src_dir = `${src_path}/admin`;
	
	if(full_path.includes(atoms_src_dir)){
		
		const relative_to_atom_dir_path = full_path.replace(atoms_src_dir, '');
		const node_uranio_dir = `${transpose_params.root}/node_modules/uranio`;
		const node_atoms_src = `${node_uranio_dir}/src/atoms`;
		const node_atoms_dist = `${node_uranio_dir}/dist/atoms`;
		util_instance.fs.remove_directory(
			`${node_atoms_src}/server${relative_to_atom_dir_path}`
		);
		util_instance.fs.remove_directory(
			`${node_atoms_src}/client${relative_to_atom_dir_path}`
		);
		util_instance.fs.remove_directory(
			`${node_atoms_dist}/server${relative_to_atom_dir_path}`
		);
		util_instance.fs.remove_directory(
			`${node_atoms_dist}/client${relative_to_atom_dir_path}`
		);
		
	}else if(
		valid_deploy_repos().includes(transpose_params.repo)
		&& full_path.includes(server_src_dir)
	){
		
		// TODO
		
	}else if(
		valid_admin_repos().includes(transpose_params.repo)
		&& full_path.includes(admin_src_dir)
	){
		
		// TODO
		
	}
	
}

async function _unlink_file(file_path:string){
	
	const src_path = `${transpose_params.root}/src`;
	
	const atoms_src_dir = `${src_path}/atoms`;
	const server_src_dir = `${src_path}/server`;
	const admin_src_dir = `${src_path}/admin`;
	
	if(file_path.includes(atoms_src_dir)){
		
		const relative_to_atom_dir_path = file_path.replace(atoms_src_dir, '');
		const node_uranio_dir = `${transpose_params.root}/node_modules/uranio`;
		const node_atoms_src = `${node_uranio_dir}/src/atoms`;
		const node_atoms_dist = `${node_uranio_dir}/dist/atoms`;
		util_instance.fs.remove_file(
			`${node_atoms_src}/server${relative_to_atom_dir_path}`
		);
		util_instance.fs.remove_file(
			`${node_atoms_src}/client${relative_to_atom_dir_path}`
		);
		util_instance.fs.remove_file(
			`${node_atoms_dist}/server${relative_to_atom_dir_path}`
		);
		util_instance.fs.remove_file(
			`${node_atoms_dist}/client${relative_to_atom_dir_path}`
		);
		
	}else if(
		valid_deploy_repos().includes(transpose_params.repo)
		&& file_path.includes(server_src_dir)
	){
		
		// TODO
		
	}else if(
		valid_admin_repos().includes(transpose_params.repo)
		&& file_path.includes(admin_src_dir)
	){
		
		// TODO
		
	}
}

function _transpose_atom_dir_file(file_path:string){
	
	const atoms_dir = `${transpose_params.root}/src/atoms/`;
	const relative_path = file_path.replace(atoms_dir, '');
	
	const text = util_instance.fs.read_file(file_path);
	let text_server = _replace_import_server(text, file_path);
	let text_client = _replace_import_client(text, file_path);
	
	if(_is_atom_register_definition(file_path)){
		
		const atom_name = _get_atom_name_from_path(file_path);
		text_server = _process_atom_register_definition_server(text_server, atom_name);
		text_client = _process_atom_register_definition_client(text_client, atom_name);
		
	}else if(
		valid_deploy_repos().includes(transpose_params.repo)
		&& _is_route_register_definition(file_path)
	){
		
		const atom_name = _get_atom_name_from_path(file_path);
		const route_name = _get_route_name_from_path(file_path);
		text_server = _process_route_register_definition_server(text_server, atom_name, route_name);
		text_client = _process_route_register_definition_client(text_client, atom_name, route_name);
		
	}
	
	const node_atoms = `${transpose_params.root}/node_modules/uranio/src/atoms`;
	const node_dest_server = `${node_atoms}/server/${relative_path}`;
	const node_dest_client = `${node_atoms}/client/${relative_path}`;
	
	util_instance.fs.write_file(node_dest_server, text_server);
	util_instance.fs.write_file(node_dest_client, text_client);
	
	const node_dist_path_server = _dest_dist_path(node_dest_server);
	const node_dist_path_client = _dest_dist_path(node_dest_client);
	
	_compile(node_dest_server, node_dist_path_server);
	_compile(node_dest_client, node_dist_path_client);
	
}

function _dest_dist_path(filepath:string){
	const file_name = path.parse(filepath).name;
	let dir_name = path.dirname(filepath);
	dir_name = dir_name.replace(
		`${transpose_params.root}/node_modules/uranio/src/`,
		`${transpose_params.root}/node_modules/uranio/dist/`
	);
	return `${dir_name}/${file_name}.js`
}

function _compile(src_path:string, dest_path:string){
	esbuild.buildSync({
		entryPoints: [src_path],
		outfile: dest_path,
		platform: 'node',
		format: 'cjs',
		// sourcemap: true,
		// minify: true
	});
}

function _process_route_register_definition_client(text:string, atom_name:string, route_name:string){
	let updated_text = text;
	updated_text = _route_definition_without_call_paramter(updated_text);
	updated_text = _route_with_atom_and_name_argument(updated_text, atom_name, route_name);
	return updated_text;
}

function _process_route_register_definition_server(text:string, atom_name:string, route_name:string){
	let updated_text = text;
	updated_text = _route_with_atom_and_name_argument(updated_text, atom_name, route_name);
	return updated_text;
}

function _route_definition_without_call_paramter(source:string){
	const parsed_ast = recast.parse(source, {
		parser: require("recast/parsers/typescript")
	});
	const all = parsed_ast.program.body;
	for(const node of all){
		if(node.type === 'ExportDefaultDeclaration'){
			const obj_declaration = node.declaration as recast.types.namedTypes.CallExpression;
			if(obj_declaration.type === 'CallExpression'){
				if(obj_declaration.arguments.length === 0){
					break;
				}
				const definition = obj_declaration.arguments[0] as recast.types.namedTypes.ObjectExpression;
				if(definition.properties.length === 0){
					break;
				}
				for(let i = 0; i < definition.properties.length; i++){
					const obj_prop = definition.properties[i] as recast.types.namedTypes.ObjectProperty;
					const key = obj_prop.key as recast.types.namedTypes.Identifier;
					if(key && key.name === 'call'){
						delete definition.properties[i];
						break;
					}
				}
			}
			break;
		}
	}
	const printed = recast.print(parsed_ast, {useTabs: true}).code;
	return printed;
}
function _route_with_atom_and_name_argument(source:string, atom_name:string, route_name:string){
	const parsed_ast = recast.parse(source, {
		parser: require("recast/parsers/typescript")
	});
	const all = parsed_ast.program.body;
	for(const node of all){
		if(node.type === 'ExportDefaultDeclaration'){
			const obj_declaration = node.declaration as recast.types.namedTypes.CallExpression;
			if(obj_declaration.type === 'CallExpression'){
				const atom_arg = _create_atom_name_argument(atom_name);
				const route_arg = _create_route_name_argument(route_name);
				if(obj_declaration.arguments.length === 1){
					obj_declaration.arguments.push(atom_arg);
					obj_declaration.arguments.push(route_arg);
				}else if(obj_declaration.arguments.length === 2){
					obj_declaration.arguments[1] = atom_arg;
					obj_declaration.arguments.push(route_arg);
				}else if(obj_declaration.arguments.length === 3){
					obj_declaration.arguments[1] = atom_arg;
					obj_declaration.arguments[2] = route_arg;
				}
			}
			break;
		}
	}
	const printed = recast.print(parsed_ast, {useTabs: true}).code;
	return printed;
}

function _get_route_name_from_path(file_path:string){
	return path.parse(file_path).name;
}

function _get_atom_name_from_path(file_path:string){
	const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
	const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
	const relative_splitted = relative_to_atom_dir_path.split('/');
	const atom_name = relative_splitted[0];
	return atom_name;
}

function _process_atom_register_definition_server(text:string, atom_name:string){
	let updated_text = text;
	updated_text = _atom_with_name_argument(updated_text, atom_name);
	return updated_text;
}

function _process_atom_register_definition_client(text:string, atom_name:string){
	let updated_text = text;
	updated_text = _atom_with_name_argument(updated_text, atom_name);
	return updated_text;
}

function _is_route_register_definition(file_path:string):boolean{
	const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
	const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
	const relative_splitted = relative_to_atom_dir_path.split('/');
	return (relative_splitted.length === 3 && relative_splitted[1] === 'routes');
}

function _is_atom_register_definition(file_path:string):boolean{
	const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
	const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
	const relative_splitted = relative_to_atom_dir_path.split('/');
	return (relative_splitted.length === 2 && path.basename(file_path) === 'index.ts')
}

function _replace_import_server(text:string, file_path:string){
	return _replace_import(text, file_path, 'server');
}

function _replace_import_client(text:string, file_path:string){
	return _replace_import(text, file_path, 'client');
}

function _replace_import(text:string, file_path:string, parent_folder:string){
	
	const atoms_dir_path = `${transpose_params.root}/src/atoms/`;
	const relative_to_atom_dir_path = file_path.replace(atoms_dir_path, '');
	const relative_splitted = relative_to_atom_dir_path.split('/');
	const depth = relative_splitted.length;
	const up = Array(depth + 1).fill('..').join('/');
	const source = `${up}/${parent_folder}/main`;
	
	const parsed_ast = recast.parse(text, {
		parser: require("recast/parsers/typescript")
	});
	
	const all = parsed_ast.program.body;
	for(const node of all){
		if(node.type === 'ImportDeclaration'){
			if(node.source.value === 'uranio'){
				const b = recast.types.builders;
				const all_uranio_id = b.identifier('uranio');
				const import_namespace = b.importNamespaceSpecifier(all_uranio_id); // * as uranio
				node.specifiers[0] = import_namespace; // replace default "uranio" to "* as uranio"
				node.source.value = source; // replace "uranio" with "../../../server/main"
				break;
			}
		}
	}
	const printed = recast.print(parsed_ast, {useTabs: true}).code;
	return printed;
}


function _transpose_server_dir_file(_file_path:string){
	//TODO
}

function _transpose_admin_dir_file(_file_path:string){
	//TODO
}

function _atom_with_name_argument(source:string, atom_name:string){
	const parsed_ast = recast.parse(source, {
		parser: require("recast/parsers/typescript")
	});
	const all = parsed_ast.program.body;
	for(const node of all){
		if(node.type === 'ExportDefaultDeclaration'){
			const obj_declaration = node.declaration as recast.types.namedTypes.CallExpression;
			if(obj_declaration.type === 'CallExpression'){
				const atom_arg = _create_atom_name_argument(atom_name);
				if(obj_declaration.arguments.length === 1){
					obj_declaration.arguments.push(atom_arg);
				}else if(obj_declaration.arguments.length === 2){
					obj_declaration.arguments[1] = atom_arg;
				}
			}
			break;
		}
	}
	const printed = recast.print(parsed_ast, {useTabs: true}).code;
	return printed;
}

function _create_atom_name_argument(atom_name:string){
	const b = recast.types.builders;
	const arg_node = b.stringLiteral(atom_name);
	return arg_node;
}

function _create_route_name_argument(route_name:string){
	const b = recast.types.builders;
	const arg_node = b.stringLiteral(route_name);
	return arg_node;
}

async function _transpose_folder(dir_path:string, included=false){
	const entries = util_instance.fs.read_dir(dir_path);
	const promises:Promise<void>[] = [];
	for(const filename of entries){
		const full_path = path.resolve(dir_path, filename);
		if (util_instance.fs.is_directory(full_path) && filename !== '.git'){
			const folder_promise = _transpose_folder(full_path, true);
			promises.push(folder_promise);
		}else{
			const file_promise = _transpose_file(full_path, true);
			promises.push(file_promise);
		}
	}
	await Promise.all(promises);
	if(!included){
		output_instance.done_log(`Transpose folder completed.`);
	}
}

