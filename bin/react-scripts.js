#!/usr/bin/env node
const cp = require('child_process');
var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split('.');
var major = semver[0];

if (major < 10) {
    console.error(
        'You are running Node ' +
        currentNodeVersion +
        '.\n' +
        'Create SFx App requires Node 10 or higher. \n' +
        'Please update your version of Node.'
    );
    process.exit(1);
}

const cleanup = () => {
    console.log('Cleaning up.');
    // Reset changes made to package.json files.
    cp.execSync(`git checkout -- packages/*/package.json`);
    // Uncomment when snapshot testing is enabled by default:
    // rm ./template/src/__snapshots__/App.test.js.snap
};

const handleExit = () => {
    cleanup();
    console.log('Exiting without error.');
    process.exit();
};

const handleError = e => {
    console.error('ERROR! An error was encountered while executing');
    console.error(e);
    cleanup();
    console.log('Exiting with error.');
    process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

console.log();
console.log('-------------------------------------------------------');
console.log('Assuming you have already run `yarn` to update the deps.');
console.log('If not, remember to do this before testing!');
console.log('-------------------------------------------------------');
console.log();

// Temporarily overwrite package.json of all packages in monorepo
// to point to each other using absolute file:/ URLs.

const gitStatus = cp.execSync(`git status --porcelain`).toString();

if (gitStatus.trim() !== '') {
    console.log('Please commit your changes before running this script!');
    console.log('Exiting because `git status` is not empty:');
    console.log();
    console.log(gitStatus);
    console.log();
    process.exit(1);
}
require('./createSfxApp.js');