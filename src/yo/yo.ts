import {window, StatusBarItem, StatusBarAlignment, OutputChannel} from 'vscode';
import {EOL} from 'os';
import * as _ from 'lodash';
import createEnvironment from './environment';
import EscapeException from '../utils/EscapeException';
const readPkgUp = require('read-pkg-up');
const semver = require('semver');
const elegantSpinner = require('elegant-spinner');
const figures = require('figures');

const frame = elegantSpinner();

export default class Yeoman {

	private _env: any;
	private _status: StatusBarItem;
	private _interval: any;
	private outChannel: OutputChannel;

	public constructor(options?: any) {
		this.outChannel = window.createOutputChannel('Yeoman');
		this._env = createEnvironment(this.outChannel, undefined, options);
		this._status = window.createStatusBarItem(StatusBarAlignment.Left);
		this._interval;
	}

	public getEnvironment(): any {
		return this._env;
	}

	public getGenerators(): any[] {
		const generatorsMeta = this._env.store.getGeneratorsMeta();

		// Remove sub generators from list
		let list = Object.keys(generatorsMeta).filter((key: any) => key.split(':')[1] === 'app');

		list = list.map(key => {
			const item = generatorsMeta[key];
			const name = key.split(':')[0];

			const pkgPath = readPkgUp.sync({cwd: item.resolved});
			if (!pkgPath.package) {
				return null;
			}

			const pkg = pkgPath.package;
			const generatorVersion: any = pkg.dependencies['yeoman-generator'];
			const generatorMeta: any = _.pick(pkg, 'name', 'version', 'description');

			// Ignore the generator if does not depend on `yeoman-generator`
			if (!generatorVersion) {
				return null;
			}

			// Flag generator to indicate if the generator version is fully supported or not.
			// https://github.com/yeoman/yeoman-app/issues/16#issuecomment-121054821
			generatorMeta.isCompatible = semver.ltr('0.17.6', generatorVersion);

			// Indicator to verify official generators
			generatorMeta.officialGenerator = false;
			if (generatorMeta.repository && generatorMeta.repository.url) {
				generatorMeta.officialGenerator = generatorMeta.repository.url.indexOf('github.com/yeoman/') > -1;
			}

			// Add subgenerators
			generatorMeta.subGenerators = Object.keys(generatorsMeta).reduce((result, key: any) => {
				const split = key.split(':');

				if (split[0] === name) {
					result.push(split[1]);
				}

				return result;
			}, []);

			return generatorMeta;
		});

		return _.compact(list);
	}

	public run(generator: string, cwd: string) {
		if (!cwd) {
			throw new Error('Please open a workspace directory first.');
		}

		process.chdir(cwd);

		const prefix = 'generator-';
		if (generator.indexOf(prefix) === 0) {
			generator = generator.slice(prefix.length);
		}

		// Generator.run API changed in yeoman-generator 3.0.0 
		// (https://github.com/yeoman/generator/commit/4f3c6e873b05f4839370d10bade5448efdbe8d77)
		// Before 3.0.0 it returned the generator instance and after 3.0.0 it returns a promise to the end of generation.
		// We support both.
		const generatorOrPromise = this._env.run(generator, this.done);
		if (generatorOrPromise instanceof Promise) { // newer versions - generatorOrPromise is a promise
			return generatorOrPromise.then(() => {
				this.clearState();
			}).catch((err: Error) => {
				if (!(err instanceof EscapeException)) {
					window.showErrorMessage(err.message);
					throw err;
				}
			});
		} else { // older versions - generatorOrPromise is instance of generator
			return new Promise((resolve, reject) => {
				generatorOrPromise
					.on('npmInstall', () => {
						this.setState('install node dependencies');
					})
					.on('bowerInstall', () => {
						this.setState('install bower dependencies');
					})
					.on('error', (err: Error) => {
						if (!(err instanceof EscapeException)) {
							window.showErrorMessage(err.message);
							reject(err);
						}
					})
					.on('end', () => {
						this.clearState();
					});
				resolve();
			});
		}
	}

	private setState(state: string) {
		console.log(state);

		this._status.show();
		this._status.tooltip = state;

		this._interval = setInterval(() => {
			this._status.text = `${frame()} yo`;
		}, 50);
	}

	private clearState() {
		this.outChannel.appendLine(`${EOL}${figures.tick} done`);
		clearInterval(this._interval);
		this._status.dispose();
	}

	private done(err) {
		if (err) {
			// handle error
		}
	}
}
