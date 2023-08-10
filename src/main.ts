#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { analyzeFiles } from './analyzer';
import { generateFiles } from './generator';

yargs(hideBin(process.argv))
	.command(
		'generate',
		'Generate UseCase and Controller files',
		(yargs) => {
			return yargs
				.option('repos', {
					type: 'array',
					describe: 'Array of repository names'
					// demandOption: true // Optional: make it a required option
				})
				.option('services', {
					type: 'array',
					describe: 'Array of service names'
				})
				.option('require-async', {
					type: 'boolean',
					describe: 'Is it an async use case?'
				});
		},
		(argv) => {
			const verbIdentifier = analyzeFiles();
			if (verbIdentifier !== '') {
				generateFiles(verbIdentifier, argv.repos as string[]); // Access the "repos" argument
				console.log(
					`Generated ${verbIdentifier}UseCase.ts and ${verbIdentifier}Controller.ts`
				);
			} else {
				console.log(
					'Request/Response Types invalid / not found. Please check and try again'
				);
				return;
			}
		}
	)
	.help().argv;

yargs(hideBin(process.argv)).command(
	'say [message]',
	'echo a message',
	(yargs) => {
		yargs.positional('message', { type: 'string', describe: 'Message to echo' });
	},
	(argv) => {
		console.log(argv.message);
	}
).argv;
