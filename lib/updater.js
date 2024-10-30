const { execSync } = require('child_process');
const config = require('../config');
const { commands } = require('./serialize');
const { version } = require('../package.json');

const getBranch = () => execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

const isLatest = () => {
 execSync('git fetch origin');
 const branch = getBranch();
 const local = execSync('git rev-parse HEAD').toString().trim();
 const remote = execSync(`git rev-parse origin/${branch}`).toString().trim();
 return local === remote ? 'Latest Patch' : 'outdated version';
};

const checkUpdates = () => console.log(isLatest() || 'Up to date');
const getUpdates = () => execSync('git fetch origin', { stdio: 'inherit' });
const updateNow = () => execSync(`git stash && git pull origin ${getBranch()}`, { stdio: 'inherit' });
const upgrade = () => execSync('npm install && npm update', { stdio: 'inherit' });

const Msg = `\`\`\`XSTRO MD V${version}\nPREFIX: ${config.PREFIX}\nPLUGINS: ${commands.length}\nMODE: ${config.MODE}\n${isLatest()}\`\`\``;

module.exports = { isLatest, checkUpdates, getUpdates, updateNow, upgrade, Msg };
