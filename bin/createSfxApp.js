#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const packageJson = require('../package.json');
const chalk = require('chalk');
const commander = require('commander');
const unpack = require('tar-pack').unpack;
const os = require('os');

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'sfx-template');

console.log('Do not edit any package.json while this task is running.');

// Finally, pack react-scripts.
// Don't redirect stdio as we want to capture the output that will be returned
// from execSync(). In this case it will be the .tgz filename.
// https://mysite.com/my-custom-template-0.8.2.tgz
const scriptsFileName = cp
    .execSync(`npm pack`, { cwd: path.join(packagesDir, 'template') })
    .toString()
    .trim();
const scriptsPath = path.join(packagesDir, 'template', scriptsFileName);
// Now that we have packed them, call the global CLI.
cp.execSync('yarn cache clean');

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


function createApp(projectName) {
    const root = path.resolve(projectName);
    const appName = path.basename(root);
    console.log(`Creating a new React app in ${chalk.green(root)}.`);
    let packageJson = {
        name: appName,
    };

    fs.mkdir(projectName, function (error) {
        if (error) {
            console.log(error);
            return false;
        }
    })

    fs.createReadStream(scriptsPath).pipe(unpack(root)).on('error', function (err) {
        console.error(err.stack)
    }).on('close', function () {
        const json = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        packageJson = { ...json, ...packageJson }
        fs.writeFileSync(
            path.join(root, 'package.json'),
            JSON.stringify(packageJson, null, 2) + os.EOL
        );
    })
    install(root)

}

function install(root) {
    cp.execSync(
        `cd ${root}`
    );
    cp.execSync(
        `npm install`
    );
}
module.exports = createApp(projectName)