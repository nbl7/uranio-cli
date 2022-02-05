/**
 * Hooks command module
 *
 * This command will generate Hooks for Uranio TRX.
 *
 * @packageDocumentation
 */

import * as tsm from 'ts-morph';

import {Params} from '../types';

import {default_params, defaults} from '../conf/defaults';

import * as output from '../output/';

import * as util from '../util/';

import {merge_params} from './common';

// import {HooksParams} from './types';

type ParamsType = {
	[k:string]: {
		array?: boolean
	}
}

const default_routes = {
	count: {url: '/count', method: 'GET'},
	find: {url: '/', method: 'GET'},
	find_id: {url: '/:id', method: 'GET'},
	find_one: {url: '/', method: 'GET'},
	insert: {url: '/', method: 'POST'},
	update: {url: '/:id', method: 'POST'},
	delete: {url: '/:id', method: 'DELETE'},
	insert_multiple: {url: '/multiple', method: 'POST'},
	update_multiple: {url: '/multiple/:ids', method: 'POST', params: {ids: {array: true}}},
	delete_multiple: {url: '/multiple/:ids', method: 'DELETE', params: {ids: {array: true}}}
};

const _project_option = {
	manipulationSettings: {
		indentationText: tsm.IndentationText.Tab,
		quoteKind: tsm.QuoteKind.Single,
		newLineKind: tsm.NewLineKind.LineFeed
	}
};

let output_instance:output.OutputInstance;

let util_instance:util.UtilInstance;

let hooks_params = default_params as Params;

export async function hooks(params:Partial<Params>, included=false)
		:Promise<void>{
	
	hooks_params = merge_params(params);
	
	output_instance = output.create(hooks_params);
	
	util_instance = util.create(hooks_params, output_instance);
	
	util_instance.must_be_initialized();
	
	output_instance.start_loading('Generating TRX Hooks...');
	
	const text = _generate_text();
	_save_to_file(text);
	if(included){
		output_instance.done_log(`TRX Hooks generated.`, 'hooks');
	}else{
		output_instance.end_log(`TRX Hooks generated.`);
	}
	
	// if(hooks_params.is_dot){
	//   _copy_hooks_to_dot_src();
	// }
	
}

function _generate_text(){
	const atom_names = _get_atom_name_from_book('atom');
	const atom_plurals = _get_atom_def_plural();
	const atom_routes = _get_atom_routes();
	let text = '';
	text += `/**\n`;
	text += ` * Autogenerated TRX Hooks module from urn-cli\n`;
	text += ` *\n`;
	text += ` * @packageDocumentation\n`;
	text += ` */\n`;
	text += `\n`;
	text += `import {urn_response} from 'urn-lib';\n`;
	text += `\n`;
	text += `import * as uranio from '../cln/main';\n`;
	text += `\n`;
	text += `let hook_token:string|undefined;\n`;
	text += `export function set_token(token:string):void{\n`;
	text += `\thook_token = token;\n`;
	text += `}\n\n`;

	// text += `export const hooks = {\n`;
	for(const atom_name of atom_names){
		const plural = (typeof atom_plurals[atom_name] === 'string') ?
			atom_plurals[atom_name] : `${atom_name}s`;
		text += `export const ${plural} = {\n`;
		if(_is_auth_atom(atom_name)){
			text += _authenticate_hooks(atom_name);
		}
		if(atom_name === 'media'){
			text += _upload_hooks();
			text += _presigned_hooks();
		}
		for(const route_name in atom_routes[atom_name]){
			const params_type = atom_routes[atom_name][route_name]['params'];
			const text_args = _text_args_for_url(atom_routes[atom_name][route_name].url, params_type);
			const body_arg = _body_arg_for_route(atom_routes, atom_name, route_name);
			text += `\t${route_name}: async <D extends uranio.types.Depth>(\n`;
			text += `\t\t${text_args}${body_arg}options?:uranio.types.Hook.Arguments<'${atom_name}', '${route_name}', D>,\n`;
			text += `\t\ttoken?:string\n`;
			text += `\t):Promise<uranio.types.Hook.Response<'${atom_name}', '${route_name}', D>>  => {\n`;
			text += `\t\tconst args:uranio.types.Hook.Arguments<'${atom_name}', '${route_name}', D> = {\n`;
			const lines = _text_lines_in_args_params(atom_routes[atom_name][route_name].url, params_type);
			if(lines.length > 0){
				text += `\t\t\tparams: {\n`;
				for(const line of lines){
					text += `\t\t\t\t${line}\n`;
				}
				text += `\t\t\t},\n`;
			}
			if(body_arg !== ''){
				text += `\t\t\tbody: body,\n`;
			}
			text += `\t\t\t...options\n`;
			text += `\t\t};\n`;
			
			text += `\t\tlet current_token:string|undefined;\n`;
			text += `\t\tif(typeof hook_token === 'string' && hook_token !== ''){\n`;
			text += `\t\t\tcurrent_token = hook_token;\n`;
			text += `\t\t}\n`;
			text += `\t\tif(typeof token === 'string' && token !== ''){\n`;
			text += `\t\t\tcurrent_token = token;\n`;
			text += `\t\t}\n`;
			
			text += `\t\treturn await uranio.base.create('${atom_name}',current_token).hook<'${route_name}',D>('${route_name}')(args);\n`;
			text += `\t},\n`;
		}
		text += `};\n`;
	}
	// text += `} as const;\n`;
	output_instance.done_verbose_log(`Generated hooks text.`, 'hooks');
	return text;
}

function _is_auth_atom(atom_name:string){
	const auth_by_atom = _get_atom_def_prop('authenticate', tsm.SyntaxKind.TrueKeyword);
	return (auth_by_atom[atom_name] == 'true');
}

function _upload_hooks(){
	let text = '';
	text += `\tupload: async<D extends uranio.types.Depth>(\n`;
	text += `\t\tfile: Buffer | ArrayBuffer | Blob,\n`;
	text += `\t\ttoken?: string\n`;
	text += `\t): Promise<urn_response.General<uranio.types.Atom<'media'>>> => {\n`;
	text += `\t\tlet current_token: string | undefined;\n`;
	text += `\t\tif (typeof hook_token === "string" && hook_token !== "") {\n`;
	text += `\t\t\tcurrent_token = hook_token;\n`;
	text += `\t\t}\n`;
	text += `\t\tif (typeof token === "string" && token !== "") {\n`;
	text += `\t\t\tcurrent_token = token;\n`;
	text += `\t\t}\n`;
	text += `\t\treturn await uranio.media.create(current_token).upload<D>(file, current_token);\n`;
	text += `\t},\n`;
	return text;
}

function _presigned_hooks(){
	let text = '';
	text += `\tpresigned: async(\n`;
	text += `\t\tfilename: string,\n`;
	text += `\t\tsize?: number,\n`;
	text += `\t\ttype?: string,\n`;
	text += `\t\ttoken?: string\n`;
	text += `\t): Promise<urn_response.General<string>> => {\n`;
	text += `\t\tlet current_token: string | undefined;\n`;
	text += `\t\tif (typeof hook_token === "string" && hook_token !== "") {\n`;
	text += `\t\t\tcurrent_token = hook_token;\n`;
	text += `\t\t}\n`;
	text += `\t\tif (typeof token === "string" && token !== "") {\n`;
	text += `\t\t\tcurrent_token = token;\n`;
	text += `\t\t}\n`;
	text += `\t\treturn await uranio.media.create(current_token).presigned(filename, size, type, current_token);\n`;
	text += `\t},\n`;
	return text;
}

function _authenticate_hooks(atom_name:string){
	let text = '';
	text += `\tauthenticate: async (\n`;
	text += `\t\temail: string,\n`;
	text += `\t\tpassword: string\n`;
	text += `\t): Promise<urn_response.General<uranio.types.Api.AuthResponse>> => {\n`;
	text += `\t\treturn await uranio.auth.create('${atom_name}').authenticate(email, password);\n`;
	text += `\t},\n`;
	return text;
}

function _get_atom_name_from_book(book_name:string){
	const atom_names:string[] = [];
	const atom_def_with_atom_name = _get_book_atom_def(book_name);
	if(!atom_def_with_atom_name){
		return atom_names;
	}
	for(const prop of atom_def_with_atom_name){ // atom def with atom name [tsm PropertyAssignment]
		const prop_id = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		const atom_name = prop_id.getText();
		atom_names.push(atom_name);
	}
	return atom_names;
}

function _get_book_atom_def(book_name:string){
	// const atom_book_path = `${hooks_params.root}/${defaults.folder}/client/src/books/${book_name}.ts`;
	const atom_book_path = `${hooks_params.root}/${defaults.folder}/server/src/books/${book_name}.ts`;
	const _project = new tsm.Project(_project_option);
	const sourceFile = _project.addSourceFileAtPath(atom_book_path);
	const syntax_list = sourceFile.getLastChildByKindOrThrow(tsm.SyntaxKind.SyntaxList);
	const var_states = syntax_list.getChildrenOfKind(tsm.SyntaxKind.VariableStatement);
	for(const var_state of var_states){
		const decl_list = var_state.getFirstChildByKindOrThrow(tsm.SyntaxKind.VariableDeclarationList);
		const identifier = decl_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
		const id_name = identifier.getText();
		if(id_name === `${book_name}_book`){
			const obj_lit_exp = decl_list.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
			const book_syntax_list = obj_lit_exp.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
			const prop_ass = book_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
			return prop_ass;
		}
	}
}

function _get_atom_def_prop(prop_name:string, type:tsm.SyntaxKind){
	const prop_by_atom:AnyByAtom = {};
	const atom_def_props = _get_book_atom_def_props('atom');
	if(!atom_def_props){
		return prop_by_atom;
	}
	for(const atom_name in atom_def_props){
		for(const atom_prop of atom_def_props[atom_name]){
			const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
			const atom_prop_name = atom_prop_id.getText();
			if(atom_prop_name === prop_name){
				let atom_prop_value = undefined;
				const type_key = atom_prop.getChildrenOfKind(type);
				if(type_key.length > 0){
					atom_prop_value = type_key[0].getText();
				}
				if(atom_prop_name[0] === '"' || atom_prop_name[0] === "'"){
					prop_by_atom[atom_name] = (atom_prop_value as string).slice(1, -1);
				}else{
					prop_by_atom[atom_name] = atom_prop_value;
				}
			}
		}
	}
	return prop_by_atom;
}

function _get_atom_def_plural(){
	const plural_by_atom:AnyByAtom = {};
	const atom_def_props = _get_book_atom_def_props('atom');
	if(!atom_def_props){
		return plural_by_atom;
	}
	// first:
	for(const atom_name in atom_def_props){
		second:
		for(const atom_prop of atom_def_props[atom_name]){
			const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
			const atom_prop_name = atom_prop_id.getText();
			if(atom_prop_name === 'plural'){
				let atom_prop_value = undefined;
				const string_lits = atom_prop.getChildrenOfKind(tsm.SyntaxKind.StringLiteral);
				if(string_lits.length > 0){
					atom_prop_value = string_lits[0].getText();
				}
				plural_by_atom[atom_name] = (atom_prop_value as string).slice(1, -1);
				break second;
			}
		}
	}
	return plural_by_atom;
}

type AnyByAtom = {
	[k:string]: any
}

function _get_book_atom_def_props(book_name:string){
	const atom_def_by_atom:AnyByAtom = {};
	const atom_def_with_atom_name = _get_book_atom_def(book_name);
	if(!atom_def_with_atom_name){
		return atom_def_by_atom;
	}
	for(const prop of atom_def_with_atom_name){ // atom def with atom name
		const prop_id = prop.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
		const atom_name = prop_id.getText();
		const prop_obj = prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression);
		const prop_syntax = prop_obj.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
		const atom_props = prop_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
		atom_def_by_atom[atom_name] = atom_props; // atom def properties [plural, properties, connection, ...]
	}
	return atom_def_by_atom;
}

function _body_arg_for_route(routes:AnyByAtom, atom_name: string, route_name:string){
	if(routes[atom_name]?.[route_name]?.method === 'POST'){
		return `body:uranio.types.Hook.Body<'${atom_name}', '${route_name}'>,\n\t\t`;
	}
	return '';
}

function _text_args_for_url(url:string, params_type?:ParamsType){
	let checked_url = url;
	if(url[0] === "'" && url[url.length-1] === "'"){
		checked_url = url.substring(1,url.length-1);
	}
	const params = _get_parameters_from_url(checked_url);
	return _generate_args(params, params_type);
}

function _get_parameters_from_url(url:string){
	const url_params:string[] = [];
	if(typeof url !== 'string'){
		return url_params;
	}
	const splitted_url = url.split('/');
	for(const split_url of splitted_url){
		if(split_url.includes(':')){
			const splitted_split = split_url.split(':');
			if(splitted_split.length > 1){
				url_params.push(splitted_split[1]);
			}
		}
	}
	return url_params;
}

// function _generate_arg(atom_name:string, route_name:string){
//   let body_type = 'any';
//   const atom_routes = ['insert', 'update'];
//   if(atom_routes.includes(route_name)){
//     body_type = `AtomShape<'${atom_name}>'`;
//   }
//   let body_arg = '';
//   body_arg += `body:${body_type}, `;
//   return body_arg;
// }

function _generate_args(params:string[], params_type?:ParamsType){
	const param_text:string[] = [];
	for(const p of params){
		let p_type = 'string';
		if(params_type && params_type[p]?.array === true){
			p_type = `string[]`;
		}
		param_text.push(`${p}:${p_type},\n\t\t`);
	}
	return param_text.join('');
}

function _get_atom_routes(){
	const full_routes_by_atom:AnyByAtom = {};
	const atom_names = _get_atom_name_from_book('atom');
	const routes_by_atom = _get_custom_routes();
	for(const atom_name of atom_names){
		full_routes_by_atom[atom_name] = {};
		let default_route_name:keyof typeof default_routes;
		for(default_route_name in default_routes){
			full_routes_by_atom[atom_name][default_route_name] = default_routes[default_route_name];
			if(routes_by_atom[atom_name]){
				for(const custom_route_name in routes_by_atom[atom_name]){
					full_routes_by_atom[atom_name][custom_route_name] = routes_by_atom[atom_name][custom_route_name];
				}
			}
		}
	}
	return full_routes_by_atom;
}

function _get_custom_routes(){
	const routes_by_atom:AnyByAtom = {};
	const atom_def_props = _get_book_atom_def_props('dock');
	if(!atom_def_props){
		return routes_by_atom;
	}
	for(const atom_name in atom_def_props){
		for(const atom_prop of atom_def_props[atom_name]){
			const atom_prop_id = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
			const atom_prop_name = atom_prop_id.getText();
			if(atom_prop_name === 'dock'){
				const dock_syntax_list = atom_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
				const dock_props = dock_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
				for(const dock_prop of dock_props){
					const dock_prop_id = dock_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
					const dock_prop_name = dock_prop_id.getText();
					if(dock_prop_name === 'routes'){
						const routes_syntax_list = dock_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
						const routes_props = routes_syntax_list.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
						for(const routes_prop of routes_props){
							const routes_prop_id = routes_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
							const routes_prop_name = routes_prop_id.getText(); // routes name
							if(!routes_by_atom[atom_name]){
								routes_by_atom[atom_name] = {};
							}
							routes_by_atom[atom_name][routes_prop_name] = {};
							const route_syntax = routes_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.SyntaxList);
							const route_props = route_syntax.getChildrenOfKind(tsm.SyntaxKind.PropertyAssignment);
							for(const route_prop of route_props){ // [url, query, action, method, call]
								const route_prop_id = route_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier);
								const route_prop_name = route_prop_id.getText();
								if(route_prop_name === 'url'){
									const url_string_lit = route_prop.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.StringLiteral);
									const url_string = url_string_lit.getText();
									routes_by_atom[atom_name][routes_prop_name].url = url_string.replace(/"/g,'');
								}
							}
						}
					}
				}
			}
		}
	}
	return routes_by_atom;
}

function _text_lines_in_args_params(url:string, params_type?:ParamsType){
	const lines:string[] = [];
	if(typeof url !== 'string'){
		return lines;
	}
	let checked_url = url;
	if(url[0] === "'" && url[url.length-1] === "'"){
		checked_url = url.substring(1,url.length-1);
	}
	const url_params = _get_parameters_from_url(checked_url);
	for(const p of url_params){
		if(params_type && params_type[p]?.array === true){
			lines.push(`${p}: ${p}.join(',')`);
		}else{
			lines.push(`${p}: ${p},`);
		}
	}
	return lines;
}

function _save_to_file(text:string){
	const default_folder = `${hooks_params.root}/${defaults.folder}`;
	let hooks_path_server = `${default_folder}/server/src/${defaults.repo_folder}`;
	let hooks_path_client = `${default_folder}/client/src/${defaults.repo_folder}`;
	switch(hooks_params.repo){
		case 'trx':{
			break;
		}
		case 'adm':{
			hooks_path_server = `${default_folder}/server/src/${defaults.repo_folder}/trx`;
			hooks_path_client = `${default_folder}/client/src/${defaults.repo_folder}/trx`;
			break;
		}
	}
	
	const filepath_server = `${hooks_path_server}/hooks/hooks.ts`;
	util_instance.fs.write_file(filepath_server, text);
	// util_instance.pretty(filepath_server);
	output_instance.done_verbose_log(`Created hooks file [${filepath_server}].`, 'hooks');
	
	const filepath_client = `${hooks_path_client}/hooks/hooks.ts`;
	// util_instance.fs.write_file(filepath_client, text);
	// util_instance.pretty(filepath_client);
	util_instance.fs.copy_file(filepath_server, filepath_client);
	output_instance.done_verbose_log(`Created hooks file [${filepath_client}].`, 'hooks');
	
}

// function _copy_hooks_to_dot_src(){
//   output_instance.start_loading(`Copying hooks to uranio-dot/src...`);
//   let dot_hooks_dir = `${hooks_params.root}/${defaults.folder}/server/src/uranio/trx/hooks`;
//   let src_hooks_dir = `${hooks_params.root}/src/uranio/trx/hooks/`;
//   switch(hooks_params.repo){
//     case 'adm':{
//       dot_hooks_dir = `${hooks_params.root}/${defaults.folder}/server/src/uranio/trx/hooks/`;
//       src_hooks_dir = `${hooks_params.root}/src/uranio/trx/hooks/`;
//       break;
//     }
//     case 'trx':{
//       dot_hooks_dir = `${hooks_params.root}/${defaults.folder}/server/src/uranio/hooks/`;
//       src_hooks_dir = `${hooks_params.root}/src/uranio/hooks/`;
//       break;
//     }
//   }
//   util_instance.fs.copy_directory(dot_hooks_dir, src_hooks_dir);
//   output_instance.done_log(`Copied hooks to uranio-dot/src.`, 'dot');
// }

