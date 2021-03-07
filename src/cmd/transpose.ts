/**
 * Init command module
 *
 * @packageDocumentation
 */

import fs from 'fs';

import {
	ts,
	Project,
	Node,
	VariableDeclaration,
	VariableStatement,
	// PropertyAssignment,
	SourceFile,
	QuoteKind,
	IndentationText
} from 'ts-morph';

import {Arguments} from '../types';

import {defaults} from '../conf/defaults';

import * as output from '../log/';

import * as util from '../util/';

export const transpose = {
	
	run: async (args:Arguments):Promise<void> => {
		
		output.start_loading('Transposing...');
		
		let src_path = args.s || args['src-path'] || defaults.book_src_path;
		
		if(src_path[0] !== '/'){
			if(src_path.substr(0,2) === './'){
				src_path = src_path.substr(2);
			}
			src_path = `${global.uranio.root}/${src_path}`;
		}
		
		let dest_path = args.d || args['dest-path'] || defaults.book_dest_path;
		
		if(dest_path[0] !== '/'){
			if(dest_path.substr(0,2) === './'){
				dest_path = dest_path.substr(2);
			}
			dest_path = `${global.uranio.root}/${dest_path}`;
		}
		
		const modified = _manipulate_file(src_path);
		
		_copy_modified_file_to_dest(dest_path, modified);
		
		_prettier_books();
		
		output.end_log(`Transpose completed.`);
		
	}
	
};

const _project = new Project(
	{
		manipulationSettings: {
			indentationText: IndentationText.Tab,
			quoteKind: QuoteKind.Single,
		}
	}
);

function _prettier_books(){
	util.prettier(defaults.book_dest_path);
}

function _manipulate_file(src_path:string){
	
	const action = `manipulating [${src_path}]`;
	
	output.start_loading(`${action[0].toUpperCase()}${action.substr(1)}...`);
	
	output.verbose_log(`mnpl`, `Started ${action}.`);
	
	let sourceFile = _project.addSourceFileAtPath(src_path);
	
	sourceFile = _change_realtive_imports(sourceFile);
	sourceFile = _create_bll_book(sourceFile);
	sourceFile = _create_route_book(sourceFile);
	sourceFile = _manipulate_atom_book(sourceFile);
	
	return sourceFile.print();
}

function _manipulate_atom_book(sourceFile:SourceFile)
		:SourceFile{
	output.start_loading(`Manipulating atom_book...`);
	let book_decl = _find_atom_book_declaration(sourceFile);
	if(book_decl){
		book_decl = _remove_type_reference(book_decl);
		book_decl = _clean_prop('bll', book_decl);
		book_decl = _clean_prop('api', book_decl);
		book_decl = _append_requried_book(book_decl, 'uranio.types.required_books.atom');
		book_decl = _add_as_const(book_decl);
	}
	output.done_log('mnpl', 'Done manipulating atom_book.');
	return sourceFile;
}

function _create_a_book(sourceFile:SourceFile, book_name:string, keep_property:string, required_book_name:string)
		:SourceFile{
	output.start_loading(`Creating ${book_name}_book...`);
	const book_state = _find_atom_book_statement(sourceFile);
	if(book_state){
		const atom_book_state_text = book_state.getText();
		const cloned_book_source = _project.createSourceFile(`./${defaults.folder}/${book_name}_book.ts`, atom_book_state_text);
		let cloned_book_decl = cloned_book_source.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration);
		if(cloned_book_decl){
			cloned_book_decl = _remove_type_reference(cloned_book_decl);
			cloned_book_decl = _rename_book(book_name, cloned_book_decl);
			cloned_book_decl = _clean_all_but(keep_property, cloned_book_decl);
			cloned_book_decl = _append_requried_book(cloned_book_decl, `uranio.types.required_books.${required_book_name}`);
			cloned_book_decl = _add_as_const(cloned_book_decl);
		}
		const last = sourceFile.getLastChildByKind(ts.SyntaxKind.VariableStatement);
		if(last){
			last.replaceWithText(last.getText() + cloned_book_source.getText());
		}
	}
	output.done_log(book_name, `Created ${book_name}_book.`);
	return sourceFile;
}

function _create_route_book(sourceFile:SourceFile)
		:SourceFile{
	return _create_a_book(sourceFile, 'api', 'api', 'api');
}

function _create_bll_book(sourceFile:SourceFile)
		:SourceFile{
	return _create_a_book(sourceFile, 'bll', 'bll', 'bll');
}

function _clean_all_but(but:string, var_decl:VariableDeclaration)
		:VariableDeclaration{
	output.start_loading(`Cleaning all properties but [${but}]...`);
	const book_expr = var_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
	if(book_expr){
		const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
		for(const atom_name of atom_names){
			const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
			if(atom_def){
				const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
				for(const atom_def_prop of atom_def_props){
					if(atom_def_prop.getName() !== but){
						atom_def_prop.remove();
					}
				}
			}
		}
	}
	output.done_verbose_log('props', `Removed all properties but [${but}].`);
	return var_decl;
}

function _clean_prop(prop:string, var_decl:VariableDeclaration)
		:VariableDeclaration{
	output.start_loading(`Cleaning property [${prop}]...`);
	const book_expr = var_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
	if(book_expr){
		const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
		for(const atom_name of atom_names){
			const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
			if(atom_def){
				const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
				for(const atom_def_prop of atom_def_props){
					if(atom_def_prop.getName() === prop){
						atom_def_prop.remove();
					}
				}
			}
		}
	}
	output.done_verbose_log('prop', `Removed property [${prop}].`);
	return var_decl;
}

function _rename_book(book_name:string, var_decl:VariableDeclaration)
		:VariableDeclaration{
	const identifier = var_decl.getFirstChildByKind(ts.SyntaxKind.Identifier);
	if(identifier){
		identifier.replaceWithText(`${book_name}_book`);
	}
	return var_decl;
}

function _append_requried_book(book_decl:VariableDeclaration, book_string:string)
		:VariableDeclaration{
	output.start_loading(`Adding required_book...`);
	const obj_lit = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
	if(obj_lit){
		const text = obj_lit.getText();
		obj_lit.replaceWithText(`{...${book_string},\n` + text.slice(1,text.length));
	}
	output.done_verbose_log(`requ`, `Added required_book.`);
	return book_decl;
}

// function _append_requried_atoms(book_decl:VariableDeclaration)
//     :VariableDeclaration{
//   output.start_loading(`Adding required_book...`);
//   const obj_lit = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(obj_lit){
//     const text = obj_lit.getText();
//     obj_lit.replaceWithText(`{...uranio.types.required_book,\n` + text.slice(1,text.length));
//   }
//   output.done_log(`requ`, `Added required_book.`);
//   return book_decl;
// }

function _change_realtive_imports(sourceFile:SourceFile)
		:SourceFile{
	output.start_loading(`Changing relative imports...`);
	const import_decls = sourceFile.getChildrenOfKind(ts.SyntaxKind.ImportDeclaration);
	for(const import_decl of import_decls){
		_change_realtive_import(import_decl);
	}
	output.done_log('impr', 'Changed relative imports.');
	return sourceFile;
}


function _add_as_const(book_decl:VariableDeclaration){
	output.start_loading(`Adding as const...`);
	book_decl.replaceWithText(book_decl.getText() + ' as const');
	output.done_verbose_log(`asco`, `Added as const.`);
	return book_decl;
}

function _change_realtive_import(node:Node)
		:Node{
	output.start_loading(`Changing relative imports...`);
	const str_lit = node.getFirstChildByKind(ts.SyntaxKind.StringLiteral);
	if(str_lit){
		const text = str_lit.getText();
		if(text.includes('./')){
			const replace = text.replace('./','../src/');
			str_lit.replaceWithText(replace);
			output.verbose_log(`impo`, `Changed [${text}] to [${replace}].`);
		}
	}
	// output.done_log('impo', `Changed relative import.`);
	return node;
}

function _copy_modified_file_to_dest(dest:string, text:string){
	output.start_loading(`Writing manipulated book...`);
	fs.writeFileSync(dest, text);
	output.done_log(`trns`, `Manipulated books copied to [${dest}].`);
}

// function _remove_bll_prop(book_decl:VariableDeclaration){
//   output.start_loading(`Removing bll props...`);
//   output.verbose_log(`bll`, `Look for bll property assignments.`);
//   const book_expr = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(book_expr){
//     const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//     for(const atom_name of atom_names){
//       const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//       if(atom_def){
//         const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//         for(const atom_def_prop of atom_def_props){
//           if(atom_def_prop.getName() === 'bll'){
//             // _remove_bll_import(atom_def_prop);
//             atom_def_prop.remove();
//             output.verbose_log(`bll_`, `Removed bll for [${atom_name.getName()}].`);
//           }
//         }
//       }
//     }
//   }
//   output.done_log('blls', `Removed blls.`);
//   return book_decl;
// }

// function _remove_bll_prop_and_imports(book_decl:VariableDeclaration){
//   output.start_loading(`Removing bll prop and imports...`);
//   output.verbose_log(`bll_`, `Look for bll property assignments.`);
//   const book_expr = book_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//   if(book_expr){
//     const atom_names = book_expr.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//     for(const atom_name of atom_names){
//       const atom_def = atom_name.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
//       if(atom_def){
//         const atom_def_props = atom_def.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment);
//         for(const atom_def_prop of atom_def_props){
//           if(atom_def_prop.getName() === 'bll'){
//             _remove_bll_import(atom_def_prop);
//             atom_def_prop.remove();
//             output.verbose_log(`bll_`, `Removed bll for [${atom_name.getName()}].`);
//           }
//         }
//       }
//     }
//   }
//   output.done_log('blls', `Removed blls.`);
//   return book_decl;
// }

function _remove_type_reference(book_decl:VariableDeclaration){
	output.start_loading(`Removing type reference...`);
	// output.verbose_log(`type`, `Look for type reference.`);
	const type_ref = book_decl.getFirstChildByKind(ts.SyntaxKind.TypeReference);
	if(type_ref){
		book_decl.removeType();
	}
	output.done_verbose_log('type', `Type reference removed.`);
	return book_decl;
}

function _find_atom_book_declaration(sourceFile:SourceFile)
		:VariableDeclaration | undefined{
	output.start_loading(`Looking for atom_book declaration...`);
	// output.verbose_log(`book`, `Look for atom_book declaration.`);
	const var_states = sourceFile.getChildrenOfKind(ts.SyntaxKind.VariableStatement);
	for(const state of var_states){
		const var_decl_list = state.getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList);
		if(var_decl_list){
			const var_decl = var_decl_list.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
			if(var_decl){
				const name = var_decl.getName();
				if(name === 'atom_book'){
					output.verbose_log(`book`, `Declaration of atom_book found.`);
					return var_decl;
				}
			}
		}
	}
	output.verbose_log('book', `Cannot find atom_book`);
	return undefined;
}

function _find_atom_book_statement(sourceFile:SourceFile)
		:VariableStatement | undefined{
	output.start_loading(`Looking for atom_book statement...`);
	// output.verbose_log(`book`, `Look for atom_book statement.`);
	const var_states = sourceFile.getChildrenOfKind(ts.SyntaxKind.VariableStatement);
	for(const state of var_states){
		const var_decl_list = state.getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList);
		if(var_decl_list){
			const var_decl = var_decl_list.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
			if(var_decl){
				const name = var_decl.getName();
				if(name === 'atom_book'){
					output.verbose_log(`book`, `Statement of atom_book found.`);
					return state;
				}
			}
		}
	}
	output.verbose_log('book', `Cannot find atom_book`);
	return undefined;
}
// function _get_object_literal(var_decl:VariableDeclaration)
//     :ObjectLiteralExpression | undefined {
//   return var_decl.getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression);
// }

// function _find_atom_book_declaration(node:Node){
//   output.start_loading(`Looking for atom_book declaration...`);
//   output.verbose_log(`book`, `Look for atom_book declaration.`);
//   const var_decl_list = node.getFirstChildByKind(ts.SyntaxKind.VariableDeclarationList);
//   if(var_decl_list){
//     const var_decl = var_decl_list.getFirstChildByKind(ts.SyntaxKind.VariableDeclaration);
//     if(var_decl){
//       const name = var_decl.getName();
//       if(name === 'atom_book'){
//         output.done_log(`book`, `Declaration of atom_book found.`);
//         return var_decl;
//       }
//     }
//   }
//   output.done_log('book', `Cannot find atom_book`);
//   return undefined;
// }
