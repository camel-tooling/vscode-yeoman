import * as path from 'path';
import CodeAdapter from './adapter';
import { OutputChannel } from 'vscode';
const yeoman = require('yeoman-environment');
const uniq = require('array-uniq');

const win32 = process.platform === 'win32';

export default function (outChannel: OutputChannel, args?: any[], opts?: any) {
	args = args || [];
	opts = opts || {};

	let env = yeoman.createEnv(args, opts, new CodeAdapter(outChannel));
	const envGetNpmPaths: Function = env.getNpmPaths;
	env.getNpmPaths = function (localOnly = false) {
		// Start with the local paths derived by cwd in vscode 
		// (as opposed to cwd of the plugin host process which is what is used by yeoman/environment)
		const localPaths = [];

		// Walk up the CWD and add `node_modules/` folder lookup on each level
		opts.cwd.split(path.sep).forEach((part, i, parts) => {
			let lookup = path.join(...parts.slice(0, i + 1), 'node_modules');

			if (!win32) {
				lookup = `/${lookup}`;
			}

			localPaths.push(lookup);
		});
		const defaultPaths = envGetNpmPaths.call(this, localOnly);
		
		return uniq(localPaths.concat(defaultPaths));
	};

	return env;
}
