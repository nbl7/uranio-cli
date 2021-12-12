/**
 * Output class
 *
 * @packageDocumentation
 */

import dateFormat from 'dateformat';

// import ora from 'ora';

import chalk from 'chalk';

import fs from 'fs';

import {defaults} from '../conf/defaults';

import {Params} from '../types';

// import {merge_params} from '../cmd/common';

import {spinner, spinner_texts} from './spinner';

// import {OutputParams} from './types';

class Output {
	
	// public spinner:ora.Ora
	
	// public spinner_texts:string[]
	
	constructor(public params:Params){
		
		// this.spinner = ora({text: 'Loading...', color: 'magenta', interval: 40});
		// this.spinner_texts = [];
		
	}
	
	public log(text:string, context='log', color?:string)
			:void{
		const final_color = (typeof color === 'string') ? color : this.params.color_log;
		const colored_text = (!this.params.blank) ? chalk.hex(final_color)(text) : text;
		this._log(colored_text, context, true);
	}
	
	public verbose_log(text:string, context='vlog', color?:string)
			:void{
		const final_color = (typeof color === 'string') ? color : this.params.color_verbose;
		const colored_text = (!this.params.blank) ? chalk.hex(final_color)(text) : text;
		this._log(colored_text, context, (this.params.verbose === true));
	}
	
	public debug_log(text:string, context='dlog', color?:string)
			:void{
		const final_color = (typeof color === 'string') ? color : this.params.color_debug;
		const colored_text = (!this.params.blank) ? chalk.hex(final_color)(text) : text;
		this._log(colored_text, context, (this.params.debug === true));
	}
	
	public done_log(text:string, context='done')
			:void{
		this._go_previous();
		this.log(`${defaults.check_char} ${text}`, context);
	}
	
	public done_verbose_log(text:string, context='vdne')
			:void{
		this._go_previous();
		this.verbose_log(`${text}`, context);
	}
	
	public error_log(text:string, context='errr')
			:void{
		this.stop_loading();
		// const error_text = `${chalk.bgHex(`#4a3030`).hex(`#8b6666`)(`[ERROR] ${text}`)}`;
		// const error_text = `${chalk.hex(`#922424`)(`[ERROR] ${text}`)}`;
		const error_text = `${chalk.hex(`#874040`)(`[ERROR] ${text}`)}`;
		this.log(error_text, context);
	}
	
	public end_log(text:string)
			:void{
		this.stop_loading();
		const end_text = `${defaults.check_char} ${text}`;
		this.log((!this.params.blank) ? chalk.yellow(end_text) : end_text, 'end');
	}
	
	public wrong_end_log(text:string)
			:void{
		this.stop_loading();
		const end_text = `${defaults.wrong_char} ${text}`;
		this.log((!this.params.blank) ? chalk.red(end_text) : end_text, 'end');
	}
	
	public start_loading(text:string)
			:void{
		if(this.params.hide === true){
			return;
		}
		if(this.params.blank === true){
			spinner.color = 'white';
		}
		spinner_texts.push(text);
		this.spinner_text(text);
		if(this.params.spin === true && !spinner.isSpinning){
			spinner.start();
		}
	}
	
	public stop_loading()
			:void{
		spinner.stop();
	}
	
	public spinner_text(text:string)
			:void{
		spinner.text = this._spinner_text_color(text);
		if(spinner.text.length > process.stdout.columns){
			spinner.text = spinner.text.substr(0, process.stdout.columns - 4);
		}
	}
	
	private _log(text:string, context='log', out=false){
		const output_text = (!this.params.native) ?
			this._format_text(text, context) : text + '\n';
		if(this.params.filelog){
			_log_to_file(output_text);
		}
		if(out){
			let was_spinning = false;
			if(spinner.isSpinning){
				was_spinning = true;
				this.stop_loading();
			}
			if(this.params.hide === false){
				process.stdout.write(output_text);
			}
			if(this.params.spin === true && was_spinning){
				spinner.start();
			}
		}
	}
	
	private _format_text(text:string, context='frmt'){
		let time = dateFormat(new Date(), defaults.time_format);
		if(context.length < 4){
			context = context.padEnd(4,'_');
		}else if(context.length > 4){
			context = context.substr(0,4);
		}
		text = this._replace_root_string(text);
		const prefix = this.params.prefix;
		context = (this.params.context === true) ? `[${context}]` : '';
		time = (this.params.time === true) ? `[${time}]` : '';
		let text_lenght = 0;
		text_lenght += prefix.length;
		text_lenght += context.length;
		// eslint-disable-next-line no-control-regex
		text_lenght += text.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '').length;
		// eslint-disable-next-line no-control-regex
		const count_tabs = (text.match(new RegExp("\t", "g")) || []).length;
		text_lenght += count_tabs * 7;
		text_lenght += time.length;
		text_lenght += 1;
		if(this.params.context){
			text_lenght += 1;
		}
		if(this.params.time){
			text_lenght += 2;
		}
		if(this.params.fullwidth === true){
			const gap_lenght = process.stdout.columns - text_lenght;
			if(gap_lenght < 0 && gap_lenght > -9){
				time = time.replace(dateFormat(new Date, "yy-mm-dd'T'"), '');
				text_lenght -= 9;
			}else if(gap_lenght <= -9 && gap_lenght > -21){
				time = '';
				text_lenght -= 24;
			}else if(gap_lenght <= -21){
				time = '';
				let remain = process.stdout.columns + 2;
				if(this.params.blank === true){
					remain -= 19;
				}
				text = text.substr(0,remain) + '...';
				text_lenght = remain + 4;
				if(this.params.blank === true){
					text_lenght += 19;
				}
			}
		}
		let output_text = prefix;
		let dot = '.';
		if(this.params.blank === false){
			context = chalk.grey(context);
			text = chalk.green(text);
			dot = chalk.gray('.');
			time = chalk.blue(time);
		}
		if(this.params.fullwidth === true){
			output_text += context;
			if(context.length > 0){
				output_text += ' ';
			}
			output_text += text + ' ';
			for(let i = 0; i < process.stdout.columns - text_lenght; i++){
				output_text += dot;
			}
			if(time.length > 0){
				output_text += ' ';
			}
			output_text += time;
		}else{
			output_text += time;
			if(time.length > 0){
				output_text += ' ';
			}
			output_text += context;
			if(context.length > 0){
				output_text += ' ';
			}
			output_text += text + ' ';
		}
		output_text += `\n`;
		return output_text;
	}
	
	private _replace_root_string(str:string)
			:string{
		if(str.indexOf('$URNROOT$') !== -1){
			return str.replace('$URNROOT$','');
		}
		if(this.params.root == '.'){
			return str;
		}
		const regex = new RegExp(`${this.params.root}`, 'g');
		return str.replace(regex, 'ROOT');
	}
	
	private _spinner_text_color(text?:string):string{
		if(!text){
			return '';
		}
		return (this.params.blank === false) ? chalk.magenta(text) : text;
	}
	
	private _go_previous(){
		spinner_texts.pop();
		if(spinner_texts.length > 0){
			this.spinner_text(spinner_texts[spinner_texts.length - 1]);
		}
	}
	
}

function _log_to_file(text:string)
		:void{
	fs.appendFileSync(defaults.log_filepath, text);
}

export type OutputInstance = InstanceType<typeof Output>;

export function create(params: Params)
		:OutputInstance{
	// const full_params = merge_params(params);
	return new Output(params);
}

