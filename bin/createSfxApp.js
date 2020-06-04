const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const packageJson = require('../package.json');
const chalk = require('chalk');
const commander = require('commander');

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const packagePathsByName = {};
fs.readdirSync(packagesDir).forEach(name => {
    const packageDir = path.join(packagesDir, name);
    const packageJson = path.join(packageDir, 'package.json');
    if (fs.existsSync(packageJson)) {
        packagePathsByName[name] = packageDir;
    }
});
Object.keys(packagePathsByName).forEach(name => {
    const packageJson = path.join(packagePathsByName[name], 'package.json');
    const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    Object.keys(packagePathsByName).forEach(otherName => {
        if (json.dependencies && json.dependencies[otherName]) {
            json.dependencies[otherName] = 'file:' + packagePathsByName[otherName];
        }
        if (json.devDependencies && json.devDependencies[otherName]) {
            json.devDependencies[otherName] = 'file:' + packagePathsByName[otherName];
        }
        if (json.peerDependencies && json.peerDependencies[otherName]) {
            json.peerDependencies[otherName] =
                'file:' + packagePathsByName[otherName];
        }
        if (json.optionalDependencies && json.optionalDependencies[otherName]) {
            json.optionalDependencies[otherName] =
                'file:' + packagePathsByName[otherName];
        }
    });

    fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
    console.log(
        'Replaced local dependencies in packages/' + name + '/package.json'
    );
});
console.log('Replaced all local dependencies for testing.');
console.log('Do not edit any package.json while this task is running.');

// Finally, pack react-scripts.
// Don't redirect stdio as we want to capture the output that will be returned
// from execSync(). In this case it will be the .tgz filename.
// https://mysite.com/my-custom-template-0.8.2.tgz
const scriptsFileName = cp
    .execSync(`npm pack`, { cwd: path.join(packagesDir, 'sfx-template') })
    .toString()
    .trim();

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

createApp(projectName, program.scriptsVersion);

function createApp(projectName) {
    // https://github.com/1225zhangqian/create-my-react-app?version=master&path=packages/sfx-template
    const scriptsPath = `${packageJson.repository.url}version=master&path=packages/sfx-template/${scriptsFileName}`

    // Now run the CRA command
    cp.execSync(
        `npx create-react-app ${projectName} --template "${scriptsPath}"`,
        {
            cwd: rootDir,
            stdio: 'inherit',
        }
    );
}
