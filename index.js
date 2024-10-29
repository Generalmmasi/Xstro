const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const { initSession } = require('./lib/session');

const app = express();
app.use(express.static('./media/web/express'));

async function readAndRequireFiles(directory) {
 const files = await fs.readdir(directory);
 return await Promise.all(
  files
   .filter((file) => path.extname(file) === '.js')
   .map(async (file) => {
    try {
     return require(path.join(directory, file));
    } catch (error) {
     console.error(`Error in file: ${path.join(directory, file)}\n${error.stack.split('\n')[1].trim()}`);
    }
   })
 );
}

async function initialize() {
 await readAndRequireFiles(path.join(__dirname, '/lib/core/'));
 await config.DATABASE.sync();
 await readAndRequireFiles(path.join(__dirname, '/plugins/'));
 await initSession(config.SESSION_ID.trim());
 const Client = require('./lib/client');
 const bot = new Client();
 bot.connect();
}

initialize();

app.listen(config.PORT, () => console.log(`DB SYNC`));
