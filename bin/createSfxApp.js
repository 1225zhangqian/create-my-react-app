#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const envinfo = require('envinfo');
const cp = require('child_process');
const packageJson = require('../package.json');
const chalk = require('chalk');
const commander = require('commander');
const unpack = require('tar-pack').unpack;
const os = require('os');
const inquirer = require('inquirer')

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

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'sfx-template');

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
                Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari']
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

// Pack sfx-template.
// Don't redirect stdio as we want to capture the output that will be returned
// from execSync(). In this case it will be the .tgz filename.
console.log()
console.log('Pack sfx-template')
console.log()
const scriptsFileName = cp
    .execSync(`npm pack`, { cwd: path.join(packagesDir, 'template') })
    .toString()
    .trim();
const scriptsPath = path.join(packagesDir, 'template', scriptsFileName);

function customAppConfig(appName, appConfigJsonDir, appConfigJson) {

    return new Promise(resolve => {
        //   "PlatformUrl": "[Replace the url with baseUrl]",
        //   "AuthorityUrl": "[Replace the url with authentication url]",
        //   "ClientId": "[Replace the ClientId with your own solution ClientId]",
        //   "Scope": "[Replace the Scope with your own solution Scope]",
        //   "SolutionTitle": "[Replace the SolutionTitle with your own solution title]",
        //   "SolutionShortTitle": "[Replace the SolutionShortTitle with your own solution short title]",
        //   "AppVersion": "[Replace the AppVersion with your own solution version]"
        const question = [
            {
                name: "SolutionTitle",
                type: 'input',
                message: `Please input your solution title.`,
                default: appName,
            },
            {
                name: "SolutionShortTitle",
                type: 'input',
                message: `Please input your solution short title.`,
                default: appName,
            },
            {
                name: "AppVersion",
                type: 'input',
                message: `Please input your solution version.`,
                default: packageJson.version,
            },
            {
                name: "PlatformUrl",
                type: 'input',
                message: "Please input your plantformUrl as baseUrl. (https://xxx.xxx.xxx)",
                default: '[Replace the url with baseUrl]',
            },
            {
                name: "AuthorityUrl",
                type: 'input',
                message: "Please input your authentication url. (https://xxx.xxx.xxx)",
                default: '[Replace the url with authentication url]',
            },
            {
                name: "ClientId",
                type: 'input',
                message: "Please input your solution ClientId.",
                default: "[Replace the ClientId with your own solution ClientId]",
            },
            {
                name: "Scope",
                type: 'input',
                message: "Please input your solution scope.",
                default: '[Replace the Scope with your own solution Scope]',
            }
        ]

        inquirer
            .prompt(question).then(answers => {
                fs.writeFileSync(
                    path.join(appConfigJsonDir, 'app.config.json'),
                    JSON.stringify({ ...appConfigJson, ...answers }, 'utf-8', err => {
                        if (err) {
                            reject(err);
                        }
                    })
                );
                console.log('\n')
                console.log(chalk.green('init app.config.json successfully!\n'))
                console.log(chalk.grey('The latest app.config.json list is: \n'))
                console.log({ ...appConfigJson, ...answers })
                console.log('\n')
                resolve();
            })
    });

}

function createApp(projectName) {
    const root = path.resolve(projectName);
    const appName = path.basename(root);
    console.log()
    console.log(`Creating a new SFx React app in ${chalk.green(root)}.`);
    console.log()

    let packageJson = {
        name: appName,
    };
    // create a directory
    fs.mkdir(projectName, function (error) {
        if (error) {
            console.log(error);
            return false;
        }
    })
    //  unPack sfx-template into directory
    fs.createReadStream(scriptsPath).pipe(unpack(root)).on('error', function (err) {
        console.error(err.stack)
    }).on('close', function () {
        const json = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        packageJson = { ...json, ...packageJson }
        fs.writeFileSync(
            path.join(root, 'package.json'),
            JSON.stringify(packageJson, null, 2) + os.EOL
        );

        const appConfigJsonDir = path.join(root, 'public', 'config')
        const appConfigJson = JSON.parse(fs.readFileSync(path.join(appConfigJsonDir, 'app.config.json')))
        customAppConfig(appName, appConfigJsonDir, appConfigJson).then(() => {
            console.log()
            console.log('Installing packages. This might take a couple of minutes.');
            console.log()
            cp.execSync(
                `npm install"`,
                {
                    cwd: root,
                    stdio: 'inherit',
                }
            );

            console.log();
            console.log(`Success! Created ${appName} at ${root}`);
            console.log();
            console.log('We suggest that you begin by typing:');
            console.log();
            console.log(chalk.cyan('  cd'), root);
            console.log(`  ${chalk.cyan(`npm start`)}`);
        }).catch(err => {
            console.log(err)
        })
    })

}

module.exports = createApp(projectName)