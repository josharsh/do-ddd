import { spawn } from 'child_process';
import * as path from 'path';

interface ProcessOptions {
	command: string;
	args?: string[];
	cwd?: string;
	onData?: (data: string) => void;
	onError?: (data: string) => void;
	onClose?: (code: any) => void;
}

class ProcessRunner {
	run(options: ProcessOptions) {
		const process = spawn(options.command, options.args, { cwd: options.cwd });

		process.stdout?.on('data', (data) => options.onData?.(data.toString()));
		process.stderr?.on('data', (data) => options.onError?.(data.toString()));
		process.on('close', (code) => options.onClose?.(code));
	}
}

export async function localDev() {
	console.log("Attempting to build project");
	try {
		await buildProject();
		console.log("Attempting to start server");
		await startLocalServer();
		console.log("Attempting to start local test app");
		startLocalWebApp();
	} catch (error) {
		console.error(error);
	}
}

function buildProject(): Promise<void> {
	return new Promise((resolve, reject) => {
		const runner = new ProcessRunner();
		runner.run({
			command: 'npm',
			args: ['run', 'build'],
			onData: (data) => console.log(data),
			onError: (data) => reject(data),
			onClose: (code) => code === 0 ? resolve() : reject(`Build exited with code ${code}`)
		});
	});
}

function startLocalServer(): Promise<void> {
	return new Promise((reject, resolve) => {
		const runner = new ProcessRunner();
		runner.run({
			command: 'npm',
			args: ['run', 'start'],
			onData: (data) => {
				console.log(data);
				// if (data.includes('started')) resolve();
			},
			onError: (data) => { 
				console.error(`Server Error: ${data}`)
				reject()
			},
			onClose: (code) => {
				console.log(`Server exited with code ${code}`) 
				resolve()
			}
		});
	});
}

function startLocalWebApp() {
	return new Promise((resolve) => {
		const webAppDir = path.join(__dirname, 'local-dev-app');
		const runner = new ProcessRunner();
		runner.run({
			command: 'npm',
			args: ['run', 'dev'],
			cwd: webAppDir,
			onData: (data) => console.log(`Local Testing Client: ${data}`),
			onError: (data) => console.error(`Local Testing Client: ${data}`),
			onClose: (code) => console.log(`Next.js app exited with code ${code}`)
		});
	});
}
