#!/usr/bin/env node
const path = require('path');
const cp = require('child_process');
const packageJson = require('../package.json');
const chalk = require('chalk');
const commander = require('commander');

const rootDir = path.join(__dirname, '..');
// Now run the CRA command

let projectName;

const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
        projectName = name;
    })
    .option('--info', 'print environment debug info')
    .allowUnknownOption()
    .on('--help', () => {
        console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
        console.log();
    })
    .parse(process.argv);

if (program.info) {
    console.log(chalk.bold('\nEnvironment Info:'));
    console.log(
        `\n  current version of ${packageJson.name}: ${packageJson.version}`
    );
    console.log(`  running from ${__dirname}`);
    return envinfo
        .run(
            {
                System: ['OS', 'CPU'],
                Binaries: ['Node', 'npm'],
                Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari'],
                npmPackages: ['react', 'react-dom', 'react-scripts'],
                npmGlobalPackages: ['create-react-app'],
            },
            {
                duplicates: true,
                showNotFound: true,
            }
        )
        .then(console.log);
}

if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log(
        `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`);
    console.log();
    console.log(
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
}

createApp(projectName, program.scriptsVersion);

function createApp(projectName) {
    // https://github.com/1225zhangqian/create-my-react-app?version=master&path=create-my-react-app-1.0.2.tgz
    const scriptsPath = `https://github.com/1225zhangqian/create-my-react-app/raw/master/create-my-react-app-1.0.2.tgz`

    // Now run the CRA command
    cp.execSync(
        `npx create-react-app ${projectName} --template "${scriptsPath}"`,
        {
            cwd: rootDir,
            stdio: 'inherit',
        }
    );
}
