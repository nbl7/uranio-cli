"use strict";
/**
 * Process module
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urn_process = void 0;
const fs_1 = __importDefault(require("fs"));
const cp = __importStar(require("child_process"));
const util = __importStar(require("./util/"));
const cmd_1 = require("./cmd/");
const defaults_1 = require("./conf/defaults");
const output = __importStar(require("./log/"));
function urn_process(args) {
    _set_conf(args);
    process.chdir(defaults_1.conf.root);
    _init_log();
    _log_arguments(args);
    _switch_command(args);
    // process.exit(1);
}
exports.urn_process = urn_process;
function _init_log() {
    if (!fs_1.default.existsSync(`${defaults_1.conf.root}/${defaults_1.defaults.log_filepath}`)) {
        cp.execSync(`touch ${defaults_1.conf.root}/${defaults_1.defaults.log_filepath}`);
    }
}
function _log_arguments(args) {
    output.verbose_log('args', JSON.stringify(args));
}
function _set_conf(args) {
    const repo = args.r || args.repo;
    if (typeof undefined !== typeof repo) {
        util.set_repo(repo);
    }
    let root = args.s || args.root;
    if (typeof undefined !== typeof root) {
        root = util.relative_to_absolute_path(root);
        if (!util.check_folder(root)) {
            let end_log = '';
            end_log += `Invalid project root.`;
            output.wrong_end_log(end_log);
            process.exit(1);
        }
        else {
            defaults_1.conf.root = root;
        }
    }
    else {
        util.auto_set_project_root();
    }
    if (typeof args.noverbose !== 'undefined' && !!args.noverbose !== !defaults_1.conf.verbose) {
        defaults_1.conf.verbose = !args.noverbose;
    }
    const verbose = args.v || args.verbose;
    if (verbose == true) {
        defaults_1.conf.verbose = true;
    }
    if (typeof args.noverbose !== 'undefined' && !!args.noverbose !== !defaults_1.conf.verbose) {
        defaults_1.conf.verbose = !args.noverbose;
    }
    const hide = args.n || args.hide;
    if (hide == true) {
        defaults_1.conf.hide = true;
    }
    if (typeof args.nohide !== 'undefined' && !!args.nohide !== !defaults_1.conf.hide) {
        defaults_1.conf.hide = !args.nohide;
    }
    const blank = args.b || args.blank;
    if (blank == true) {
        defaults_1.conf.blank = true;
    }
    if (typeof args.noblank !== 'undefined' && !!args.noblank !== !defaults_1.conf.blank) {
        defaults_1.conf.blank = !args.noblank;
    }
    const fullwidth = args.f || args.fullwidth;
    if (fullwidth == true) {
        defaults_1.conf.fullwidth = true;
    }
    if (typeof args.nofullwidth !== 'undefined' && !!args.nofullwidth !== !defaults_1.conf.fullwidth) {
        defaults_1.conf.fullwidth = !args.nofullwidth;
    }
}
function _switch_command(args) {
    let cmd = args._[0] || '';
    if (args.version || args.V) {
        cmd = 'version';
    }
    if (args.help || args.h) {
        cmd = 'help';
    }
    switch (cmd) {
        case '':
        case 'version': {
            output.stop_loading();
            console.log('v0.0.1');
            break;
        }
        case 'init': {
            cmd_1.init.command(args);
            break;
        }
        case 'transpose': {
            cmd_1.transpose.command();
            break;
        }
        case 'dev': {
            cmd_1.dev.command();
            break;
        }
        case 'help': {
            cmd_1.help.command();
            break;
        }
        case 'test': {
            cmd_1.test.command();
            break;
        }
        default: {
            console.log('Command not found.');
        }
    }
}
//# sourceMappingURL=process.js.map