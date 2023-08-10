#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = require("yargs");
const helpers_1 = require("yargs/helpers");
const analyzer_1 = require("./analyzer");
const generator_1 = require("./generator");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('generate', 'Generate UseCase and Controller files', (yargs) => {
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
}, (argv) => {
    const verbIdentifier = (0, analyzer_1.analyzeFiles)();
    if (verbIdentifier !== '') {
        (0, generator_1.generateFiles)(verbIdentifier, argv.repos); // Access the "repos" argument
        console.log(`Generated ${verbIdentifier}UseCase.ts and ${verbIdentifier}Controller.ts`);
    }
    else {
        console.log('Request/Response Types invalid / not found. Please check and try again');
        return;
    }
})
    .help().argv;
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).command('say [message]', 'echo a message', (yargs) => {
    yargs.positional('message', { type: 'string', describe: 'Message to echo' });
}, (argv) => {
    console.log(argv.message);
}).argv;
