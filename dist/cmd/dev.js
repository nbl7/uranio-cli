"use strict";
/**
 * Init command module
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = void 0;
const cp = __importStar(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
// import chalk from 'chalk';
const output = __importStar(require("../output/"));
const util = __importStar(require("../util/"));
const defaults_1 = require("../conf/defaults");
// import {conf} from '../conf/defaults';
const transpose_1 = require("./transpose");
exports.dev = {
    command: () => __awaiter(void 0, void 0, void 0, function* () {
        output.stop_loading();
        util.read_rc_file();
        defaults_1.conf.filelog = false;
        _start_dev();
    })
};
let watch_client_scanned = false;
let watch_server_scanned = false;
let watch_book_scanned = false;
const cli_options = {
    hide: false,
    verbose: true,
};
const nuxt_color = '#677cc7';
// const tscw_color = '#8a5b5b';
const tscw_color = '#734de3';
const watc_color = '#687a6a';
let user_exit = false;
function _start_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        // conf.prefix = chalk.green(`[urn] `);
        _copy_folder_recursive_sync(`${defaults_1.conf.root}/src/client/.`, `${defaults_1.conf.root}/.uranio/client/src/.`);
        transpose_1.transpose.run(defaults_1.conf.root, undefined, cli_options);
        // const nuxt_cmd = `npx nuxt -c ${defaults.folder}/client/nuxt.config.js`;
        // const nuxt_child = _spawn_log_command(nuxt_cmd, 'nuxt', nuxt_color);
        const ntl_cmd = `npx ntl dev`;
        const ntl_child = _spawn_log_command(ntl_cmd, 'ntl', nuxt_color);
        const tscw_cmd = `npx tsc -w --project ${defaults_1.conf.root}/tsconfig.json`;
        const tscw_child = _spawn_log_command(tscw_cmd, 'tscw', tscw_color);
        const client_folder = `${defaults_1.conf.root}/src/client/.`;
        output.log(`wtch`, `Watching Client Folder [${client_folder}] ...`);
        const watch_client = chokidar_1.default.watch(client_folder).on('ready', () => {
            output.log(`wtch`, `Initial scanner completed for [${client_folder}].`);
            watch_client_scanned = true;
        }).on('all', (_event, _path) => {
            output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            if (!watch_client_scanned) {
                return false;
            }
            if (_path.endsWith('.swp')) {
                return false;
            }
            const relative_path_to_client = _path.replace(`${defaults_1.conf.root}/src/client/`, '');
            const new_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/client/src/${relative_path_to_client}`;
            if (_event === 'unlink') {
                _delete_file_sync(new_path);
            }
            else {
                output.log(`wtch`, `[Client watch] Copy file sync [${_path}] to [${new_path}]`);
                _copy_file_sync(_path, new_path);
            }
        });
        const server_folder = `${defaults_1.conf.root}/src/server/.`;
        output.log(`wtch`, `Watching Server Folder [${server_folder}] ...`);
        const watch_server = chokidar_1.default.watch(server_folder).on('ready', () => {
            output.log(`wtch`, `Initial scanner completed for [${server_folder}].`);
            watch_server_scanned = true;
        }).on('all', (_event, _path) => {
            output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            if (!watch_server_scanned) {
                return false;
            }
            const relative_path_to_server = _path.replace(`${defaults_1.conf.root}/src/server/`, '');
            const new_path = `${defaults_1.conf.root}/${defaults_1.defaults.folder}/server/${relative_path_to_server}`;
            if (_event === 'unlink') {
                output.log(`wtch`, `[Server watch] Unlink [${_path}].`);
                _delete_file_sync(new_path);
            }
            else {
                output.log(`wtch`, `[Server watch] Transpose [${_path}].`);
                transpose_1.transpose.run(defaults_1.conf.root, _path, cli_options);
            }
            // _replace_netlify_function_file();
        });
        const book_path = `${defaults_1.conf.root}/src/book.ts`;
        output.log(`wtch`, `Watching Book file [${book_path}] ...`);
        const watch_book = chokidar_1.default.watch(book_path).on('ready', () => {
            output.log(`wtch`, `Initial scanner completed for [${book_path}].`);
            watch_book_scanned = true;
        }).on('all', (_event, _path) => {
            output.verbose_log(`wtch`, `${_event} ${_path}`, watc_color);
            if (!watch_book_scanned) {
                return false;
            }
            if (_event !== 'unlink') {
                output.log(`wtch`, `[Book watch] Transpose [${_path}].`);
                transpose_1.transpose.run(defaults_1.conf.root, _path, cli_options);
            }
            // _replace_netlify_function_file();
        });
        process.on('SIGINT', function () {
            user_exit = true;
            watch_client.close().then(() => {
                output.log(`wtch`, 'Stop watching client folder.');
            });
            watch_server.close().then(() => {
                output.log(`wtch`, 'Stop watching server folder.');
            });
            watch_book.close().then(() => {
                output.log(`wtch`, 'Stop watching book file.');
            });
            process.stdout.write("\r--- Caught interrupt signal ---\n");
            // if(nuxt_child.pid){
            //   process.kill(nuxt_child.pid);
            // }
            if (ntl_child.pid) {
                process.kill(ntl_child.pid);
            }
            if (tscw_child.pid) {
                process.kill(tscw_child.pid);
            }
        });
    });
}
// function _replace_netlify_function_file(){
//   util.copy_file(
//     'fnc',
//     `${conf.root}/.uranio/functions/api.ts`,
//     `${conf.root}/.uranio/functions/api.ts`
//   );
// }
function _clean_chunk(chunk) {
    const plain_text = chunk
        .toString()
        .replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') // eslint-disable-line no-control-regex
        .replace(/\r?\n|\r/g, ' ');
    return plain_text;
}
function _spawn_log_command(command, context, color) {
    const splitted_command = command.split(' ');
    const spawned = cp.spawn(splitted_command[0], splitted_command.slice(1));
    if (spawned.stdout) {
        spawned.stdout.setEncoding('utf8');
        spawned.stdout.on('data', (chunk) => {
            const splitted_chunk = chunk.split('\n');
            for (const split of splitted_chunk) {
                const plain_text = _clean_chunk(split);
                if (plain_text.includes('<error>')) {
                    output.error_log(context, plain_text);
                    // process.stdout.write(chunk);
                }
                else if (plain_text != '') {
                    output.verbose_log(context, plain_text, color);
                }
            }
        });
    }
    if (spawned.stderr) {
        spawned.stderr.setEncoding('utf8');
        spawned.stderr.on('data', (chunk) => {
            const splitted_chunk = chunk.split('\n');
            for (const split of splitted_chunk) {
                const plain_text = _clean_chunk(split);
                if (plain_text !== '') {
                    output.error_log(context, plain_text);
                }
                // process.stdout.write(chunk);
                // process.stderr.write(`[${context}] ${chunk}`);
            }
        });
    }
    spawned.on('close', (code) => {
        switch (code) {
            case 0: {
                output.verbose_log(context, `Closed.`, color);
                break;
            }
            default: {
                if (user_exit === false) {
                    output.error_log(context, `Child process exited with code ${code}`);
                }
            }
        }
    });
    spawned.on('error', (err) => {
        if (user_exit === false) {
            output.error_log(context, `${err}`);
        }
    });
    return spawned;
}
function _delete_file_sync(file_path) {
    fs_1.default.unlinkSync(file_path);
    output.verbose_log('dl', `Deleted file ${file_path}.`);
}
function _copy_file_sync(source, target) {
    let target_file = target;
    if (fs_1.default.existsSync(target) && fs_1.default.lstatSync(target).isDirectory()) {
        target_file = path_1.default.join(target, path_1.default.basename(source));
    }
    fs_1.default.writeFileSync(target_file, fs_1.default.readFileSync(source));
    output.verbose_log('cp', `Copied file ${target_file}.`);
}
function _copy_folder_recursive_sync(source, target) {
    let files = [];
    const target_folder = path_1.default.join(target, path_1.default.basename(source));
    if (!fs_1.default.existsSync(target_folder)) {
        fs_1.default.mkdirSync(target_folder);
    }
    if (fs_1.default.lstatSync(source).isDirectory()) {
        files = fs_1.default.readdirSync(source);
        files.forEach(function (file) {
            const cur_source = path_1.default.join(source, file);
            if (fs_1.default.lstatSync(cur_source).isDirectory()) {
                _copy_folder_recursive_sync(cur_source, target_folder);
            }
            else if (!cur_source.endsWith('.swp')) {
                _copy_file_sync(cur_source, target_folder);
            }
        });
    }
}
//# sourceMappingURL=dev.js.map